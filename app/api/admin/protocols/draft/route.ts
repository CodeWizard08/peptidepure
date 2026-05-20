import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { isAuthenticated } from '@/lib/admin-auth';

// Two parallel system prompts — clinician (default) and patient. Each is
// marked with cache_control so repeated drafts hit the prompt cache.
const CLINICIAN_SYSTEM_PROMPT = `You are a senior clinical writer authoring peptide protocols for licensed clinicians on the Peptide Pure Research Network — an IRB-aligned observational registry sourcing exclusively from 503A/503B compounding pharmacies.

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

const PATIENT_SYSTEM_PROMPT = `You are a clinician-supervised patient educator writing a friendly, plain-language summary of a peptide protocol for patients.

Audience: a curious, motivated patient with a smartphone — not a doctor. Eighth-grade reading level. Warm, direct, honest tone. Skip the medical jargon (and if you must use a word like "subcutaneous," define it once in parentheses on first use).

This is content the patient's doctor will hand them — so the doctor's voice still comes through. It explains WHAT the protocol does, WHY it's being prescribed, WHAT to expect day-to-day, and WHEN to call the office.

Required structure (use markdown):

## What This Protocol Is For
2-3 short paragraphs: what condition or goal the protocol addresses, in everyday language. Talk about results the patient cares about (energy, recovery, weight, mood, sleep) — not biochemistry.

## What You'll Be Taking
Plain English for each peptide: nickname, what it does in one sentence, how often you'll take it. NO mechanism-of-action paragraphs.

## How to Use It
Step-by-step. Reconstitution if relevant (short, with the "ask the office" reminder). Injection or oral instructions. Storage. What time of day. With or without food. Skip-a-dose guidance.

## What to Expect
Realistic timeline (week 1, week 4, week 8, week 12) — what changes the patient should notice. Use "you'll likely notice / some people notice / give it the full N weeks" framing rather than guaranteed outcomes.

## Common Side Effects
The 3-5 most common, with the "what to do if you notice this" guidance for each. Plain language ("upset stomach" not "GI distress"). Reassure where appropriate that mild side effects usually settle within 1-2 weeks.

## When to Call the Office
Specific symptoms that mean stop and call. Make this easy to scan — short bullet list.

## A Note About This Protocol
Two sentences. Honest framing: this is supervised through Peptide Pure's research network, not FDA-approved for these uses, your doctor is monitoring you, this is not a magic bullet.

## Questions for Your Next Visit
3-4 thoughtful questions the patient can bring up at their next visit — encourages partnership and follow-up.

Style:
- Second person ("you"). Friendly but professional.
- Use Sema / Tirz / Reta (not the brand names like Ozempic, Mounjaro, Wegovy, or Zepbound, and not the full chemical names).
- No emojis. No "Don't worry!" / "Amazing!" / sycophancy.
- Avoid scaring the patient — but be honest. If something is investigational, say so once, simply.
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

  let body: { title?: string; summary?: string; peptides?: string[]; category?: string; instructions?: string; audience?: 'clinician' | 'patient' };
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
  const audience = body.audience === 'patient' ? 'patient' : 'clinician';
  const systemPrompt = audience === 'patient' ? PATIENT_SYSTEM_PROMPT : CLINICIAN_SYSTEM_PROMPT;

  const firstHeading = audience === 'patient' ? '## What This Protocol Is For' : '## Overview';
  const userPrompt = [
    `Draft the protocol for: **${title}**`,
    ``,
    `**Category:** ${category}`,
    summary ? `**Short summary the patient/clinician will already see at the top of the page:** ${summary}` : null,
    peptides.length > 0 ? `**Peptides in this stack:**\n${peptides.map((p) => `- ${p}`).join('\n')}` : null,
    instructions ? `**Additional instructions from the editor:**\n${instructions}` : null,
    ``,
    `Write the full protocol body in markdown for the ${audience === 'patient' ? 'PATIENT' : 'CLINICIAN'} audience, following the required structure exactly. Do not repeat the page title — start at the "${firstHeading}" heading.`,
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
          text: systemPrompt,
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
