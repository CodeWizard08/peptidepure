'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import BrandedLogo from '@/components/patient/BrandedLogo';
import PatientSherpa from '@/components/patient/PatientSherpa';
import DosingLogForm from '@/components/patient/DosingLogForm';
import CheckInForm from '@/components/patient/CheckInForm';
import PatientLogHistory from '@/components/patient/PatientLogHistory';
import { readableTextOn } from '@/lib/brand';

type IntakeRow = {
  id: string;
  created_at: string;
  status: 'new' | 'contacted' | 'archived';
  name: string;
  primary_concerns: string[];
  goals: string | null;
  current_peptides: string | null;
  reviewed_at: string | null;
  clinic_slug: string | null;
};

type ClinicBranding = {
  name: string;
  slug: string;
  brand_primary: string | null;
  brand_accent: string | null;
  brand_logo_url: string | null;
};

const STATUS_COPY: Record<IntakeRow['status'], { label: string; color: string; bg: string; description: string }> = {
  new: {
    label: 'Awaiting review',
    color: '#1E40AF',
    bg: '#DBEAFE',
    description: 'A PeptidePure clinician will review your submission within two business days.',
  },
  contacted: {
    label: 'Clinician contacted you',
    color: '#065F46',
    bg: '#D1FAE5',
    description: 'A clinician has reached out by email. Check your inbox for follow-up details.',
  },
  archived: {
    label: 'Archived',
    color: '#4B5563',
    bg: '#F3F4F6',
    description: 'This intake has been archived. Submit a new one any time at /p/intake.',
  },
};

