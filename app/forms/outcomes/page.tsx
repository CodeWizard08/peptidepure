'use client';

import { useState } from 'react';
import {
  FieldLabel, RadioGroup, Divider,
  FormSuccessScreen, FormHeader, useFormSubmit,
  LABEL_COLOR, REQUIRED,
} from '@/components/forms/FormPrimitives';
import { TreatmentOutcomesFields, SideEffectsFields, SatisfactionFields } from '@/components/forms/OutcomesFields';

export default function OutcomesFormPage() {
  const { submitted, submitting, error, setSubmitted, handleSubmit } = useFormSubmit('outcomes');
  const [reporterType, setReporterType] = useState<'provider' | 'patient' | ''>('');

  if (submitted) {
    return (
      <FormSuccessScreen
        title="Outcomes Submitted"
        message="Your outcomes report has been received. Thank you for your contribution to our clinical data."
        resetHref="/forms/outcomes"
        onReset={() => setSubmitted(false)}
      />
    );
  }

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      <FormHeader
        breadcrumb="Clinical Forms"
        title="Patient Outcomes Report"
        subtitle="Capture treatment outcomes, side effects, and overall response for peptide protocols."
      />

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
                        <input type="radio" name="reporterType" value={type} required onChange={() => setReporterType(type)} />
                        <span className="text-sm" style={{ color: LABEL_COLOR }}>
                          {type === 'provider' ? 'Provider / Clinician' : 'Patient'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Conditional provider fields */}
                {reporterType === 'provider' && (
                  <>
                    <div><FieldLabel required>Provider Name</FieldLabel><input type="text" name="providerName" required placeholder="Full name" /></div>
                    <div><FieldLabel required>Clinic Name</FieldLabel><input type="text" name="clinicName" required placeholder="Practice or clinic name" /></div>
                    <div><FieldLabel required>Provider Email</FieldLabel><input type="email" name="providerEmail" required placeholder="you@clinic.com" /></div>
                  </>
                )}

                {/* Conditional patient fields */}
                {reporterType === 'patient' && (
                  <>
                    <div><FieldLabel required>Patient Initials</FieldLabel><input type="text" name="patientInitials" required placeholder="e.g. JD" style={{ maxWidth: '10rem' }} /></div>
                    <div><FieldLabel>Email (optional)</FieldLabel><input type="email" name="patientEmail" placeholder="you@email.com" /></div>
                  </>
                )}

                {reporterType && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div><FieldLabel required>Date of Report</FieldLabel><input type="date" name="dateReport" required /></div>
                      <div><FieldLabel required>Patient ID / Initials</FieldLabel><input type="text" name="patientId" required placeholder="e.g. JD-001" /></div>
                    </div>

                    <Divider />

                    {/* Treatment info */}
                    <div><FieldLabel required>Product / Peptide Used</FieldLabel><input type="text" name="productUsed" required placeholder="e.g. BPC-157, TB-500" /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div><FieldLabel required>Dose</FieldLabel><input type="text" name="dose" required placeholder="e.g. 500 mcg" /></div>
                      <div><FieldLabel required>Route</FieldLabel><RadioGroup name="route" options={['SC', 'IM', 'Oral']} required /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div><FieldLabel required>Treatment Duration</FieldLabel><input type="text" name="treatmentDuration" required placeholder="e.g. 4 weeks" /></div>
                      <div><FieldLabel required>Frequency</FieldLabel><input type="text" name="frequency" required placeholder="e.g. Daily, 3x/week" /></div>
                    </div>

                    <Divider />
                    <TreatmentOutcomesFields />
                    <Divider />
                    <SideEffectsFields />
                    <Divider />
                    <SatisfactionFields />
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
                        <div><FieldLabel required>Provider Signature</FieldLabel><input type="text" name="providerSignature" required placeholder="Type full name as signature" /></div>
                        <div style={{ maxWidth: '14rem' }}><FieldLabel>Signature Date</FieldLabel><input type="date" name="signatureDate" /></div>
                      </>
                    )}

                    {error && (
                      <div className="p-4 rounded-xl text-sm" style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>{error}</div>
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
