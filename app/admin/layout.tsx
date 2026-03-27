import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/admin-auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await isAuthenticated();
  if (!isAdmin) redirect('/account');
  return <div id="admin-root">{children}</div>;
}
