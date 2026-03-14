import dynamic from 'next/dynamic';
import PageHero from '@/components/sections/PageHero';
import type { Metadata } from 'next';

const CheckoutPage = dynamic(() => import('@/components/CheckoutPage'), {
  loading: () => (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }} />
    </div>
  ),
});

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your PeptidePure™ peptide order.',
  robots: { index: false, follow: false },
};

export default function CheckoutRoute() {
  return (
    <>
      <PageHero
        sectionLabel="Checkout"
        heading="Complete Your Order"
        subtitle="Review your shipping details and confirm your order."
        compact
      />
      <CheckoutPage />
    </>
  );
}
