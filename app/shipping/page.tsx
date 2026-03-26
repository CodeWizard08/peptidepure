import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import ShippingContent from '@/components/ShippingContent';

export const metadata: Metadata = {
  title: 'Shipping & Payment',
  description:
    'PeptidePure™ shipping rates, delivery timelines, and accepted payment methods. Free shipping on qualifying orders with cold-chain packaging included.',
  alternates: { canonical: '/shipping' },
};

export default async function ShippingPage() {
  const content = await getContent<any>('shipping');
  return <ShippingContent content={content} />;
}
