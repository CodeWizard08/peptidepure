import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { getContent } from '@/lib/content';

const ContactForm = dynamic(() => import('@/components/ContactForm'), {
  loading: () => (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }} />
    </div>
  ),
});

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with PeptidePure™. Reach our team for questions about peptide sourcing, clinical protocols, ordering, or partnership inquiries.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us — PeptidePure™',
    description:
      'Reach our team for peptide sourcing, clinical protocols, ordering, or partnership inquiries.',
  },
};

export default async function ContactPage() {
  const content = await getContent<any>('contact');
  return <ContactForm content={content} />;
}
