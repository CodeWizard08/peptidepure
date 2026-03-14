import dynamic from 'next/dynamic';
import PageHero from '@/components/sections/PageHero';
import type { Metadata } from 'next';

const CartPage = dynamic(() => import('@/components/CartPage'), {
  loading: () => (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }} />
    </div>
  ),
});

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
