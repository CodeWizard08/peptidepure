'use client';

import {
  FieldLabel, RadioGroup, Divider,
  FormSuccessScreen, FormHeader, useFormSubmit,
  LABEL_COLOR, REQUIRED,
} from '@/components/forms/FormPrimitives';

export default function AeSaeForm() {
  const { submitted, submitting, error, setSubmitted, handleSubmit } = useFormSubmit('ae-sae-report');

  if (submitted) {
    return (
      <FormSuccessScreen
        title="Report Submitted"
        message="Your IRB AE / SAE Report has been received. Thank you for your prompt documentation."
        resetHref="/forms/ae-sae-report"
        onReset={() => setSubmitted(false)}
      />
    );
  }

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      <FormHeader breadcrumb="Data Capture" title="IRB — AE / SAE Report" subtitle="Adverse Event and Serious Adverse Event reporting for investigational peptide protocols." />
      <div className="py-12">
        <div className="container-xl">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10" style={{ border: '1px solid var(--border)' }}>
            <p className="text-xs mb-8" style={{ color: 'var(--text-light)' }}><span style={{ color: 'var(--gold)' }}>**</span> indicates required fields</p>
            <form onSubmit={handleSubmit} className="irb-form space-y-6">
              <div><FieldLabel required>Provider Name</FieldLabel><input type="text" name="providerName" required placeholder="Full name" /></div>
              <div><FieldLabel required>Clinic Name</FieldLabel><input type="text" name="clinicName" required placeholder="Practice or clinic name" /></div>
              <div><FieldLabel required>Provider Email</FieldLabel><input type="email" name="providerEmail" required placeholder="you@clinic.com" /></div>
              <div><FieldLabel>Provider Phone</FieldLabel><input type="tel" name="providerPhone" placeholder="(555) 000-0000" style={{ maxWidth: '14rem' }} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><FieldLabel required>Date of Report</FieldLabel><input type="date" name="dateReport" required /></div>
                <div><FieldLabel required>Patient ID / Initials</FieldLabel><input type="text" name="patientId" required placeholder="e.g. JD-001" /></div>
              </div>
              <div><FieldLabel>Age Range</FieldLabel><RadioGroup name="ageRange" options={['18–30', '31–45', '46–60', '60+']} /></div>
              <Divider />
              <div><FieldLabel required>Type of Event</FieldLabel><RadioGroup name="eventType" options={['AE – Adverse Event', 'SAE – Serious Adverse Event']} required /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><FieldLabel>Date Event Began</FieldLabel><input type="date" name="dateEventBegan" /></div>
                <div><FieldLabel>Time of Onset</FieldLabel><input type="text" name="timeOnset" placeholder="e.g. 2 hours post-injection" /></div>
              </div>
              <div><FieldLabel required>Event Description</FieldLabel><textarea name="eventDescription" required placeholder="Provide a detailed description of the adverse event, including signs, symptoms, and timeline..." style={{ minHeight: '140px' }} /></div>
              <div><FieldLabel required>Severity</FieldLabel><RadioGroup name="severity" options={['Mild', 'Moderate', 'Severe', 'Life-threatening']} required /></div>
              <Divider />
              <div><FieldLabel required>Was the product discontinued?</FieldLabel><RadioGroup name="productDiscontinued" options={['Yes', 'No']} required /></div>
              <div><FieldLabel required>Was medical care required?</FieldLabel><RadioGroup name="medicalCareRequired" options={['No', 'Outpatient visit', 'Urgent care', 'ER visit', 'Hospitalization']} required /></div>
              <Divider />
              <div><FieldLabel required>Product Code / Name</FieldLabel><input type="text" name="productCode" required placeholder="e.g. BPC-157" /></div>
              <div><FieldLabel required>Dose Given</FieldLabel><input type="text" name="doseGiven" required placeholder="e.g. 500 mcg" /></div>
              <div><FieldLabel required>Route</FieldLabel><RadioGroup name="route" options={['SC', 'IM', 'Oral']} required /></div>
              <div><FieldLabel>Time Since Last Dose</FieldLabel><input type="text" name="timeSinceLastDose" placeholder="e.g. 24 hours" style={{ maxWidth: '16rem' }} /></div>
              <div><FieldLabel>Interventions Performed</FieldLabel><textarea name="interventionsPerformed" placeholder="Describe any treatments or interventions administered in response to the event..." /></div>
              <Divider />
              <div><FieldLabel>Outcome Status</FieldLabel><RadioGroup name="outcomeStatus" options={['Resolved', 'Improving', 'Stable', 'Worsening', 'Unknown']} /></div>
              <div><FieldLabel required>Will follow-up monitoring be needed?</FieldLabel><RadioGroup name="followUpMonitoring" options={['Yes', 'No']} required /></div>
              <Divider />
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="attestation" required style={{ marginTop: '2px' }} />
                  <span className="text-sm leading-relaxed" style={{ color: LABEL_COLOR }}>I confirm that the above information is accurate to the best of my knowledge. {REQUIRED}</span>
                </label>
              </div>
              <div><FieldLabel required>Provider Signature</FieldLabel><input type="text" name="providerSignature" required placeholder="Type full name as signature" /></div>
              <div style={{ maxWidth: '14rem' }}><FieldLabel>Signature Date</FieldLabel><input type="date" name="signatureDate" /></div>
              {error && <div className="p-4 rounded-xl text-sm" style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>{error}</div>}
              <div className="pt-2"><button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
