import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import PatientDashboard from '@/components/patient/PatientDashboard';

// Local row type — supabase-js infers PostgREST embeds as arrays even
// when the FK is single-column. We know clinic_id maps to one clinic, so
// pin it as a single object here. Matches the columns we SELECT below.
//
// Codex rescue review (Slices 3+4, NEW-1): admin_notes is NOT selected
// here even though migration 031 used to grant it to authenticated. The
// patient dashboard exposed it as "From your clinician" but the admin
// UI labels it "Admin notes" — names diverged, leaking internal notes.
// Migration 034 also revokes the column-level grant as defense-in-depth.
type DashboardIntakeRow = {
  id: string;
  created_at: string;
  status: 'new' | 'contacted' | 'archived';
  name: string;
  primary_concerns: string[];
  goals: string | null;
  current_peptides: string | null;
  reviewed_at: string | null;
  clinic_slug: string | null;
  clinic: {
    name: string;
    slug: string;
    brand_primary: string | null;
    brand_accent: string | null;
    brand_logo_url: string | null;
  } | null;
};

export const metadata: Metadata = {
  title: 'Patient Portal',
  description: 'View your PeptidePure intake submission and clinician follow-up status.',
  alternates: { canonical: '/p/dashboard' },
  // Patient portal is auth-gated and patient-specific — never indexed.
  robots: { index: false, follow: false },
};

// Auth-aware, per-request rendering.
export const dynamic = 'force-dynamic';

export default async function PatientDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Send to /p/login (built in next iteration) — for now, redirect to
    // /p/intake which is the public entry point. The auth/confirm flow
    // sets the session before we get here, so this path is hit when an
    // unauthenticated visitor types /p/dashboard directly.
    redirect('/p/intake');
  }

  // Patient portal claims by email match (see migration 031 RLS policy).
  // If a clinician account happens to share the email, they'd also see
  // this view — they have an /account dashboard too, but no harm in the
  // overlap for now.
  //
  // Slice 4 — join the clinic so we can render per-clinic branding on the
  // dashboard. PostgREST embedding via `clinic:clinics(...)` resolves the
  // patient_intakes.clinic_id FK; null when the intake's slug didn't
  // match a registered active clinic.
  const { data: intakes, error } = await supabase
    .from('patient_intakes')
    .select(
      'id, created_at, status, name, primary_concerns, goals, current_peptides, reviewed_at, clinic_slug, clinic:clinics(name, slug, brand_primary, brand_accent, brand_logo_url)'
    )
    .ilike('email', user.email ?? '')
    .order('created_at', { ascending: false });

  // RLS will silently empty the result for any auth.email() mismatch; an
  // explicit error here would be a real DB problem.
  if (error) {
    console.error('[/p/dashboard] intake fetch error:', error);
  }

  // Use the MOST RECENT intake's clinic for the dashboard's branding. A
  // patient with intakes from multiple clinics will see the brand of
  // whichever they submitted last; if they want to swap, a follow-up
  // slice could surface a clinic-picker. For now the recency tie-breaker
  // is the simplest correct rule.
  const intakeList = (intakes ?? []) as unknown as DashboardIntakeRow[];
  const branding = intakeList.find((i) => i.clinic)?.clinic ?? null;

  return (
    <PatientDashboard
      email={user.email ?? ''}
      intakes={intakeList}
      clinic={branding}
    />
  );
}
