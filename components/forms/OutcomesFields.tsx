import {
  FieldLabel, RadioGroup, CheckboxGroup, Divider, ScaleSelector,
  LABEL_COLOR, REQUIRED,
} from './FormPrimitives';

export function TreatmentOutcomesFields() {
  return (
    <>
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
    </>
  );
}

export function SideEffectsFields() {
  return (
    <>
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
    </>
  );
}

export function SatisfactionFields() {
  return (
    <>
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
    </>
  );
}
