import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getContent } from '@/lib/content';
import { createClient } from '@/lib/supabase/server';
import PeptideDosingContent from '@/components/PeptideDosingContent';

export const metadata: Metadata = {
  title: 'Peptide Dosing & Safety Guide',
  description:
    'Standardized reconstitution and dosing protocols for commonly used clinical peptides. Accurate measurement with U-100 insulin syringes and proper storage guidelines.',
  alternates: { canonical: '/peptide-dosing-safety' },
  openGraph: {
    title: 'Peptide Dosing & Safety Guide — PeptidePure™',
    description:
      'Clinical reconstitution protocols, U-100 syringe conversions, and dosing guidelines for BPC-157, Tirzepatide, Retatrutide, and more.',
  },
};

export default async function PeptideDosingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account');

  const content = await getContent<any>('peptide-dosing-safety');
  return <PeptideDosingContent content={content} />;
}
