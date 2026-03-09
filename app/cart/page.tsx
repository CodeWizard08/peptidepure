import PageHero from '@/components/sections/PageHero';
import CartPage from '@/components/CartPage';

export const metadata = {
  title: 'Cart | PeptidePure',
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
