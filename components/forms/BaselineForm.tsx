'use client';

import {
  FieldLabel, RadioGroup, CheckboxGroup, Divider,
  FormSuccessScreen, FormHeader, useFormSubmit,
  LABEL_COLOR, REQUIRED,
} from '@/components/forms/FormPrimitives';

export default function BaselineForm() {
  const { submitted, submitting, error, setSubmitted, handleSubmit } = useFormSubmit('baseline');

  if (submitted) {
    return (
      <FormSuccessScreen
        title="Form Submitted"
        message="Your IRB Baseline submission has been received. Thank you for your documentation."
        resetHref="/forms/baseline"
        onReset={() => setSubmitted(false)}
      />
    );
  }

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      <FormHeader breadcrumb="Data Capture" title="IRB — Baseline" subtitle="Patient baseline assessment for investigational peptide protocol enrollment." />
      <div className="py-12">
        <div className="container-xl">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10" style={{ border: '1px solid var(--border)' }}>
            <p className="text-xs mb-8" style={{ color: 'var(--text-light)' }}><span style={{ color: 'var(--gold)' }}>**</span> indicates required fields</p>
            <form onSubmit={handleSubmit} className="irb-form space-y-6">
              <div><FieldLabel required>Provider Name</FieldLabel><input type="text" name="providerName" required placeholder="Full name" /></div>
              <div><FieldLabel required>Clinic Name</FieldLabel><input type="text" name="clinicName" required placeholder="Practice or clinic name" /></div>
              <div><FieldLabel required>Provider Email</FieldLabel><input type="email" name="providerEmail" required placeholder="you@clinic.com" /></div>
              <div><FieldLabel required>Date Submitted</FieldLabel><input type="date" name="dateSubmitted" required style={{ maxWidth: '14rem' }} /></div>
              <Divider />
              <div>
                <FieldLabel required>Patient ID / Initials</FieldLabel>
                <input type="text" name="patientId" required placeholder="e.g. JD-001" />
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-light)' }}>Use initials or study ID only. No full names.</p>
              </div>
              <div><FieldLabel required>Age Range</FieldLabel><RadioGroup name="ageRange" options={['18–30', '31–45', '46–60', '60+']} required /></div>
              <div><FieldLabel required>Sex</FieldLabel><RadioGroup name="sex" options={['Male', 'Female', 'Other / NA']} required /></div>
              <Divider />
              <div>
                <FieldLabel required>Primary Condition / Reason for Treatment</FieldLabel>
                <CheckboxGroup name="primaryCondition" options={['Musculoskeletal injury','Chronic pain','Tendon & ligament damage','Metabolic / weight loss','GI / inflammation','Hormonal optimization','Other']} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div><FieldLabel>Pain (if applicable)</FieldLabel><select name="painLevel"><option value="">— Select —</option>{Array.from({ length: 10 }, (_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}</select></div>
                <div><FieldLabel>Functional Limitation</FieldLabel><select name="functionalLimitation"><option value="">— Select —</option>{['None','Mild','Moderate','Severe'].map((v) => <option key={v} value={v}>{v}</option>)}</select></div>
                <div><FieldLabel>Overall Symptom Severity</FieldLabel><select name="symptomSeverity"><option value="">— Select —</option>{['None','Mild','Moderate','Severe'].map((v) => <option key={v} value={v}>{v}</option>)}</select></div>
              </div>
              <div><FieldLabel>Current Medications</FieldLabel><textarea name="currentMedications" placeholder="List all current medications and dosages..." /></div>
              <div><FieldLabel required>Any Known Allergies</FieldLabel><RadioGroup name="knownAllergies" options={['No', 'Yes']} required /></div>
              <div><FieldLabel required>Contraindications / Red Flags</FieldLabel><RadioGroup name="contraindications" options={['None', 'Yes']} required /></div>
              <Divider />
              <div><FieldLabel required>Planned Peptide / Product Code</FieldLabel><input type="text" name="productCode" required placeholder="e.g. BPC-157, TB-500" /></div>
              <div><FieldLabel required>Planned Starting Dose</FieldLabel><input type="text" name="startingDose" required placeholder="e.g. 250 mcg" /></div>
              <div><FieldLabel required>Route</FieldLabel><RadioGroup name="route" options={['SC', 'IM', 'Oral']} required /></div>
              <div style={{ maxWidth: '14rem' }}><FieldLabel>Expected Duration (weeks)</FieldLabel><select name="expectedDuration"><option value="">— Select —</option>{[4,6,8,10,12,16,20,24].map((w) => <option key={w} value={w}>{w} weeks</option>)}</select></div>
              <Divider />
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="consentConfirmation" required style={{ marginTop: '2px' }} />
                  <span className="text-sm leading-relaxed" style={{ color: LABEL_COLOR }}>I confirm that informed consent for investigational use has been obtained from this patient. {REQUIRED}</span>
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
