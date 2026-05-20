import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { isAuthenticated } from '@/lib/admin-auth';

// System prompt is frozen content — first in the rendered prefix, cached
// for ~90% cost reduction on the 2nd+ protocol draft within 5 minutes.
const SYSTEM_PROMPT = `You are a senior clinical writer authoring peptide protocols for licensed clinicians on the Peptide Pure Research Network — an IRB-aligned observational registry sourcing exclusively from 503A/503B compounding pharmacies.

Audience: MDs, DOs, NPs, PAs, NDs, and other licensed prescribers. Write at a clinical-research level. Cite mechanism of action where well-established. Be honest about evidence gaps.

Required structure (use markdown):

## Overview
2-3 paragraphs framing the protocol's clinical goal, target patient profile, and what the peptide stack accomplishes together.

## Peptide Components
For each peptide, write a paragraph or short list covering: dose/strength, route, frequency, half-life, and primary mechanism. Keep concise but specific.

## Synergy & Mechanism
Why these peptides are combined. What downstream pathways they share or complement.

## Clinical Considerations
- Recommended baseline labs / biomarkers
- Monitoring cadence
- Common adverse events to counsel patients on
- Absolute and relative contraindications
- Drug interactions of note

## Suggested Dosing Schedule
A pragmatic schedule (e.g. "Week 1: BPC-157 250mcg SC bid; TB-500 2.5mg SC twice weekly...") that a clinician can adapt. Make it actionable, not theoretical.

## Expected Outcomes & Timeline
Realistic expectations at 4, 8, and 12 weeks. Acknowledge inter-individual variability.

## Evidence Notes
Brief honest summary of the evidence quality (peer-reviewed RCT, observational, mechanistic, case series). Flag where the protocol is empirical or off-label.

## Disclaimer
Always end with: "Protocol provided for clinician education under IRB-aligned observational research framework. Not FDA-approved for the indications discussed. Individualize dosing based on patient context; this is not medical advice."

Style:
- Use Sema / Tirz / Reta (not Semaglutide / Tirzepatide / Retatrutide) for Eli Lilly / Novo Nordisk avoidance.
- No emojis. No sycophantic phrases. No "it is important to note that".
- When uncertain about a specific dose, write a range and flag it.
- Markdown only — no HTML.`;

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured on this deployment' },
      { status: 503 },
    );
  }

  let body: { title?: string; summary?: string; peptides?: string[]; category?: string; instructions?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const title = (body.title ?? '').trim();
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

  const peptides = Array.isArray(body.peptides) ? body.peptides.filter((p) => typeof p === 'string') : [];
  const category = (body.category ?? '').trim() || 'General';
  const summary = (body.summary ?? '').trim();
  const instructions = (body.instructions ?? '').trim();

  const userPrompt = [
    `Draft the protocol for: **${title}**`,
    ``,
    `**Category:** ${category}`,
    summary ? `**Clinical summary the page already shows:** ${summary}` : null,
    peptides.length > 0 ? `**Peptides in this stack:**\n${peptides.map((p) => `- ${p}`).join('\n')}` : null,
    instructions ? `**Additional instructions from the clinician editor:**\n${instructions}` : null,
    ``,
    `Write the full protocol body in markdown, following the required structure exactly. Do not repeat the page title — start at the "## Overview" heading.`,
  ]
    .filter((s) => s !== null)
    .join('\n');

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high' },
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Extract text blocks only — thinking blocks are returned as well but the
    // admin wants the prose, not the reasoning trace.
    const markdown = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    if (!markdown) {
      return NextResponse.json(
        { error: 'Claude returned no text — refusal or empty response', stop_reason: response.stop_reason },
        { status: 502 },
      );
    }

    return NextResponse.json({
      markdown,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_read_input_tokens: response.usage.cache_read_input_tokens,
        cache_creation_input_tokens: response.usage.cache_creation_input_tokens,
      },
      stop_reason: response.stop_reason,
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: 'Claude rate-limited — retry in a moment' }, { status: 429 });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY invalid or revoked' }, { status: 401 });
    }
    if (err instanceof Anthropic.APIError) {
      console.error('[protocols/draft] Anthropic API error', err);
      return NextResponse.json({ error: `Claude error ${err.status}: ${err.message}` }, { status: 502 });
    }
    console.error('[protocols/draft]', err);
    return NextResponse.json({ error: 'Failed to draft protocol' }, { status: 500 });
  }
}
