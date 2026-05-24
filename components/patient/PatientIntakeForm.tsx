'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FieldLabel, REQUIRED, FormSuccessScreen } from '@/components/forms/FormPrimitives';

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

export default function PatientIntakeForm() {
  const searchParams = useSearchParams();
  // White-label attribution. Clinicians share /p/intake?clinic=<slug> so we
  // know which clinic referred the patient. Normalize to lowercase + strip
  // anything that isn't a-z, 0-9, dash, or underscore.
  const clinicSlugRaw = searchParams.get('clinic') ?? '';
  const clinicSlug = clinicSlugRaw.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64);
  // Clinician-specific share link: /p/intake?ref=<uuid> attributes the
  // intake to a specific clinician user. The server validates the UUID
  // shape and the DB FK enforces existence.
  const refRaw = searchParams.get('ref') ?? '';
  const referringUserId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(refRaw)
    ? refRaw.toLowerCase()
    : '';

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

  return (
    <section className="py-10" style={{ background: 'var(--off-white)' }}>
      <div className="container-xl max-w-3xl">
        {clinicSlug && (
          <div
            className="mb-6 px-4 py-3 rounded-lg text-xs"
            style={{ background: 'var(--gold-pale)', border: '1px solid rgba(200,149,44,0.3)', color: 'var(--text-mid)' }}
          >
            Referred via <strong style={{ color: 'var(--navy)' }}>{clinicSlug}</strong>. Your intake will be routed to that clinic.
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
            style={{ opacity: submitting || !consentContact || !consentResearch ? 0.6 : 1 }}
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
