import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

const AccountPage = dynamic(() => import('@/components/AccountPage'), {
  loading: () => (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }} />
    </div>
  ),
});

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Sign in or register for verified clinician access to PeptidePure™.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AccountPage />;
}
