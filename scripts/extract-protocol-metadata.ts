/**
 * Extract pep-pedia-style structured metadata for each protocol using Claude.
 *
 * For every published protocol (or all with EXTRACT_ALL=1):
 *   1. Read title, summary, peptides, body_md from Supabase.
 *   2. Prompt Claude to produce a JSON object matching ProtocolMeta (lib/protocols/types.ts).
 *   3. Save into protocols.protocol_meta + protocols.subtitle + protocols.tags.
 *
 * Idempotent. Re-runs replace the metadata for each protocol it processes.
 * To target one protocol: SLUG=bpc-157-gi-healing npm run extract-protocol-metadata
 *
 * Cost: ~$5-8 for 100 protocols. Each prompt yields ~3-4k JSON output tokens.
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import path from 'path';

loadEnv({ path: path.join(process.cwd(), '.env.local') });

type ProtocolRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  summary: string | null;
  peptides: string[];
  body_md: string;
  status: string;
};

const SYSTEM_PROMPT = `You are a clinical content engineer. You receive the title, summary, peptides, and long-form markdown body of a peptide protocol, and you produce a structured JSON metadata object that drives a rich protocol detail page (modeled on pep-pedia.org).

You output ONLY valid JSON — no commentary, no markdown fence, no preamble. The JSON must match this TypeScript shape:

{
  subtitle?: string,                         // e.g. "Dual GIP/GLP-1 Receptor Agonist | Weight Loss & Diabetes"
  tags?: string[],                           // e.g. ["Injectable", "FDA Approved", "Weight Loss"]
  meta: {
    typical_dose?: { value: string, detail?: string },
    route?: { value: string, detail?: string },
    cycle?: { value: string, detail?: string },
    storage?: { value: string, detail?: string },

    key_benefits?: string,                   // 1-2 sentences for the right side card
    mechanism_short?: string,                // 1-2 sentences for the right side card

    quick_start?: Array<{ label: string, value: string }>,  // 6-8 items
    molecular?: {
      weight?: string, length?: string, type?: string,
      sequence?: string, footnote?: string
    },
    pharmacokinetics?: {
      peak?: string, half_life?: string, cleared?: string,
      peak_day?: number, half_life_days?: number, total_days?: number,
      source_label?: string
    },
    indications?: Array<{
      name: string,                          // e.g. "Weight Loss"
      effectiveness?: "MOST EFFECTIVE" | "EFFECTIVE" | "EMERGING" | "MIXED",
      items: Array<{ title: string, detail: string }>
    }>,
    dosing_table?: Array<{
      goal: string, dose: string, frequency: string, route: string
    }>,
    dosing_timing_note?: string,
    interactions?: Array<{
      peptide: string,
      classification: "AVOID" | "MONITOR" | "SYNERGISTIC" | "COMPATIBLE",
      note?: string
    }>,
    reconstitution?: Array<{ step: number, description: string }>,   // 8-12 steps
    reconstitution_warning?: string,
    quality_indicators?: Array<{
      type: "pass" | "warn" | "fail",
      title: string, description: string
    }>,
    what_to_expect?: string[],               // 6-10 bullets
    side_effects?: {
      side_effects: string[],                // 5-7 bullets
      when_to_stop: string[]                 // 4-6 symptoms
    },
    references?: Array<{
      title: string,
      tags?: string[],                       // e.g. ["72-week duration", "n=938"]
      summary: string
    }>
  }
}

Critical rules:
- Output a single JSON object, parseable by JSON.parse, with no trailing prose.
- Use clinical accuracy. When the body_md doesn't specify a value (e.g. molecular weight), draw from established clinical knowledge for that peptide. If a fact is unknown or not applicable for a stack-style protocol, OMIT the field rather than fabricating a number.
- For stack protocols (multi-peptide combinations), molecular_info and pharmacokinetics may be omitted entirely — those make sense only for single-peptide pages. Provide them only when the protocol centers on one peptide.
- For pharmacokinetics: peak_day, half_life_days, total_days are numbers (the rendered chart uses them). Provide all three or omit pharmacokinetics entirely.
- For "tags": include therapy area (e.g. "Weight Loss"), route (e.g. "Injectable" / "Oral"), and regulatory status if applicable ("FDA Approved", "Investigational").
- For "subtitle": format as "[Receptor / Mechanism class] | [Primary indications]". Keep it under 100 chars.
- For interactions: include 5-10 peptides that commonly co-prescribe with this one. Use SYNERGISTIC for combos that boost effect, MONITOR where caution but not contraindicated, AVOID for true contraindications.
- For reconstitution: write 8-12 numbered steps. Skip this field for purely oral peptides.
- For dosing_table: 4-8 rows covering different goals (initiation, optimization, maintenance, etc.) or patient populations.
- For references: cite real published trials when known (SURMOUNT, STEP, etc.). If you can't cite specific trials, omit references rather than inventing them.
- For Sema / Tirz / Reta — use those names (not the full chemical names) per Peptide Pure house style.
- No emojis. No "it is important to note that".`;

async function extractOne(
  anthropic: Anthropic,
  p: ProtocolRow,
): Promise<{ subtitle?: string; tags?: string[]; meta: object } | null> {
  const userPrompt = [
    `Generate structured metadata JSON for this protocol.`,
    ``,
    `**Title:** ${p.title}`,
    `**Category:** ${p.category ?? 'General'}`,
    p.summary ? `**Summary:** ${p.summary}` : null,
    `**Peptides:** ${p.peptides.join(', ') || '(none specified)'}`,
    ``,
    `**Existing long-form body for extraction (markdown):**`,
    `<body>`,
    p.body_md.slice(0, 30_000),
    `</body>`,
    ``,
    `Return only the JSON object. No prose, no markdown fence, no commentary.`,
  ]
    .filter((s) => s !== null)
    .join('\n');

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 8000,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'high' },
        system: [
          { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        ],
        messages: [{ role: 'user', content: userPrompt }],
      });

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();

      if (!text) {
        lastError = new Error(`Empty response (stop_reason=${response.stop_reason})`);
        await new Promise((r) => setTimeout(r, 3000 * attempt));
        continue;
      }

      // Tolerate stray code fences from Claude even when told not to.
      const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();

      let parsed: { subtitle?: string; tags?: string[]; meta: object };
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        lastError = parseErr;
        console.log(`  ↻ ${p.slug}: JSON parse failed on attempt ${attempt} (${(parseErr as Error).message})`);
        await new Promise((r) => setTimeout(r, 2000 * attempt));
        continue;
      }

      if (!parsed.meta || typeof parsed.meta !== 'object') {
        lastError = new Error('Response missing "meta" field');
        continue;
      }
      return parsed;
    } catch (err) {
      lastError = err;
      if (err instanceof Anthropic.RateLimitError) {
        console.log(`  … rate limited (attempt ${attempt}), sleeping 60s`);
        await new Promise((r) => setTimeout(r, 60_000));
      } else if (err instanceof Anthropic.APIError && err.status >= 500) {
        console.log(`  … server error ${err.status} (attempt ${attempt}), sleeping 15s`);
        await new Promise((r) => setTimeout(r, 15_000));
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`  ✗ ${p.slug}: non-retryable error: ${msg}`);
        return null;
      }
    }
  }
  console.log(`  ✗ ${p.slug}: gave up after 3 attempts: ${lastError instanceof Error ? lastError.message : lastError}`);
  return null;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY missing in .env.local');
    process.exit(1);
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase env vars missing.');
    process.exit(1);
  }

  const anthropic = new Anthropic();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  const extractAll = process.env.EXTRACT_ALL === '1';
  const targetSlug = process.env.SLUG;
  const skipExisting = process.env.SKIP_EXISTING === '1';

  let query = supabase
    .from('protocols')
    .select('id, slug, title, category, summary, peptides, body_md, status, protocol_meta');
  if (!extractAll) query = query.eq('status', 'published');
  if (targetSlug) query = query.eq('slug', targetSlug);

  const { data, error } = await query;
  if (error) {
    console.error('Lookup failed:', error.message);
    process.exit(1);
  }
  const all = (data ?? []) as Array<ProtocolRow & { protocol_meta: Record<string, unknown> }>;
  const protocols = skipExisting
    ? all.filter((p) => !p.protocol_meta || Object.keys(p.protocol_meta).length === 0)
    : all;

  if (!protocols.length) {
    console.log('Nothing to extract.');
    return;
  }

  console.log(`Extracting metadata for ${protocols.length} protocol(s)…`);

  let ok = 0, failed = 0;
  for (let i = 0; i < protocols.length; i++) {
    const p = protocols[i];
    const num = `[${String(i + 1).padStart(3, '0')}/${protocols.length}]`;
    console.log(`${num} ${p.slug}`);

    const extracted = await extractOne(anthropic, p);
    if (!extracted) { failed++; continue; }

    const update: Record<string, unknown> = { protocol_meta: extracted.meta };
    if (typeof extracted.subtitle === 'string') update.subtitle = extracted.subtitle;
    if (Array.isArray(extracted.tags)) {
      update.tags = extracted.tags.filter((t) => typeof t === 'string');
    }

    const { error: updErr } = await supabase
      .from('protocols')
      .update(update)
      .eq('id', p.id);

    if (updErr) {
      console.log(`  ✗ ${p.slug}: db update failed: ${updErr.message}`);
      failed++;
      continue;
    }
    console.log(`  ✓ ${p.slug}`);
    ok++;
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\nDone. ${ok} succeeded · ${failed} failed.`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
