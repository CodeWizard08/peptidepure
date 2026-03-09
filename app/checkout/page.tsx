import PageHero from '@/components/sections/PageHero';
import CheckoutPage from '@/components/CheckoutPage';

export const metadata = {
  title: 'Checkout | PeptidePure',
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