const CONCERN_LABELS: Record<string, string> = {
  pain_recovery: 'Pain & recovery',
  weight_metabolic: 'Weight & metabolic',
  longevity: 'Longevity',
  cognitive: 'Cognitive',
  sexual_health: 'Sexual health',
  sleep: 'Sleep',
  hormone: 'Hormone',
  gut_health: 'Gut health',
  skin_hair: 'Skin & hair',
  other: 'Other',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PatientDashboard({
  email,
  intakes,
  clinic,
}: {
  email: string;
  intakes: IntakeRow[];
  clinic: ClinicBranding | null;
}) {
  const router = useRouter();
  const [newLogs, setNewLogs] = useState<{ id: string; created_at: string; peptide_name: string; dose_amount: string; route: string; side_effects: string[] }[]>([]);
  const [newCheckIns, setNewCheckIns] = useState<{ id: string; created_at: string; energy_level: number; sleep_quality: number; mood: number; pain_level: number; weight_lbs: number | null; notes: string | null; goals_progress: string | null }[]>([]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  // Slice 4 — use the clinic's brand_primary as the dashboard header
  // background, brand_accent as the "Patient Portal" eyebrow color, and
  // render the clinic logo + name at the top. Falls back to default
  // PeptidePure framing when no clinic branding is present.
  //
  // Codex review (f): hard-coding white text on `brand_primary` broke
  // contrast for clinics with light brand colors. readableTextOn picks
  // black-on-light vs white-on-dark using YIQ luminance. PeptidePure
  // default navy → white text; arbitrary clinic palette → readable.
  const headerBg = clinic?.brand_primary ?? 'var(--navy)';
  const accent = clinic?.brand_accent ?? 'var(--gold)';
  const onHeaderText = clinic?.brand_primary ? readableTextOn(clinic.brand_primary) : '#ffffff';

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      {clinic && (() => {
        // Codex review (f): chip/button background and border are derived
        // from onHeaderText so a light brand_primary doesn't render a
        // light tint that's invisible. Dark header → light tint; light
        // header → dark tint.
        const isDarkHeader = onHeaderText === '#ffffff';
        const chipBg = isDarkHeader ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
        const chipBorder = isDarkHeader ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)';
        const logoSlotBg = isDarkHeader ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
        return (
        <div
          className="py-8"
          style={{ background: headerBg, color: onHeaderText, borderBottom: `3px solid ${accent}` }}
        >
          <div className="container-xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 min-w-0">
              {clinic.brand_logo_url && (
                <div
                  className="relative h-12 w-32 shrink-0 rounded-lg px-3 py-2"
                  style={{ background: logoSlotBg }}
                >
                  <BrandedLogo
                    src={clinic.brand_logo_url}
                    alt={`${clinic.name} logo`}
                    fill
                    sizes="128px"
                    className="object-contain object-left p-2"
                    // Codex review (a): unallowlisted host or 404 falls
                    // back to text-only so the header band stays intact.
                    fallback={
                      <span
                        className="text-sm font-bold flex items-center h-full px-2"
                        style={{ color: onHeaderText }}
                      >
                        {clinic.name}
                      </span>
                    }
                  />
                </div>
              )}
              <div className="min-w-0">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: accent }}
                >
                  Patient portal
                </p>
                <p className="text-lg font-semibold truncate" style={{ color: onHeaderText }}>
                  {clinic.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
              style={{ background: chipBg, color: onHeaderText, border: `1px solid ${chipBorder}` }}
            >
              Sign out
            </button>
          </div>
        </div>
        );
      })()}
      <div className="py-8" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container-xl flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="section-label" style={{ color: accent }}>
              {clinic ? `Welcome to your ${clinic.name} portal` : 'Patient Portal'}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold mt-1" style={{ color: 'var(--navy)' }}>
              Welcome back
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
              Signed in as <strong style={{ color: 'var(--navy)' }}>{email}</strong>
            </p>
          </div>
          {!clinic && (
            // Show the sign-out button here only when there's no branded
            // header above (which has its own sign-out). Avoids two
            // sign-out buttons stacked when a clinic is set.
            <button
              onClick={handleSignOut}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
              style={{
                background: 'white',
                color: 'var(--text-mid)',
                border: '1px solid var(--border)',
              }}
            >
              Sign out
            </button>
          )}
        </div>
      </div>

      <div className="container-xl py-10 max-w-4xl">
        {intakes.length === 0 ? (
          <EmptyIntakeState email={email} />
        ) : (
          <div className="space-y-6">
            {intakes.map((intake) => (
              <IntakeCard key={intake.id} intake={intake} />
            ))}
          </div>
        )}

        {/* Slice 6 — dosing logs + check-ins. Collapsible forms so the
            dashboard doesn't feel overwhelming; patients expand when ready. */}
        <div className="mt-8 space-y-4">
          <DosingLogForm onLogged={(entry) => setNewLogs((prev) => [entry, ...prev])} />
          <CheckInForm onCheckedIn={(entry) => setNewCheckIns((prev) => [entry, ...prev])} />
        </div>

        <PatientLogHistory newLogs={newLogs} newCheckIns={newCheckIns} />

        {/* Patient-side Sherpa — Slice 5. Grounded in TCD content only,
            patient-friendly tone. */}
        <div className="mt-8">
          <PatientSherpa />
        </div>

        <div
          className="rounded-2xl p-6 mt-8"
          style={{ background: 'white', border: '1px solid var(--border)' }}
        >
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--navy)' }}>
            What happens next
          </h2>
          <ol className="text-sm leading-relaxed space-y-2" style={{ color: 'var(--text-mid)' }}>
            <li>
              <strong style={{ color: 'var(--navy)' }}>1.</strong>{' '}
              A licensed clinician reviews your intake within 2 business days.
            </li>
            <li>
              <strong style={{ color: 'var(--navy)' }}>2.</strong>{' '}
              They reach out by email with a recommended protocol or to schedule a consult.
            </li>
            <li>
              <strong style={{ color: 'var(--navy)' }}>3.</strong>{' '}
              Once a protocol is assigned (coming soon), you'll see dosing schedules and
              follow-up check-ins here.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function IntakeCard({ intake }: { intake: IntakeRow }) {
  const status = STATUS_COPY[intake.status];

  return (
    <div
      className="rounded-2xl p-6 md:p-7"
      style={{ background: 'white', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-light)' }}>
            Intake submitted {fmtDate(intake.created_at)}
          </p>
          <h2 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>
            Your submission
          </h2>
        </div>
        <span
          className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full whitespace-nowrap"
          style={{ background: status.bg, color: status.color }}
        >
          {status.label}
        </span>
      </div>

      <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-mid)' }}>
        {status.description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
        <DetailRow label="Name" value={intake.name} />
        {intake.clinic_slug && <DetailRow label="Referred via" value={intake.clinic_slug} />}
        {intake.primary_concerns.length > 0 && (
          <DetailRow
            label="Primary concerns"
            value={intake.primary_concerns.map((c) => CONCERN_LABELS[c] ?? c).join(', ')}
            wide
          />
        )}
        {intake.goals && <DetailRow label="Your goals" value={intake.goals} wide multiline />}
        {intake.current_peptides && (
          <DetailRow label="Current peptides" value={intake.current_peptides} wide multiline />
        )}
      </div>

      {/* admin_notes panel intentionally removed — Codex rescue review
          (NEW-1): the admin UI labels that field "Admin notes" and used
          it for internal clinician-team notes, but the patient-side
          dashboard was rendering it as "From your clinician." Names + intent
          diverged, leaking internal notes to patients. If we ever want a
          true patient-message field, a future slice should add a separate
          `patient_visible_notes` column with explicit semantics. */}
    </div>
  );
}

function DetailRow({
  label,
  value,
  wide,
  multiline,
}: {
  label: string;
  value: string;
  wide?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-light)' }}>
        {label}
      </p>
      <p
        className="text-sm wrap-break-word"
        style={{
          color: 'var(--navy)',
          whiteSpace: multiline ? 'pre-wrap' : undefined,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyIntakeState({ email }: { email: string }) {
  return (
    <div
      className="rounded-2xl p-8 text-center"
      style={{ background: 'white', border: '1px solid var(--border)' }}
    >
      <div
        className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'var(--off-white)' }}
      >
        <svg className="w-7 h-7" style={{ color: 'var(--text-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--navy)' }}>
        No intake on file for {email}
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-light)' }}>
        You're signed in, but we don't have an intake associated with this email address yet.
        Submit one now to get a clinician's review.
      </p>
      <Link href="/p/intake" className="btn-primary text-sm">
        Submit an intake
      </Link>
    </div>
  );
}
