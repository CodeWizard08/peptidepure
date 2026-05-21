import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SherpaConsole from '@/components/ai-sherpa/SherpaConsole';

export const metadata: Metadata = {
  title: 'AI Sherpa | Peptide Pure',
  description:
    'AI Sherpa — clinician-only peptide research assistant grounded in the Peptide Pure protocol library. Ask about a symptom, a stack, a reconstitution, or a contraindication.',
  alternates: { canonical: '/ai-sherpa' },
  robots: { index: false, follow: false },
};

// The chat API uses authenticated cookies; force dynamic so the page always
// reflects the current session.
export const dynamic = 'force-dynamic';

export default async function AISherpaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/account?next=/ai-sherpa');
  }

  return <SherpaConsole />;
}
