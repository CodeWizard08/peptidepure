import type { Metadata } from 'next';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
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

// Auth-aware (clinic branding depends on the slug in the URL), per-request.
export const dynamic = 'force-dynamic';

// Branding subset surfaced to the form. Kept minimal so we never leak
// internal fields like notes or owner_user_id to the public page.
export type ClinicBranding = {
  name: string;
  slug: string;
  brand_primary: string | null;
  brand_accent: string | null;
  brand_logo_url: string | null;
};

const SLUG_RE = /^[a-z0-9_-]{1,64}$/;

async function fetchClinicBranding(slug: string | undefined): Promise<ClinicBranding | null> {
  if (!slug) return null;
  const normalized = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64);
  if (!SLUG_RE.test(normalized)) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('clinics')
    .select('name, slug, brand_primary, brand_accent, brand_logo_url')
    .eq('slug', normalized)
    .eq('status', 'active')
    .maybeSingle<ClinicBranding>();
  return data ?? null;
}

export default async function PatientIntakePage({
  searchParams,
}: {
  searchParams: Promise<{ clinic?: string; ref?: string }>;
}) {
  const { clinic: clinicParam } = await searchParams;
  const clinic = await fetchClinicBranding(clinicParam);

  // White-label hero — when a clinic is registered with branding, use its
  // name in the section label so the patient knows the page is operating
  // on behalf of that clinic. Falls back to the default PeptidePure framing.
  const sectionLabel = clinic ? `${clinic.name} · Patient Intake` : 'Patient Intake';

  return (
    <>
      <PageHero
        sectionLabel={sectionLabel}
        heading="Tell us about you"
        subtitle="Your responses go directly to a PeptidePure clinician. Allow about 3 minutes."
      />
      <Suspense fallback={null}>
        <PatientIntakeForm clinic={clinic} />
      </Suspense>
    </>
  );
}
