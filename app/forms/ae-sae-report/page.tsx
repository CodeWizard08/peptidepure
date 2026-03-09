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

function Divider() {
  return <hr style={{ borderColor: 'var(--border)', margin: '0.5rem 0' }} />;
}

export default function AESAEReportPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--navy)' }}>Report Submitted</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-mid)' }}>
            Your IRB AE / SAE Report has been received. Thank you for your prompt documentation.
          </p>
          <Link href="/forms/ae-sae-report" onClick={() => setSubmitted(false)} className="btn-primary">
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
              href="/forms/ae-sae-report"
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--gold)' }}
            >
              Clinical Forms
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-white">IRB — AE / SAE Report</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Adverse Event and Serious Adverse Event reporting for investigational peptide protocols.
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

                {/* Provider info */}
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
                <div>
                  <FieldLabel>Provider Phone</FieldLabel>
                  <input type="tel" name="providerPhone" placeholder="(555) 000-0000" style={{ maxWidth: '14rem' }} />
                </div>

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

                <div>
                  <FieldLabel>Age Range</FieldLabel>
                  <RadioGroup name="ageRange" options={['18–30', '31–45', '46–60', '60+']} />
                </div>

                <Divider />

                {/* Event details */}
                <div>
                  <FieldLabel required>Type of Event</FieldLabel>
                  <RadioGroup
                    name="eventType"
                    options={['AE – Adverse Event', 'SAE – Serious Adverse Event']}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>Date Event Began</FieldLabel>
                    <input type="date" name="dateEventBegan" />
                  </div>
                  <div>
                    <FieldLabel>Time of Onset</FieldLabel>
                    <input type="text" name="timeOnset" placeholder="e.g. 2 hours post-injection" />
                  </div>
                </div>

                <div>
                  <FieldLabel required>Event Description</FieldLabel>
                  <textarea
                    name="eventDescription"
                    required
                    placeholder="Provide a detailed description of the adverse event, including signs, symptoms, and timeline..."
                    style={{ minHeight: '140px' }}
                  />
                </div>

                <div>
                  <FieldLabel required>Severity</FieldLabel>
                  <RadioGroup
                    name="severity"
                    options={['Mild', 'Moderate', 'Severe', 'Life-threatening']}
                    required
                  />
                </div>

                <Divider />

                {/* Medical response */}
                <div>
                  <FieldLabel required>Was the product discontinued?</FieldLabel>
                  <RadioGroup name="productDiscontinued" options={['Yes', 'No']} required />
                </div>

                <div>
                  <FieldLabel required>Was medical care required?</FieldLabel>
                  <RadioGroup
                    name="medicalCareRequired"
                    options={['No', 'Outpatient visit', 'Urgent care', 'ER visit', 'Hospitalization']}
                    required
                  />
                </div>

                <Divider />

                {/* Product info */}
                <div>
                  <FieldLabel required>Product Code / Name</FieldLabel>
                  <input type="text" name="productCode" required placeholder="e.g. BPC-157" />
                </div>
                <div>
                  <FieldLabel required>Dose Given</FieldLabel>
                  <input type="text" name="doseGiven" required placeholder="e.g. 500 mcg" />
                </div>

                <div>
                  <FieldLabel required>Route</FieldLabel>
                  <RadioGroup name="route" options={['SC', 'IM', 'Oral']} required />
                </div>

                <div>
                  <FieldLabel>Time Since Last Dose</FieldLabel>
                  <input type="text" name="timeSinceLastDose" placeholder="e.g. 24 hours" style={{ maxWidth: '16rem' }} />
                </div>

                <div>
                  <FieldLabel>Interventions Performed</FieldLabel>
                  <textarea
                    name="interventionsPerformed"
                    placeholder="Describe any treatments or interventions administered in response to the event..."
                  />
                </div>

                <Divider />

                {/* Outcome */}
                <div>
                  <FieldLabel>Outcome Status</FieldLabel>
                  <RadioGroup
                    name="outcomeStatus"
                    options={['Resolved', 'Improving', 'Stable', 'Worsening', 'Unknown']}
                  />
                </div>

                <div>
                  <FieldLabel required>Will follow-up monitoring be needed?</FieldLabel>
                  <RadioGroup name="followUpMonitoring" options={['Yes', 'No']} required />
                </div>

                <Divider />

                {/* Attestation & signature */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="attestation" required style={{ marginTop: '2px' }} />
                    <span className="text-sm leading-relaxed" style={{ color: LABEL_COLOR }}>
                      I confirm that the above information is accurate to the best of my knowledge. {REQUIRED}
                    </span>
                  </label>
                </div>

                <div>
                  <FieldLabel required>Provider Signature</FieldLabel>
                  <input type="text" name="providerSignature" required placeholder="Type full name as signature" />
                </div>
                <div style={{ maxWidth: '14rem' }}>
                  <FieldLabel>Signature Date</FieldLabel>
                  <input type="date" name="signatureDate" />
                </div>

                <div className="pt-2">
                  <button type="submit" className="btn-primary">Submit</button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
