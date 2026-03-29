import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import type { OurCompanyPageContent } from '@/lib/content-types';
import OurCompanyContent from '@/components/OurCompanyContent';

export const metadata: Metadata = {
  title: 'Our Company',
  description:
    'Meet the team behind PeptidePure™. Our mission is to provide licensed clinicians with the highest-quality peptides sourced from USA cGMP facilities.',
  alternates: { canonical: '/our-company' },
  openGraph: {
    title: 'Our Company — PeptidePure™',
    description:
      'Our mission: highest-quality peptides from USA cGMP facilities, exclusively for licensed clinicians.',
  },
};

export default async function OurCompanyPage() {
  const content = await getContent<OurCompanyPageContent>('our-company');
  return <OurCompanyContent content={content} />;
}
