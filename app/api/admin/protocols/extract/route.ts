import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { isAuthenticated } from '@/lib/admin-auth';

// System prompt MUST match scripts/extract-protocol-metadata.ts so the admin
// "Extract structured metadata" button produces the same shape as the bulk run.
const SYSTEM_PROMPT = `You are a clinical content engineer. You receive the title, summary, peptides, and long-form markdown body of a peptide protocol, and you produce a structured JSON metadata object that drives a rich protocol detail page (modeled on pep-pedia.org).

You output ONLY valid JSON — no commentary, no markdown fence, no preamble. The JSON must match this TypeScript shape:

{
  subtitle?: string,
  tags?: string[],
  meta: {
    typical_dose?: { value: string, detail?: string },
    route?: { value: string, detail?: string },
    cycle?: { value: string, detail?: string },
    storage?: { value: string, detail?: string },
    key_benefits?: string,
    mechanism_short?: string,
    quick_start?: Array<{ label: string, value: string }>,
    molecular?: { weight?: string, length?: string, type?: string, sequence?: string, footnote?: string },
    pharmacokinetics?: { peak?: string, half_life?: string, cleared?: string, peak_day?: number, half_life_days?: number, total_days?: number, source_label?: string },
    indications?: Array<{ name: string, effectiveness?: "MOST EFFECTIVE" | "EFFECTIVE" | "EMERGING" | "MIXED", items: Array<{ title: string, detail: string }> }>,
    dosing_table?: Array<{ goal: string, dose: string, frequency: string, route: string }>,
    dosing_timing_note?: string,
    interactions?: Array<{ peptide: string, classification: "AVOID" | "MONITOR" | "SYNERGISTIC" | "COMPATIBLE", note?: string }>,
    reconstitution?: Array<{ step: number, description: string }>,
    reconstitution_warning?: string,
    quality_indicators?: Array<{ type: "pass" | "warn" | "fail", title: string, description: string }>,
    what_to_expect?: string[],
    side_effects?: { side_effects: string[], when_to_stop: string[] },
    references?: Array<{ title: string, tags?: string[], summary: string }>
  }
}

Critical rules:
- Output a single JSON object, parseable by JSON.parse, with no trailing prose.
- Use clinical accuracy. Omit fields rather than fabricating numbers.
- For stack protocols, omit molecular_info and pharmacokinetics — those apply to single peptides.
- For pharmacokinetics, provide all three numeric fields (peak_day, half_life_days, total_days) or omit pharmacokinetics entirely.
- For tags: include therapy area, route, and regulatory status ("FDA Approved", "Investigational").
- For subtitle: "[Receptor / Mechanism class] | [Primary indications]". Under 100 chars.
- Use Sema / Tirz / Reta (house style).
- No emojis.`;

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 });
  }

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const supabase = getAdminSupabase();
  const { data: protocol, error: lookupErr } = await supabase
    .from('protocols')
    .select('id, slug, title, category, summary, peptides, body_md')
    .eq('id', body.id)
    .single();
  if (lookupErr || !protocol) {
    return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
  }
  if (!protocol.body_md || protocol.body_md.length < 300) {
    return NextResponse.json({ error: 'Body content too short — draft the body first' }, { status: 400 });
  }

  const userPrompt = [
    `Generate structured metadata JSON for this protocol.`,
    ``,
    `**Title:** ${protocol.title}`,
    `**Category:** ${protocol.category ?? 'General'}`,
    protocol.summary ? `**Summary:** ${protocol.summary}` : null,
    `**Peptides:** ${(protocol.peptides ?? []).join(', ') || '(none specified)'}`,
    ``,
    `**Existing long-form body for extraction (markdown):**`,
    `<body>`,
    protocol.body_md.slice(0, 30_000),
    `</body>`,
    ``,
    `Return only the JSON object. No prose, no markdown fence, no commentary.`,
  ]
    .filter((s) => s !== null)
    .join('\n');

  try {
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create(
      {
        model: 'claude-opus-4-7',
        max_tokens: 8000,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'high' },
        system: [
          { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        ],
        messages: [{ role: 'user', content: userPrompt }],
      },
      { signal: AbortSignal.timeout(120_000) },
    );

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()
      .replace(/^```(?:json)?\s*/, '')
      .replace(/\s*```$/, '');

    let parsed: { subtitle?: string; tags?: string[]; meta: object };
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Claude returned invalid JSON', raw: text.slice(0, 800) }, { status: 502 });
    }
    if (!parsed.meta || typeof parsed.meta !== 'object') {
      return NextResponse.json({ error: 'Response missing meta field' }, { status: 502 });
    }

    const update: Record<string, unknown> = { protocol_meta: parsed.meta };
    if (typeof parsed.subtitle === 'string') update.subtitle = parsed.subtitle;
    if (Array.isArray(parsed.tags)) update.tags = parsed.tags.filter((t) => typeof t === 'string');

    const { data: updated, error: updErr } = await supabase
      .from('protocols')
      .update(update)
      .eq('id', body.id)
      .select('*')
      .single();
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    revalidatePath('/protocols');
    if (protocol.slug) revalidatePath(`/protocols/${protocol.slug}`);

    return NextResponse.json({
      protocol: updated,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_read_input_tokens: response.usage.cache_read_input_tokens,
      },
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: 'Claude rate-limited' }, { status: 429 });
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `Claude error ${err.status}: ${err.message}` }, { status: 502 });
    }
    console.error('[admin/protocols/extract]', err);
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 });
  }
}
