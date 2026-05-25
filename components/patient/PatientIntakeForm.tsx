'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FieldLabel, REQUIRED, FormSuccessScreen } from '@/components/forms/FormPrimitives';
import type { ClinicBranding } from '@/app/p/intake/page';

const CONCERN_OPTIONS: { value: string; label: string }[] = [
  { value: 'pain_recovery', label: 'Pain & injury recovery' },
  { value: 'weight_metabolic', label: 'Weight & metabolic health' },
  { value: 'longevity', label: 'Longevity / healthy aging' },
  { value: 'cognitive', label: 'Cognitive & focus' },
  { value: 'sexual_health', label: 'Sexual health' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'hormone', label: 'Hormone optimization' },
  { value: 'gut_health', label: 'Gut health' },
  { value: 'skin_hair', label: 'Skin & hair' },
  { value: 'other', label: 'Other' },
];

const INPUT_CLASS = 'w-full rounded-lg px-3.5 py-2.5 text-sm';
const INPUT_STYLE: React.CSSProperties = {
  background: 'white',
  border: '1px solid var(--border)',
  color: 'var(--navy)',
};

export default function PatientIntakeForm({ clinic }: { clinic: ClinicBranding | null }) {
  const searchParams = useSearchParams();
  // White-label attribution. The page server-fetches the matching clinic
  // and passes it as a prop; we still read the raw slug from the URL so
  // we can attribute the intake server-side even when no matching clinic
  // is registered (the slug stays as a free-text hint for admin).
  const clinicSlugRaw = searchParams.get('clinic') ?? '';
  const clinicSlug = clinicSlugRaw.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64);
  // Clinician-specific share link: /p/intake?ref=<uuid> attributes the
  // intake to a specific clinician user. The server validates the UUID
  // shape and the DB FK enforces existence.
  const refRaw = searchParams.get('ref') ?? '';
  const referringUserId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(refRaw)
    ? refRaw.toLowerCase()
    : '';

  // Slice 4 — render the clinic's branding tokens (logo + primary/accent
  // hex). Server-fetched in /p/intake/page.tsx, so first paint is already
  // branded; no flash of unbranded content. Each token is independently
  // optional — a clinic with only a logo (no colors) still renders the
  // default PeptidePure palette.
  const brandPrimary = clinic?.brand_primary ?? null;
  const brandAccent = clinic?.brand_accent ?? null;
  const brandLogoUrl = clinic?.brand_logo_url ?? null;
  const clinicDisplayName = clinic?.name ?? null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [concerns, setConcerns] = useState<Set<string>>(new Set());
  const [currentPeptides, setCurrentPeptides] = useState('');
  const [goals, setGoals] = useState('');
  const [referringClinician, setReferringClinician] = useState('');
  const [consentResearch, setConsentResearch] = useState(false);
  const [consentContact, setConsentContact] = useState(false);
  const [hpField, setHpField] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const toggleConcern = (val: string) => {
    setConcerns((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  };

  const reset = () => {
    setName(''); setEmail(''); setPhone(''); setDob('');
    setConcerns(new Set()); setCurrentPeptides(''); setGoals('');
    setReferringClinician(''); setConsentResearch(false); setConsentContact(false);
    setHpField(''); setSubmitted(false); setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/patient-intakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          dateOfBirth: dob || undefined,
          primaryConcerns: Array.from(concerns),
          currentPeptides: currentPeptides || undefined,
          goals: goals || undefined,
          referringClinician: referringClinician || undefined,
          referringUserId: referringUserId || undefined,
          clinicSlug: clinicSlug || undefined,
          consentResearch,
          consentContact,
          hpField,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Submission failed');
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <FormSuccessScreen
        title="Thanks — your intake is in."
        message="We just emailed you a link to your patient portal. Click it to track your submission and see clinician follow-ups. A PeptidePure clinician will also review your intake within two business days."
        resetHref="/p/intake"
        onReset={reset}
      />
    );
  }

  // Slice 4 — derive the branded color set. brand_primary swaps in for the
  // form's accent border + section header; brand_accent swaps for the
  // "Referred via" pill background and the submit-button gradient. Falls
  // back to gold/navy when a clinic hasn't set its own palette. Build a
  // hex+alpha rgba() helper so the pill background mirrors the existing
  // 8% gold-pale tint exactly.
  const accent = brandAccent ?? 'var(--gold)';
  const primary = brandPrimary ?? 'var(--navy)';
  const hexToRgba = (hex: string | null, alpha: number) => {
    if (!hex) return null;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };
  const pillBg = hexToRgba(brandAccent, 0.08) ?? 'var(--gold-pale)';
  const pillBorder = hexToRgba(brandAccent, 0.3) ?? 'rgba(200,149,44,0.3)';

  return (
    <section className="py-10" style={{ background: 'var(--off-white)' }}>
      <div className="container-xl max-w-3xl">
        {/* Clinic logo strip — only renders when the registered clinic
            uploaded a logo. Sits above the "Referred via" pill so the
            patient immediately recognizes the clinic, then sees who's
            handling their intake. PeptidePure clinical-team co-branding
            stays in the section header below. */}
        {brandLogoUrl && (
          <div
            className="mb-6 px-5 py-4 rounded-2xl bg-white flex items-center gap-4"
            style={{ border: '1px solid var(--border)', borderTop: `3px solid ${primary}` }}
          >
            <div className="relative h-12 w-32 shrink-0">
              <Image
                src={brandLogoUrl}
                alt={`${clinicDisplayName ?? clinicSlug} logo`}
                fill
                sizes="128px"
                className="object-contain object-left"
              />
            </div>
            {clinicDisplayName && (
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
                  Patient portal
                </p>
                <p className="text-sm font-semibold truncate" style={{ color: primary }}>
                  {clinicDisplayName}
                </p>
              </div>
            )}
          </div>
        )}

        {clinicSlug && (
          <div
            className="mb-6 px-4 py-3 rounded-lg text-xs"
            style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: 'var(--text-mid)' }}
          >
            Referred via <strong style={{ color: primary }}>{clinicDisplayName ?? clinicSlug}</strong>. Your intake will be routed to that clinic.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 sm:p-8 bg-white"
          style={{ border: '1px solid var(--border)' }}
        >
          {/* Honeypot — visually hidden but in the DOM. Bots fill it; humans don't. */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', height: 0, width: 0, overflow: 'hidden' }}>
            <label>
              Leave this field empty
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={hpField}
                onChange={(e) => setHpField(e.target.value)}
              />
            </label>
          </div>

          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--navy)' }}>About you</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-light)' }}>
            We use this to match you with the right clinician and protocol focus.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <FieldLabel required>Full name</FieldLabel>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className={INPUT_CLASS} style={INPUT_STYLE}
              />
            </div>
            <div>
              <FieldLabel required>Email</FieldLabel>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className={INPUT_CLASS} style={INPUT_STYLE}
              />
            </div>
            <div>
              <FieldLabel>Phone</FieldLabel>
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className={INPUT_CLASS} style={INPUT_STYLE}
              />
            </div>
            <div>
              <FieldLabel>Date of birth</FieldLabel>
              <input
                type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                className={INPUT_CLASS} style={INPUT_STYLE}
              />
            </div>
          </div>

          <div className="mb-5">
            <FieldLabel>Primary concerns (select all that apply)</FieldLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {CONCERN_OPTIONS.map((c) => {
                const active = concerns.has(c.value);
                return (
                  <label
                    key={c.value}
                    className="flex items-center gap-2.5 cursor-pointer rounded-lg px-3 py-2 transition-colors"
                    style={{
                      background: active ? 'var(--gold-pale)' : 'var(--off-white)',
                      border: active ? '1px solid var(--gold)' : '1px solid var(--border)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleConcern(c.value)}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-mid)' }}>{c.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mb-5">
            <FieldLabel>Current peptides or medications (if any)</FieldLabel>
            <textarea
              rows={3}
              value={currentPeptides}
              onChange={(e) => setCurrentPeptides(e.target.value)}
              placeholder="e.g. BPC-157 250 mcg SQ daily, Tirz 5 mg weekly, sertraline 50 mg"
              className={INPUT_CLASS} style={INPUT_STYLE}
            />
          </div>

          <div className="mb-5">
            <FieldLabel>What are you trying to achieve?</FieldLabel>
            <textarea
              rows={3}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="What does success look like for you in the next 90 days?"
              className={INPUT_CLASS} style={INPUT_STYLE}
            />
          </div>

          <div className="mb-6">
            <FieldLabel>Referring clinician (optional)</FieldLabel>
            <input
              type="text"
              value={referringClinician}
              onChange={(e) => setReferringClinician(e.target.value)}
              placeholder="Name or email of the clinician who sent you here"
              className={INPUT_CLASS} style={INPUT_STYLE}
            />
          </div>

          <hr style={{ borderColor: 'var(--border)', margin: '1.5rem 0' }} />

          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--navy)' }}>Consents</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-light)' }}>
            Both consents are required to submit your intake. You can revoke either at any time.
          </p>

          <label className="flex items-start gap-3 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentContact}
              onChange={(e) => setConsentContact(e.target.checked)}
              className="mt-1"
              required
            />
            <span className="text-sm" style={{ color: 'var(--text-mid)' }}>
              {REQUIRED} I agree to be contacted by the PeptidePure clinical team about my intake.
            </span>
          </label>

          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={consentResearch}
              onChange={(e) => setConsentResearch(e.target.checked)}
              className="mt-1"
              required
            />
            <span className="text-sm" style={{ color: 'var(--text-mid)' }}>
              {REQUIRED} I consent to my de-identified data being used in
              {' '}<Link href="/irb-consent" target="_blank" className="underline" style={{ color: 'var(--gold)' }}>
                IRB-aligned research
              </Link>{' '}
              to improve protocol outcomes.
            </span>
          </label>

          {error && (
            <div
              className="text-sm px-4 py-3 rounded-xl mb-4"
              style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', color: '#DC2626' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !consentContact || !consentResearch}
            className="btn-primary w-full sm:w-auto"
            style={{
              opacity: submitting || !consentContact || !consentResearch ? 0.6 : 1,
              // Slice 4 — when a clinic has set its primary brand color,
              // swap the button to that color so the CTA matches the rest
              // of the white-label palette. Default `.btn-primary` styling
              // takes over when no brand color is set.
              ...(brandPrimary ? { background: brandPrimary, color: 'white' } : {}),
            }}
          >
            {submitting ? 'Submitting…' : 'Submit intake'}
          </button>

          <p className="text-xs mt-4" style={{ color: 'var(--text-light)' }}>
            By submitting, you agree to our{' '}
            <Link href="/privacy" className="underline" style={{ color: 'var(--gold)' }}>Privacy Policy</Link>
            {' '}and{' '}
            <Link href="/terms" className="underline" style={{ color: 'var(--gold)' }}>Terms</Link>.
          </p>
        </form>
      </div>
    </section>
  );
}
