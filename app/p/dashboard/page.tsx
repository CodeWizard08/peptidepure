import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import PatientDashboard from '@/components/patient/PatientDashboard';

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
  const { data: intakes, error } = await supabase
    .from('patient_intakes')
    .select('id, created_at, status, name, primary_concerns, goals, current_peptides, admin_notes, reviewed_at, clinic_slug')
    .ilike('email', user.email ?? '')
    .order('created_at', { ascending: false });

  // RLS will silently empty the result for any auth.email() mismatch; an
  // explicit error here would be a real DB problem.
  if (error) {
    console.error('[/p/dashboard] intake fetch error:', error);
  }

  return (
    <PatientDashboard
      email={user.email ?? ''}
      intakes={intakes ?? []}
    />
  );
}
