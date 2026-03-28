import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Data Capture — PeptidePure™',
  description: 'Clinical data capture tools for peptide protocols: SOAP notes, baseline assessment, treatment log, and adverse event reporting.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/forms' },
};

export default async function FormsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account');
  return <>{children}</>;
}
