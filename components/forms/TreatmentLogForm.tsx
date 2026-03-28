'use client';

import {
  FieldLabel, RadioGroup, CheckboxGroup, Divider,
  FormSuccessScreen, FormHeader, useFormSubmit,
  LABEL_COLOR, REQUIRED,
} from '@/components/forms/FormPrimitives';

export default function TreatmentLogForm() {
  const { submitted, submitting, error, setSubmitted, handleSubmit } = useFormSubmit('treatment-log');

  if (submitted) {
    return (
      <FormSuccessScreen
        title="Form Submitted"
        message="Your IRB Treatment Log has been received. Thank you for your documentation."
        resetHref="/forms/treatment-log"
        onReset={() => setSubmitted(false)}
      />
    );
  }

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      <FormHeader breadcrumb="Data Capture" title="IRB — Treatment Log" subtitle="Per-visit treatment record for investigational peptide protocol participants." />
      <div className="py-12">
        <div className="container-xl">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10" style={{ border: '1px solid var(--border)' }}>
            <p className="text-xs mb-8" style={{ color: 'var(--text-light)' }}><span style={{ color: 'var(--gold)' }}>**</span> indicates required fields</p>
            <form onSubmit={handleSubmit} className="irb-form space-y-6">
              <div><FieldLabel required>Provider Name</FieldLabel><input type="text" name="providerName" required placeholder="Full name" /></div>
              <div><FieldLabel required>Clinic Name</FieldLabel><input type="text" name="clinicName" required placeholder="Practice or clinic name" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><FieldLabel required>Date of Submission</FieldLabel><input type="date" name="dateSubmission" required /></div>
                <div><FieldLabel required>Date of Visit</FieldLabel><input type="date" name="dateVisit" required /></div>
              </div>
              <div><FieldLabel required>Patient ID / Initials</FieldLabel><input type="text" name="patientId" required placeholder="e.g. JD-001" /></div>
              <Divider />
              <div><FieldLabel required>Product Code / Name</FieldLabel><input type="text" name="productCode" required placeholder="e.g. BPC-157" /></div>
              <div><FieldLabel required>Dose Administered</FieldLabel><input type="text" name="doseAdministered" required placeholder="e.g. 250 mcg" /></div>
              <div><FieldLabel required>Route</FieldLabel><RadioGroup name="route" options={['SC', 'IM', 'Oral']} required /></div>
              <div><FieldLabel required>Injection Site</FieldLabel><RadioGroup name="injectionSite" options={['Abdomen', 'Thigh', 'Arm', 'Other']} required /></div>
              <Divider />
              <div><FieldLabel required>Immediate Tolerance</FieldLabel><CheckboxGroup name="immediateTolerance" options={['Well tolerated', 'Mild irritation', 'Mild nausea', 'Dizziness', 'Other']} /></div>
              <div><FieldLabel>Provider Notes <span className="font-normal text-xs" style={{ color: 'var(--text-light)' }}>(optional)</span></FieldLabel><textarea name="providerNotes" placeholder="Clinical observations, patient-reported feedback..." /></div>
              <div><FieldLabel required>Any Concerning Symptoms?</FieldLabel><RadioGroup name="concerningSymptoms" options={['No', 'Yes']} required /></div>
              <Divider />
              <div><FieldLabel>Return Visit Planned</FieldLabel><RadioGroup name="returnVisit" options={['Yes', 'No']} /></div>
              <div><FieldLabel>Dose Adjustment Planned</FieldLabel><RadioGroup name="doseAdjustment" options={['Yes', 'No']} /></div>
              <div><FieldLabel>Next Steps Notes</FieldLabel><textarea name="nextStepsNotes" placeholder="Any planned changes, referrals, or follow-up instructions..." /></div>
              <Divider />
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="attestation" required style={{ marginTop: '2px' }} />
                  <span className="text-sm leading-relaxed" style={{ color: LABEL_COLOR }}>I confirm this treatment was administered according to IRB investigational-use protocol and the patient was monitored appropriately. {REQUIRED}</span>
                </label>
              </div>
              <div><FieldLabel required>Provider Signature</FieldLabel><input type="text" name="providerSignature" required placeholder="Type full name as signature" /></div>
              <div style={{ maxWidth: '14rem' }}><FieldLabel required>Signature Date</FieldLabel><input type="date" name="signatureDate" required /></div>
              {error && <div className="p-4 rounded-xl text-sm" style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>{error}</div>}
              <div className="pt-2"><button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
