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

function ScaleSelector({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="flex gap-2 mt-1.5 flex-wrap">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <label key={n} className="cursor-pointer">
            <input type="radio" name={name} value={n} required={required} className="sr-only peer" />
            <span
              className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border peer-checked:text-white transition-colors"
              style={{
                borderColor: 'var(--border)',
                color: LABEL_COLOR,
              }}
            >
              {n}
            </span>
            <style>{`
              input[name="${name}"]:checked + span {
                background: var(--navy) !important;
                border-color: var(--navy) !important;
                color: white !important;
              }
            `}</style>
          </label>
        ))}
      </div>
      <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-light)' }}>
        <span>None</span>
        <span>Worst possible</span>
      </div>
    </div>
  );
}

export default function OutcomesFormPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reporterType, setReporterType] = useState<'provider' | 'patient' | ''>('');

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
        body: JSON.stringify({ formType: 'outcomes', data }),
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
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--navy)' }}>Outcomes Submitted</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-mid)' }}>
            Your outcomes report has been received. Thank you for your contribution to our clinical data.
          </p>
          <Link href="/forms/outcomes" onClick={() => setSubmitted(false)} className="btn-primary">
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
              href="/forms/outcomes"
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--gold)' }}
            >
              Clinical Forms
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-white">Patient Outcomes Report</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Capture treatment outcomes, side effects, and overall response for peptide protocols.
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

                {/* Reporter type */}
                <div>
                  <FieldLabel required>I am a</FieldLabel>
                  <div className="space-y-2.5 mt-1">
                    {(['provider', 'patient'] as const).map((type) => (
                      <label key={type} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="reporterType"
                          value={type}
                          required
                          onChange={() => setReporterType(type)}
                        />
                        <span className="text-sm" style={{ color: LABEL_COLOR }}>
                          {type === 'provider' ? 'Provider / Clinician' : 'Patient'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Conditional fields based on reporter type */}
                {reporterType === 'provider' && (
                  <>
                    <div>
                      <FieldLabel required>Provider Name</FieldLabel>
                      <input type="text" name="providerName" required placeholder="Full name" />
                    </div>
                    <div>
                      <FieldLabel required>Clinic Name</FieldLabel>
                      <input type="text" name="clinicName" required placeholder="Practice or clinic name" />
                    </div>
                    <div>
                      <FieldLabel required>Provider Email</FieldLabel>
                      <input type="email" name="providerEmail" required placeholder="you@clinic.com" />
                    </div>
                  </>
                )}

                {reporterType === 'patient' && (
                  <>
                    <div>
                      <FieldLabel required>Patient Initials</FieldLabel>
                      <input type="text" name="patientInitials" required placeholder="e.g. JD" style={{ maxWidth: '10rem' }} />
                    </div>
                    <div>
                      <FieldLabel>Email (optional)</FieldLabel>
                      <input type="email" name="patientEmail" placeholder="you@email.com" />
                    </div>
                  </>
                )}

                {reporterType && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <FieldLabel required>Date of Report</FieldLabel>
                        <input type="date" name="dateReport" required />
                      </div>
                      <div>
                        <FieldLabel required>Patient ID / Initials</FieldLabel>
                        <input type="text" name="patientId" required placeholder="e.g. JD-001" />
                      </div>
                    </div>

                    <Divider />

                    {/* Treatment info */}
                    <div>
                      <FieldLabel required>Product / Peptide Used</FieldLabel>
                      <input type="text" name="productUsed" required placeholder="e.g. BPC-157, TB-500" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <FieldLabel required>Dose</FieldLabel>
                        <input type="text" name="dose" required placeholder="e.g. 500 mcg" />
                      </div>
                      <div>
                        <FieldLabel required>Route</FieldLabel>
                        <RadioGroup name="route" options={['SC', 'IM', 'Oral']} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <FieldLabel required>Treatment Duration</FieldLabel>
                        <input type="text" name="treatmentDuration" required placeholder="e.g. 4 weeks" />
                      </div>
                      <div>
                        <FieldLabel required>Frequency</FieldLabel>
                        <input type="text" name="frequency" required placeholder="e.g. Daily, 3x/week" />
                      </div>
                    </div>

                    <Divider />

                    {/* Outcomes */}
                    <h3 className="text-base font-bold" style={{ color: 'var(--navy)' }}>Treatment Outcomes</h3>

                    <div>
                      <FieldLabel required>Primary Condition Treated</FieldLabel>
                      <CheckboxGroup
                        name="conditionTreated"
                        options={[
                          'Musculoskeletal injury',
                          'Chronic pain',
                          'Tendon & ligament repair',
                          'Metabolic / weight management',
                          'GI / inflammation',
                          'Hormonal optimization',
                          'Cognitive / neurological',
                          'Sexual health',
                          'Other',
                        ]}
                      />
                    </div>

                    <div>
                      <FieldLabel required>Overall Improvement</FieldLabel>
                      <RadioGroup
                        name="overallImprovement"
                        options={[
                          'Significant improvement',
                          'Moderate improvement',
                          'Slight improvement',
                          'No change',
                          'Worsened',
                        ]}
                        required
                      />
                    </div>

                    <ScaleSelector name="painBefore" label="Pain Level — Before Treatment" required />
                    <ScaleSelector name="painAfter" label="Pain Level — After Treatment" required />

                    <div>
                      <FieldLabel required>Functional Improvement</FieldLabel>
                      <RadioGroup
                        name="functionalImprovement"
                        options={[
                          'Significant — returned to full activity',
                          'Moderate — improved daily function',
                          'Mild — some improvement noted',
                          'No change',
                          'Declined',
                        ]}
                        required
                      />
                    </div>

                    <div>
                      <FieldLabel>Time to First Noticeable Improvement</FieldLabel>
                      <RadioGroup
                        name="timeToImprovement"
                        options={[
                          'Within 1 week',
                          '1–2 weeks',
                          '2–4 weeks',
                          '4–8 weeks',
                          '8+ weeks',
                          'No improvement noted',
                        ]}
                      />
                    </div>

                    <Divider />

                    {/* Side effects */}
                    <h3 className="text-base font-bold" style={{ color: 'var(--navy)' }}>Side Effects</h3>

                    <div>
                      <FieldLabel required>Did the patient experience any side effects?</FieldLabel>
                      <RadioGroup name="hadSideEffects" options={['No', 'Yes']} required />
                    </div>

                    <div>
                      <FieldLabel>Side Effects Experienced (select all that apply)</FieldLabel>
                      <CheckboxGroup
                        name="sideEffects"
                        options={[
                          'Injection site redness / irritation',
                          'Injection site pain / swelling',
                          'Nausea',
                          'Headache',
                          'Dizziness / lightheadedness',
                          'Fatigue / drowsiness',
                          'Flushing / warmth',
                          'Appetite changes',
                          'Sleep disturbances',
                          'GI discomfort / bloating',
                          'Skin reaction / rash',
                          'Water retention / edema',
                          'Mood changes',
                          'Other',
                        ]}
                      />
                    </div>

                    <div>
                      <FieldLabel>Side Effect Severity</FieldLabel>
                      <RadioGroup
                        name="sideEffectSeverity"
                        options={['Mild — did not affect daily activities', 'Moderate — some impact on daily activities', 'Severe — significantly affected daily activities']}
                      />
                    </div>

                    <div>
                      <FieldLabel>Side Effect Duration</FieldLabel>
                      <RadioGroup
                        name="sideEffectDuration"
                        options={['< 24 hours', '1–3 days', '3–7 days', '1–2 weeks', 'Ongoing']}
                      />
                    </div>

                    <div>
                      <FieldLabel>Was the product discontinued due to side effects?</FieldLabel>
                      <RadioGroup name="discontinuedDueToSideEffects" options={['No', 'Yes']} />
                    </div>

                    <Divider />

                    {/* Satisfaction & notes */}
                    <h3 className="text-base font-bold" style={{ color: 'var(--navy)' }}>Overall Satisfaction</h3>

                    <div>
                      <FieldLabel required>Patient Satisfaction</FieldLabel>
                      <RadioGroup
                        name="patientSatisfaction"
                        options={[
                          'Very satisfied',
                          'Satisfied',
                          'Neutral',
                          'Dissatisfied',
                          'Very dissatisfied',
                        ]}
                        required
                      />
                    </div>

                    <div>
                      <FieldLabel required>Would the patient continue or repeat this treatment?</FieldLabel>
                      <RadioGroup name="wouldContinue" options={['Yes', 'No', 'Undecided']} required />
                    </div>

                    <div>
                      <FieldLabel>Additional Notes / Observations</FieldLabel>
                      <textarea
                        name="additionalNotes"
                        placeholder="Any additional outcomes, observations, or comments about this treatment course..."
                        style={{ minHeight: '120px' }}
                      />
                    </div>

                    <Divider />

                    {/* Attestation */}
                    <div>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" name="attestation" required style={{ marginTop: '2px' }} />
                        <span className="text-sm leading-relaxed" style={{ color: LABEL_COLOR }}>
                          I confirm that the information provided above is accurate to the best of my knowledge. {REQUIRED}
                        </span>
                      </label>
                    </div>

                    {reporterType === 'provider' && (
                      <>
                        <div>
                          <FieldLabel required>Provider Signature</FieldLabel>
                          <input type="text" name="providerSignature" required placeholder="Type full name as signature" />
                        </div>
                        <div style={{ maxWidth: '14rem' }}>
                          <FieldLabel>Signature Date</FieldLabel>
                          <input type="date" name="signatureDate" />
                        </div>
                      </>
                    )}

                    {error && (
                      <div className="p-4 rounded-xl text-sm" style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
                        {error}
                      </div>
                    )}

                    <div className="pt-2">
                      <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Outcomes Report'}
                      </button>
                    </div>
                  </>
                )}

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
