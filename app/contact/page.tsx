import { getContent } from '@/lib/content';
import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  const content = getContent<any>('contact');
  return <ContactForm content={content} />;
}
