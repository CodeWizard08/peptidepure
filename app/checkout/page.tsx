import PageHero from '@/components/sections/PageHero';
import CheckoutPage from '@/components/CheckoutPage';

import type { Metadata } from 'next';

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
