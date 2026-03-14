import AccountPage from '@/components/AccountPage';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Sign in or register for verified clinician access to PeptidePure™.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AccountPage />;
}
