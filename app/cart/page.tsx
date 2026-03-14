import PageHero from '@/components/sections/PageHero';
import CartPage from '@/components/CartPage';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review your peptide order before checkout.',
  robots: { index: false, follow: false },
};

export default function CartRoute() {
  return (
    <>
      <PageHero
        sectionLabel="Your Order"
        heading="Shopping Cart"
        subtitle="Review your items before checkout."
        compact
      />
      <CartPage />
    </>
  );
}
