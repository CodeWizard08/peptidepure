import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import ContactForm from '@/components/ContactForm';

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
