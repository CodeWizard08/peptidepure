import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { getContent } from '@/lib/content';

const COAGallery = dynamic(() => import('@/components/COAGallery'), {
  loading: () => (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }} />
    </div>
  ),
});

export const metadata: Metadata = {
  title: 'Certificates of Analysis',
  description:
    'View third-party Certificates of Analysis (COAs) for all PeptidePure™ peptides. Independent lab testing confirms >99% purity on every batch.',
  alternates: { canonical: '/coa' },
  openGraph: {
    title: 'Certificates of Analysis — PeptidePure™',
    description:
      'Independent lab COAs confirming >99% purity on every peptide batch.',
  },
};

export default async function COAPage() {
  const content = await getContent<any>('coa');
  return <COAGallery content={content} />;
}
