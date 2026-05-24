import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAdminNotification } from '@/lib/email';
import { slidingWindowLimit, getClientIp } from '@/lib/rate-limit';

// Service-role client for the public intake. The form is open to the
// internet, so there's no user session to authorize the insert against —
// instead we validate inputs strictly in this route and bypass RLS via
// the service-role key. Matches the pattern in /api/admin/*. The key
// never leaves the server: this module is server-only.
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type IntakeBody = {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  primaryConcerns?: string[];
  currentPeptides?: string;
  goals?: string;
  referringClinician?: string;
  // UUID of the clinician whose /p/intake?ref=<id> link the patient used.
  // Validated against the UUID shape only; the FK constraint at the DB
  // layer handles the existence check.
  referringUserId?: string;
  clinicSlug?: string;
  consentResearch?: boolean;
  consentContact?: boolean;
  // Honeypot field — bots tend to fill every input. Real users can't see it
  // (CSS-hidden on the form). If populated, we silently 201 without inserting.
  hpField?: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Slightly stricter than the previous /^[^\s@]+@[^\s@]+\.[^\s@]+$/ which
// accepted "a@b.c". Requires a TLD ≥ 2 chars and at least one character
// before the "@". Not RFC 5322 — that's a tarpit — but rejects the most
// common clinically-meaningless typos before we email the address.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Re-submission window: if the same email submitted within this window,
// roll the existing row instead of creating a new one. Stops admin queue
// from filling with refresh-clicks while still letting genuine repeat
// intakes through after the window elapses.
const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

// Rate limits — Codex rescue review #4 (HIGH): public intake had no
// abuse layer. Per-IP catches single-source spam; the global circuit
// breaker catches distributed/IP-rotating attacks and saves us from the
// admin queue / email tier getting buried during one.
const RL_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RL_PER_IP_MAX = 5;
const RL_GLOBAL_MAX = 200;

const ALLOWED_CONCERNS = new Set([
  'pain_recovery',
  'weight_metabolic',
  'longevity',
  'cognitive',
  'sexual_health',
  'sleep',
  'hormone',
  'gut_health',
  'skin_hair',
  'other',
]);

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function intakeAdminHtml(intake: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  primaryConcerns: string[];
  currentPeptides: string | null;
  goals: string | null;
  referringClinician: string | null;
  clinicSlug: string | null;
}): string {
  const row = (label: string, value: string | null) =>
    value
      ? `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:13px;vertical-align:top">${esc(label)}</td><td style="padding:6px 0;color:#0B1F3A;font-size:14px;white-space:pre-wrap">${esc(value)}</td></tr>`
      : '';
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px">
      <div style="background:#0B1F3A;padding:20px 24px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:18px">New Patient Intake</h1>
        <p style="color:#C8952C;margin:4px 0 0;font-size:12px">PeptidePure&#8482;</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <table style="width:100%;border-collapse:collapse">
          ${row('Name', intake.name)}
          ${row('Email', intake.email)}
          ${row('Phone', intake.phone)}
          ${row('DOB', intake.dateOfBirth)}
          ${row('Primary concerns', intake.primaryConcerns.join(', '))}
          ${row('Current peptides', intake.currentPeptides)}
          ${row('Goals', intake.goals)}
          ${row('Referring clinician', intake.referringClinician)}
          ${row('Clinic (white-label)', intake.clinicSlug)}
          ${row('Intake ID', intake.id)}
        </table>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  let body: IntakeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Honeypot first — bots that fall for it get a free 201 without consuming
  // either rate-limit slot. Codex rescue review round 2 (#4 follow-up):
  // earlier ordering let honeypot-fooled bots burn the global 200/hr cap
  // and DoS legitimate patients with 429s.
  if (body.hpField && body.hpField.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  // Rate limit cheap-fail-fast against abuse. Per-IP and global limits run
  // in parallel. Fail-open if Upstash isn't configured (dev) or errors
  // (transient outage); the alternative would block legitimate patients
  // during a hard-to-observe failure.
  const ip = getClientIp(request.headers);
  const [perIp, global] = await Promise.all([
    slidingWindowLimit({ key: `rl:intake:ip:${ip}`, max: RL_PER_IP_MAX, windowMs: RL_WINDOW_MS }),
    slidingWindowLimit({ key: 'rl:intake:global', max: RL_GLOBAL_MAX, windowMs: RL_WINDOW_MS }),
  ]);
  if (!perIp.allowed || !global.allowed) {
    const retrySeconds = Math.ceil(Math.max(perIp.retryAfterMs, global.retryAfterMs) / 1000);
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      {
        status: 429,
        headers: retrySeconds > 0 ? { 'Retry-After': String(retrySeconds) } : undefined,
      }
    );
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (!body.consentResearch || !body.consentContact) {
    return NextResponse.json(
      { error: 'Both consents are required to submit your intake.' },
      { status: 400 }
    );
  }

  const concerns = (body.primaryConcerns ?? [])
    .filter((c): c is string => typeof c === 'string' && ALLOWED_CONCERNS.has(c));

  const dateOfBirth = body.dateOfBirth && /^\d{4}-\d{2}-\d{2}$/.test(body.dateOfBirth)
    ? body.dateOfBirth
    : null;

  const referringUserId = body.referringUserId && UUID_RE.test(body.referringUserId)
    ? body.referringUserId.toLowerCase()
    : null;

  // Normalize clinic_slug to the same shape the client-side form enforces
  // (lowercase, [a-z0-9_-], 64-char cap). Codex rescue review round 2 — the
  // service-role insert bypasses RLS, so without server-side normalization
  // a direct POST could store arbitrary unbounded text + smuggle that into
  // the admin notification subject/body.
  const clinicSlug = body.clinicSlug
    ? body.clinicSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64) || null
    : null;

  const supabase = getAdminSupabase();

  // Dedupe: if the same email submitted within the dedupe window AND that
  // row is still in the 'new' status, return 200 with the existing id
  // rather than stacking duplicates. Codex rescue review (MEDIUM): silent
  // dupes inflate the admin queue and skew clinician attribution.
  const dedupeSince = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();
  const { data: existingDupe } = await supabase
    .from('patient_intakes')
    .select('id')
    .eq('email', email)
    .eq('status', 'new')
    .gte('created_at', dedupeSince)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingDupe?.id) {
    return NextResponse.json({ id: existingDupe.id, deduped: true }, { status: 200 });
  }

  const { data: intake, error } = await supabase
    .from('patient_intakes')
    .insert({
      name,
      email,
      phone: body.phone?.trim() || null,
      date_of_birth: dateOfBirth,
      primary_concerns: concerns,
      current_peptides: body.currentPeptides?.trim() || null,
      goals: body.goals?.trim() || null,
      referring_clinician: body.referringClinician?.trim() || null,
      referring_user_id: referringUserId,
      clinic_slug: clinicSlug,
      consent_research: true,
      consent_contact: true,
    })
    .select('id')
    .single();

  if (error || !intake) {
    console.error('Patient intake insert failed:', error);
    return NextResponse.json({ error: 'Could not save your intake. Please try again.' }, { status: 500 });
  }

  // Fire-and-forget admin notification. Uses the already-normalized
  // clinicSlug so a malicious raw payload can't smuggle markup or
  // unbounded text into the subject line / HTML body.
  sendAdminNotification(
    `New patient intake from ${name}${clinicSlug ? ` (${clinicSlug})` : ''}`,
    intakeAdminHtml({
      id: intake.id,
      name,
      email,
      phone: body.phone?.trim() || null,
      dateOfBirth,
      primaryConcerns: concerns,
      currentPeptides: body.currentPeptides?.trim() || null,
      goals: body.goals?.trim() || null,
      referringClinician: body.referringClinician?.trim() || null,
      clinicSlug,
    })
  );

  return NextResponse.json({ id: intake.id }, { status: 201 });
}
