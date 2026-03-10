'use client';

import { useState } from 'react';
import Link from 'next/link';

const FIELD_COLOR = 'var(--navy)';
const LABEL_COLOR = 'var(--text-mid)';
const REQUIRED = <span style={{ color: 'var(--gold)' }}>*</span>;

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold mb-1.5" style={{ color: FIELD_COLOR }}>
      {children}{required && <> {REQUIRED}</>}
    </label>
  );
}

function RadioGroup({ name, options, required }: { name: string; options: string[]; required?: boolean }) {
  return (
    <div className="space-y-2.5 mt-1">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
          <input type="radio" name={name} value={opt} required={required} />
          <span className="text-sm" style={{ color: LABEL_COLOR }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({ name, options }: { name: string; options: string[] }) {
  return (
    <div className="space-y-2.5 mt-1">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" name={name} value={opt} />
          <span className="text-sm" style={{ color: LABEL_COLOR }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function Divider() {
  return <hr style={{ borderColor: 'var(--border)', margin: '0.5rem 0' }} />;
}

export default function TreatmentLogPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    fd.forEach((value, key) => {
      if (data[key]) {
        const existing = data[key];
        data[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
      } else {
        data[key] = value;
      }
    });

    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'treatment-log', data }),
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
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--off-white)' }}>
        <div className="text-center max-w-md px-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(200,149,44,0.1)', border: '2px solid var(--gold)' }}
          >
            <svg className="w-8 h-8" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--navy)' }}>Form Submitted</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-mid)' }}>
            Your IRB Treatment Log has been received. Thank you for your documentation.
          </p>
          <Link href="/forms/treatment-log" onClick={() => setSubmitted(false)} className="btn-primary">
            Submit Another
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      {/* Page header */}
      <div className="py-12" style={{ background: 'var(--navy)' }}>
        <div className="container-xl">
          <div className="flex items-center gap-2 mb-3">
            <Link
              href="/forms/treatment-log"
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--gold)' }}
            >
              Clinical Forms
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-white">IRB — Treatment Log</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Per-visit treatment record for investigational peptide protocol participants.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="py-12">
        <div className="container-xl">
          <div className="mx-auto">
            <div
              className="bg-white rounded-2xl shadow-sm p-8 md:p-10"
              style={{ border: '1px solid var(--border)' }}
            >
              <p className="text-xs mb-8" style={{ color: 'var(--text-light)' }}>
                <span style={{ color: 'var(--gold)' }}>**</span> indicates required fields
              </p>

              <form onSubmit={handleSubmit} className="irb-form space-y-6">

                {/* Provider & visit info */}
                <div>
                  <FieldLabel required>Provider Name</FieldLabel>
                  <input type="text" name="providerName" required placeholder="Full name" />
                </div>
                <div>
                  <FieldLabel required>Clinic Name</FieldLabel>
                  <input type="text" name="clinicName" required placeholder="Practice or clinic name" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel required>Date of Submission</FieldLabel>
                    <input type="date" name="dateSubmission" required />
                  </div>
                  <div>
                    <FieldLabel required>Date of Visit</FieldLabel>
                    <input type="date" name="dateVisit" required />
                  </div>
                </div>

                <div>
                  <FieldLabel required>Patient ID / Initials</FieldLabel>
                  <input type="text" name="patientId" required placeholder="e.g. JD-001" />
                </div>

                <Divider />

                {/* Treatment details */}
                <div>
                  <FieldLabel required>Product Code / Name</FieldLabel>
                  <input type="text" name="productCode" required placeholder="e.g. BPC-157" />
                </div>
                <div>
                  <FieldLabel required>Dose Administered</FieldLabel>
                  <input type="text" name="doseAdministered" required placeholder="e.g. 250 mcg" />
                </div>

                <div>
                  <FieldLabel required>Route</FieldLabel>
                  <RadioGroup name="route" options={['SC', 'IM', 'Oral']} required />
                </div>

                <div>
                  <FieldLabel required>Injection Site</FieldLabel>
                  <RadioGroup name="injectionSite" options={['Abdomen', 'Thigh', 'Arm', 'Other']} required />
                </div>

                <Divider />

                {/* Tolerance & observations */}
                <div>
                  <FieldLabel required>Immediate Tolerance</FieldLabel>
                  <CheckboxGroup
                    name="immediateTolerance"
                    options={['Well tolerated', 'Mild irritation', 'Mild nausea', 'Dizziness', 'Other']}
                  />
                </div>

                <div>
                  <FieldLabel>Provider Notes <span className="font-normal text-xs" style={{ color: 'var(--text-light)' }}>(optional)</span></FieldLabel>
                  <textarea name="providerNotes" placeholder="Clinical observations, patient-reported feedback..." />
                </div>

                <div>
                  <FieldLabel required>Any Concerning Symptoms?</FieldLabel>
                  <RadioGroup name="concerningSymptoms" options={['No', 'Yes']} required />
                </div>

                <Divider />

                {/* Follow-up */}
                <div>
                  <FieldLabel>Return Visit Planned</FieldLabel>
                  <RadioGroup name="returnVisit" options={['Yes', 'No']} />
                </div>
                <div>
                  <FieldLabel>Dose Adjustment Planned</FieldLabel>
                  <RadioGroup name="doseAdjustment" options={['Yes', 'No']} />
                </div>
                <div>
                  <FieldLabel>Next Steps Notes</FieldLabel>
                  <textarea name="nextStepsNotes" placeholder="Any planned changes, referrals, or follow-up instructions..." />
                </div>

                <Divider />

                {/* Attestation & signature */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="attestation" required style={{ marginTop: '2px' }} />
                    <span className="text-sm leading-relaxed" style={{ color: LABEL_COLOR }}>
                      I confirm this treatment was administered according to IRB investigational-use protocol and the
                      patient was monitored appropriately. {REQUIRED}
                    </span>
                  </label>
                </div>

                <div>
                  <FieldLabel required>Provider Signature</FieldLabel>
                  <input type="text" name="providerSignature" required placeholder="Type full name as signature" />
                </div>
                <div style={{ maxWidth: '14rem' }}>
                  <FieldLabel required>Signature Date</FieldLabel>
                  <input type="date" name="signatureDate" required />
                </div>

                {error && (
                  <div className="p-4 rounded-xl text-sm" style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
