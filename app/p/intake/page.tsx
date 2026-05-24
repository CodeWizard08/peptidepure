import type { Metadata } from 'next';
import { Suspense } from 'react';
import PageHero from '@/components/sections/PageHero';
import PatientIntakeForm from '@/components/patient/PatientIntakeForm';

export const metadata: Metadata = {
  title: 'Patient Intake',
  description:
    'Tell the PeptidePure clinical team about your goals and current peptide use. A clinician will review your intake and reach out within two business days.',
  alternates: { canonical: '/p/intake' },
  // Patient-facing intake pages should not show up in search results — they
  // are meant to be reached via a clinician-shared link.
  robots: { index: false, follow: false },
};

export default function PatientIntakePage() {
  return (
    <>
      <PageHero
        sectionLabel="Patient Intake"
        heading="Tell us about you"
        subtitle="Your responses go directly to a PeptidePure clinician. Allow about 3 minutes."
      />
      <Suspense fallback={null}>
        <PatientIntakeForm />
      </Suspense>
    </>
  );
}
