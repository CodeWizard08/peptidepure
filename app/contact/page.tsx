import { getContent } from '@/lib/content';
import ContactForm from '@/components/ContactForm';

export default async function ContactPage() {
  const content = await getContent<any>('contact');
  return <ContactForm content={content} />;
}
