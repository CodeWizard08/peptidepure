import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us — PeptidePure™',
  description: 'Get in touch with PeptidePure™. Reach our team for questions about peptide sourcing, clinical protocols, ordering, or partnership inquiries.',
};

export default async function ContactPage() {
  const content = await getContent<any>('contact');
  return <ContactForm content={content} />;
}
