'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FieldLabel, RadioGroup, Divider,
  LABEL_COLOR, REQUIRED,
} from '@/components/forms/FormPrimitives';

/* ─────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────── */
function SectionAnchor({ id, label }: { id: string; label: string }) {
  return (
    <div id={id} className="scroll-mt-28 flex items-center gap-4 mb-8">
      <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
      <span
        className="text-xs font-semibold uppercase tracking-widest shrink-0"
        style={{ color: 'var(--gold)' }}
      >
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
    </div>
  );
}

function SubmitButton({ submitting, label }: { submitting: boolean; label: string }) {
  return (
    <div className="pt-2">
      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Submitting...' : label}
      </button>
    </div>
  );
}

function SuccessBanner({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div
      className="rounded-xl p-6 text-center"
      style={{ background: 'rgba(200,149,44,0.06)', border: '1.5px solid var(--gold)' }}
    >
      <svg className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--navy)' }}>{message}</p>
      <button onClick={onReset} className="text-xs font-semibold underline mt-2" style={{ color: 'var(--gold)' }}>
        Submit another
      </button>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="p-4 rounded-xl text-sm" style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
      {message}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Form submission hook (reuse logic)
───────────────────────────────────────────── */
function useFormState(formType: string) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitting(true);
    setError('');

    try {
      const fd = new FormData(form);
      const data: Record<string, unknown> = {};
      fd.forEach((value, key) => {
        if (data[key]) {
          const existing = data[key];
          data[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
        } else {
          data[key] = value;
        }
      });

      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType, data }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Submission failed');
      }
      setSubmitted(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return { submitted, submitting, error, setSubmitted, handleSubmit };
}

/* ─────────────────────────────────────────────
   SOAP Note Form
───────────────────────────────────────────── */
function SoapNoteForm() {
  const { submitted, submitting, error, setSubmitted, handleSubmit } = useFormState('soap_capture');

  if (submitted) {
    return <SuccessBanner message="SOAP Note submitted successfully." onReset={() => setSubmitted(false)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="irb-form space-y-6">
      {/* ── Patient Information ── */}
      <h3 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>Patient Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div><FieldLabel required>Patient ID / Initials</FieldLabel><input type="text" name="patientId" required placeholder="e.g. JD-001" /></div>
        <div><FieldLabel required>Encounter Date</FieldLabel><input type="date" name="encounterDate" required /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div><FieldLabel required>Provider Name</FieldLabel><input type="text" name="providerName" required placeholder="Full name" /></div>
        <div><FieldLabel required>Clinic Name</FieldLabel><input type="text" name="clinicName" required placeholder="Practice or clinic name" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel required>Visit Type</FieldLabel>
          <select name="visitType" required>
            <option value="">Select...</option>
            <option value="Initial Consultation">Initial Consultation</option>
            <option value="Follow-Up">Follow-Up</option>
            <option value="Protocol Check-In">Protocol Check-In</option>
            <option value="Lab Review">Lab Review</option>
            <option value="Adverse Event Follow-Up">Adverse Event Follow-Up</option>
          </select>
        </div>
        <div><FieldLabel>Protocol / Study ID</FieldLabel><input type="text" name="protocol" placeholder="e.g. PPRN-001-2025" /></div>
      </div>
      <div><FieldLabel>Age Range</FieldLabel><RadioGroup name="ageRange" options={['18–30', '31–45', '46–60', '60+']} /></div>

      <Divider />

      {/* ── Subjective ── */}
      <h3 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>
        <span className="text-xs font-semibold uppercase tracking-widest mr-2" style={{ color: 'var(--gold)' }}>S</span>
        Subjective
      </h3>
      <div>
        <FieldLabel required>Chief Complaint / Reason for Visit</FieldLabel>
        <textarea name="chiefComplaint" required placeholder="Patient's primary concern or reason for today's visit..." style={{ minHeight: '80px' }} />
      </div>
      <div>
        <FieldLabel>History of Present Illness (HPI)</FieldLabel>
        <textarea name="hpiNarrative" placeholder="Onset, location, duration, character, aggravating/alleviating factors, associated symptoms, treatments tried..." style={{ minHeight: '120px' }} />
      </div>
      <div>
        <FieldLabel>Patient-Reported Symptoms &amp; Changes</FieldLabel>
        <textarea name="patientSymptoms" placeholder="Energy level, sleep quality, pain level, mood, appetite, any new or worsening symptoms since last visit..." style={{ minHeight: '80px' }} />
      </div>
      <div>
        <FieldLabel>Current Medications / Supplements</FieldLabel>
        <textarea name="currentMedications" placeholder="List all current medications, peptides, and supplements with dosages..." style={{ minHeight: '80px' }} />
      </div>

      <Divider />

      {/* ── Objective ── */}
      <h3 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>
        <span className="text-xs font-semibold uppercase tracking-widest mr-2" style={{ color: 'var(--gold)' }}>O</span>
        Objective
      </h3>
      <p className="text-xs" style={{ color: 'var(--text-light)' }}>Record vitals, physical exam findings, and relevant labs.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div><FieldLabel>BP (mmHg)</FieldLabel><input type="text" name="vitalBP" placeholder="120/80" /></div>
        <div><FieldLabel>HR (bpm)</FieldLabel><input type="text" name="vitalHR" placeholder="72" /></div>
        <div><FieldLabel>Temp (°F)</FieldLabel><input type="text" name="vitalTemp" placeholder="98.6" /></div>
        <div><FieldLabel>Weight (lbs)</FieldLabel><input type="text" name="vitalWeight" placeholder="185" /></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div><FieldLabel>SpO2 (%)</FieldLabel><input type="text" name="vitalSpO2" placeholder="98" /></div>
        <div><FieldLabel>RR (breaths/min)</FieldLabel><input type="text" name="vitalRR" placeholder="16" /></div>
        <div><FieldLabel>BMI</FieldLabel><input type="text" name="vitalBMI" placeholder="24.5" /></div>
        <div><FieldLabel>Waist (in)</FieldLabel><input type="text" name="vitalWaist" placeholder="34" /></div>
      </div>
      <div>
        <FieldLabel>Physical Exam Findings</FieldLabel>
        <textarea name="physicalExam" placeholder="General appearance, HEENT, cardiovascular, respiratory, abdomen, musculoskeletal, skin, injection site assessment..." style={{ minHeight: '120px' }} />
      </div>
      <div>
        <FieldLabel>Lab Results / Diagnostics</FieldLabel>
        <textarea name="labResults" placeholder="CBC, CMP, hormones, inflammatory markers, or other labs relevant to this visit..." style={{ minHeight: '80px' }} />
      </div>

      <Divider />

      {/* ── Assessment ── */}
      <h3 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>
        <span className="text-xs font-semibold uppercase tracking-widest mr-2" style={{ color: 'var(--gold)' }}>A</span>
        Assessment
      </h3>
      <div>
        <FieldLabel required>Clinical Assessment / Diagnosis</FieldLabel>
        <textarea name="assessment" required placeholder="Primary and secondary diagnoses, clinical impression, response to current peptide protocol, ICD-10 codes if applicable..." style={{ minHeight: '120px' }} />
      </div>
      <div>
        <FieldLabel>Treatment Response</FieldLabel>
        <RadioGroup name="treatmentResponse" options={['Significant Improvement', 'Mild Improvement', 'No Change', 'Worsening', 'N/A — Initial Visit']} />
      </div>

      <Divider />

      {/* ── Plan ── */}
      <h3 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>
        <span className="text-xs font-semibold uppercase tracking-widest mr-2" style={{ color: 'var(--gold)' }}>P</span>
        Plan
      </h3>
      <div>
        <FieldLabel required>Treatment Plan</FieldLabel>
        <textarea name="treatmentPlan" required placeholder="Peptide protocol (product, dose, route, frequency), any modifications to existing protocol, new orders..." style={{ minHeight: '120px' }} />
      </div>
      <div>
        <FieldLabel>Patient Education &amp; Instructions</FieldLabel>
        <textarea name="patientInstructions" placeholder="Injection technique review, storage instructions, expected side effects, when to seek medical attention..." style={{ minHeight: '80px' }} />
      </div>
      <div>
        <FieldLabel>Referrals / Follow-Up</FieldLabel>
        <textarea name="followUp" placeholder="Next appointment date, labs to order before next visit, specialist referrals..." style={{ minHeight: '80px' }} />
      </div>

      <Divider />

      {/* ── Attestation ── */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" name="attestation" required style={{ marginTop: '2px' }} />
          <span className="text-sm leading-relaxed" style={{ color: LABEL_COLOR }}>
            I confirm that the above information is accurate and complete to the best of my knowledge. {REQUIRED}
          </span>
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div><FieldLabel required>Provider Signature</FieldLabel><input type="text" name="providerSignature" required placeholder="Type full name as signature" /></div>
        <div><FieldLabel>Signature Date</FieldLabel><input type="date" name="signatureDate" /></div>
      </div>

      {error && <ErrorBanner message={error} />}
      <SubmitButton submitting={submitting} label="Submit SOAP Note" />
    </form>
  );
}

/* ─────────────────────────────────────────────
   Adverse Event Report Form
───────────────────────────────────────────── */
function AdverseEventForm() {
  const { submitted, submitting, error, setSubmitted, handleSubmit } = useFormState('ae-sae-report');

  if (submitted) {
    return <SuccessBanner message="Adverse Event Report submitted successfully." onReset={() => setSubmitted(false)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="irb-form space-y-6">
      {/* ── Reporter Info ── */}
      <h3 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>Reporter Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div><FieldLabel required>Provider Name</FieldLabel><input type="text" name="providerName" required placeholder="Full name" /></div>
        <div><FieldLabel required>Provider Email</FieldLabel><input type="email" name="providerEmail" required placeholder="you@clinic.com" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div><FieldLabel required>Clinic Name</FieldLabel><input type="text" name="clinicName" required placeholder="Practice or clinic name" /></div>
        <div><FieldLabel>Provider Phone</FieldLabel><input type="tel" name="providerPhone" placeholder="(555) 000-0000" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div><FieldLabel required>Date of Report</FieldLabel><input type="date" name="dateReport" required /></div>
        <div><FieldLabel required>Patient ID / Initials</FieldLabel><input type="text" name="patientId" required placeholder="e.g. JD-001" /></div>
      </div>
      <div><FieldLabel>Age Range</FieldLabel><RadioGroup name="ageRange" options={['18–30', '31–45', '46–60', '60+']} /></div>

      <Divider />

      {/* ── Treatment Info ── */}
      <h3 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>Treatment Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div><FieldLabel required>Product Code / Name</FieldLabel><input type="text" name="productCode" required placeholder="e.g. BPC-157" /></div>
        <div><FieldLabel required>Dose Given</FieldLabel><input type="text" name="doseGiven" required placeholder="e.g. 500 mcg" /></div>
      </div>
      <div><FieldLabel required>Route</FieldLabel><RadioGroup name="route" options={['SC', 'IM', 'Oral']} required /></div>
      <div><FieldLabel>Time Since Last Dose</FieldLabel><input type="text" name="timeSinceLastDose" placeholder="e.g. 24 hours" style={{ maxWidth: '16rem' }} /></div>

      <Divider />

      {/* ── Event Details ── */}
      <h3 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>Adverse Event Details</h3>
      <div><FieldLabel required>Type of Event</FieldLabel><RadioGroup name="eventType" options={['AE — Adverse Event', 'SAE — Serious Adverse Event']} required /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div><FieldLabel>Date Event Began</FieldLabel><input type="date" name="dateEventBegan" /></div>
        <div><FieldLabel>Time of Onset</FieldLabel><input type="text" name="timeOnset" placeholder="e.g. 2 hours post-injection" /></div>
      </div>
      <div><FieldLabel required>Event Description</FieldLabel><textarea name="eventDescription" required placeholder="Provide a detailed description of the adverse event, including signs, symptoms, and timeline..." style={{ minHeight: '140px' }} /></div>

      <Divider />

      {/* ── Severity & Causality ── */}
      <h3 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>Severity &amp; Causality</h3>
      <div><FieldLabel required>Severity</FieldLabel><RadioGroup name="severity" options={['Mild', 'Moderate', 'Severe', 'Life-threatening']} required /></div>
      <div><FieldLabel required>Causality Assessment</FieldLabel><RadioGroup name="causality" options={['Definitely related', 'Probably related', 'Possibly related', 'Unlikely related', 'Not related']} required /></div>
      <div><FieldLabel required>Was the product discontinued?</FieldLabel><RadioGroup name="productDiscontinued" options={['Yes', 'No']} required /></div>
      <div><FieldLabel required>Was medical care required?</FieldLabel><RadioGroup name="medicalCareRequired" options={['No', 'Outpatient visit', 'Urgent care', 'ER visit', 'Hospitalization']} required /></div>

      <Divider />

      {/* ── Outcome ── */}
      <h3 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>Outcome &amp; Follow-Up</h3>
      <div><FieldLabel>Interventions Performed</FieldLabel><textarea name="interventionsPerformed" placeholder="Describe any treatments or interventions administered in response to the event..." /></div>
      <div><FieldLabel>Outcome Status</FieldLabel><RadioGroup name="outcomeStatus" options={['Resolved', 'Improving', 'Stable', 'Worsening', 'Unknown']} /></div>
      <div><FieldLabel required>Will follow-up monitoring be needed?</FieldLabel><RadioGroup name="followUpMonitoring" options={['Yes', 'No']} required /></div>

      <Divider />

      {/* ── Attestation ── */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" name="attestation" required style={{ marginTop: '2px' }} />
          <span className="text-sm leading-relaxed" style={{ color: LABEL_COLOR }}>
            I confirm that the above information is accurate to the best of my knowledge. {REQUIRED}
          </span>
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div><FieldLabel required>Provider Signature</FieldLabel><input type="text" name="providerSignature" required placeholder="Type full name as signature" /></div>
        <div><FieldLabel>Signature Date</FieldLabel><input type="date" name="signatureDate" /></div>
      </div>

      {error && <ErrorBanner message={error} />}
      <SubmitButton submitting={submitting} label="Submit AE Report" />
    </form>
  );
}

/* ─────────────────────────────────────────────
   Quick Capture — paste clinical note
───────────────────────────────────────────── */
function QuickCapture() {
  const [note, setNote] = useState('');
  const [patientId, setPatientId] = useState('');
  const [encounterDate, setEncounterDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'soap_capture',
          data: {
            captureMethod: 'quick-paste',
            patientId,
            encounterDate,
            rawClinicalNote: note,
            capturedAt: new Date().toISOString(),
          },
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
      setNote('');
      setPatientId('');
      setEncounterDate('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <svg className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--navy)' }}>Clinical note submitted successfully.</p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-light)' }}>Data has been saved and will be extracted into structured fields.</p>
        <button onClick={() => setSubmitted(false)} className="text-xs font-semibold underline" style={{ color: 'var(--gold)' }}>
          Submit another note
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="irb-form space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Patient ID / Initials</FieldLabel>
          <input type="text" value={patientId} onChange={(e) => setPatientId(e.target.value)} required placeholder="e.g. JD-001" />
        </div>
        <div>
          <FieldLabel required>Encounter Date</FieldLabel>
          <input type="date" value={encounterDate} onChange={(e) => setEncounterDate(e.target.value)} required />
        </div>
      </div>
      <div>
        <FieldLabel required>Clinical Note</FieldLabel>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
          placeholder={"Paste your full clinical note here — SOAP note, progress note, encounter summary, or any structured/unstructured clinical documentation.\n\nExample:\nS: Patient reports improved energy levels after 4 weeks on BPC-157...\nO: BP 118/76, HR 68, Weight 182 lbs...\nA: Responding well to protocol...\nP: Continue current protocol..."}
          style={{ minHeight: '220px', lineHeight: '1.7' }}
        />
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-light)' }}>
        Vitals, labs, body composition, medications, patient-reported outcomes, and adverse events will be automatically extracted and structured from your note.
      </p>
      {error && <ErrorBanner message={error} />}
      <div className="flex items-center gap-4 flex-wrap">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Clinical Note'}
        </button>
        <Link
          href="/forms/soap-capture"
          className="text-xs font-semibold underline underline-offset-2"
          style={{ color: 'var(--gold)' }}
        >
          Or use the interactive extraction tool →
        </Link>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────
   Main Forms Page
───────────────────────────────────────────── */
export default function FormsPage() {
  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="py-12" style={{ background: 'var(--navy)' }}>
        <div className="container-xl">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
            Clinical Tools
          </span>
          <h1 className="text-3xl font-bold text-white mt-2">Data Capture Made Simple</h1>
          <p className="text-sm mt-2 max-w-xl" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Paste your clinical note (SOAP, progress note, or encounter) below. Our system automatically extracts and
            structures the key data. Prefer manual entry? You can complete individual fields at any time.
          </p>
          {/* Quick jump links */}
          <div className="flex gap-4 mt-6 flex-wrap">
            <a href="#quick-capture" className="text-xs font-semibold px-4 py-2 rounded-full transition-colors" style={{ background: 'rgba(200,149,44,0.15)', color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)' }}>
              Paste Clinical Note
            </a>
            <a href="#soap-note" className="text-xs font-semibold px-4 py-2 rounded-full transition-colors" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}>
              Manual SOAP Form
            </a>
            <a href="#ae-report" className="text-xs font-semibold px-4 py-2 rounded-full transition-colors" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}>
              Adverse Event Report
            </a>
            <a href="#downloads" className="text-xs font-semibold px-4 py-2 rounded-full transition-colors" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}>
              PDF Downloads
            </a>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container-xl max-w-4xl">

          {/* ═══════════════════════════════════════════
             QUICK CAPTURE — paste clinical note (easiest option, top of page)
          ═══════════════════════════════════════════ */}
          <div id="quick-capture" className="scroll-mt-28 bg-white rounded-2xl shadow-sm p-8 md:p-10 mb-6" style={{ border: '2px solid var(--gold)', boxShadow: '0 4px 24px rgba(200,149,44,0.08)' }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--gold-pale)', border: '1.5px solid var(--gold)' }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>Paste Clinical Note</h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}>
                      Fastest
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-light)' }}>
                    Copy your entire SOAP note, progress note, or encounter — we extract and organize the data for you
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <QuickCapture />
            </div>
          </div>

          {/* Divider between quick capture and manual forms */}
          <div className="flex items-center gap-4 mb-10 mt-10">
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-light)' }}>
              Or use manual entry forms
            </span>
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          </div>

          {/* Required fields note */}
          <p className="text-xs mb-10" style={{ color: 'var(--text-light)' }}>
            <span style={{ color: 'var(--gold)' }}>*</span> indicates required fields. All submissions are encrypted and stored per HIPAA guidelines.
          </p>

          {/* ═══════════════════════════════════════════
             SOAP Note / Data Capture (manual)
          ═══════════════════════════════════════════ */}
          <SectionAnchor id="soap-note" label="SOAP Note — Manual Entry" />
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 mb-16" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--gold-pale)', border: '1.5px solid var(--gold)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>SOAP Note</h2>
                <p className="text-xs" style={{ color: 'var(--text-light)' }}>Field-by-field entry — complete for each patient encounter</p>
              </div>
            </div>
            <div className="mt-8">
              <SoapNoteForm />
            </div>
          </div>

          {/* ═══════════════════════════════════════════
             Adverse Event Report
          ═══════════════════════════════════════════ */}
          <SectionAnchor id="ae-report" label="Adverse Event Report" />
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 mb-16" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(220,38,38,0.06)', border: '1.5px solid #dc2626' }}>
                <svg className="w-5 h-5" style={{ color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>Adverse Event Report</h2>
                <p className="text-xs" style={{ color: 'var(--text-light)' }}>Submit within 24 hours of any adverse event per PPRN-001-2025 protocol</p>
              </div>
            </div>
            <div className="mt-8">
              <AdverseEventForm />
            </div>
          </div>

          {/* ═══════════════════════════════════════════
             PDF Downloads
          ═══════════════════════════════════════════ */}
          <SectionAnchor id="downloads" label="PDF Downloads" />
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: 'PPRN-001-2025 Protocol Summary', description: 'Overview of the observational registry design, data collection requirements, and reporting obligations.', href: '/docs/PPRN_001_2025_Protocol_Summary.pdf' },
              { title: 'Informed Consent Template', description: 'IRCM-approved consent form template for enrolling patients in the research network.', href: '/docs/PPRN_Informed_Consent_Template.pdf' },
              { title: 'Data Capture Best Practices', description: 'Step-by-step guide for completing IRB forms and submitting data through PeptidePure™.', href: '/docs/PPRN_Data_Capture_Best_Practices.pdf' },
              { title: 'Adverse Event Report Form', description: 'Printable AE/SAE report form for offline documentation per protocol requirements.', href: '/docs/PPRN_Adverse_Event_Report_Form.pdf' },
            ].map((doc) => (
              <a
                key={doc.href}
                href={doc.href}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-xl p-5 transition-all duration-200 hover:shadow-md group"
                style={{ background: 'white', border: '1px solid var(--border)' }}
              >
                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--gold-pale)' }}>
                  <svg className="w-4.5 h-4.5" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold mb-1 group-hover:underline" style={{ color: 'var(--navy)' }}>{doc.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-mid)' }}>{doc.description}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Other forms link */}
          <div className="mt-12 text-center">
            <p className="text-xs mb-3" style={{ color: 'var(--text-light)' }}>
              Need the advanced SOAP extraction tool or other IRB forms?
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/forms/soap-capture" className="btn-outline-gold px-5 py-2.5">
                SOAP Extraction Tool
              </Link>
              <Link href="/forms/baseline" className="btn-outline-gold px-5 py-2.5">
                IRB Baseline
              </Link>
              <Link href="/forms/treatment-log" className="btn-outline-gold px-5 py-2.5">
                Treatment Log
              </Link>
              <Link href="/forms/outcomes" className="btn-outline-gold px-5 py-2.5">
                Patient Outcomes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
