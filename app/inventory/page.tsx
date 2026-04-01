import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import InventoryDashboard from '@/components/InventoryDashboard';

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Current peptide inventory and availability for authorized clinicians.',
  alternates: { canonical: '/inventory' },
};

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account');

  const { data: rows } = await supabase
    .from('inventory')
    .select('id, product, dose, stock, status, notes, updated_at')
    .order('sort_order', { ascending: true });

  const inventory = (rows ?? []).map((r) => ({
    id: r.id as string,
    product: r.product as string,
    dose: r.dose as string,
    stock: r.stock as number,
    status: r.status as 'ok' | 'low' | 'order' | 'out',
    notes: r.notes as string | undefined,
  }));

  // Derive "last updated" from the most recent updated_at timestamp
  const latestTs = rows?.reduce((latest, r) => {
    const t = new Date(r.updated_at as string).getTime();
    return t > latest ? t : latest;
  }, 0);

  const lastUpdated = latestTs
    ? new Date(latestTs).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recently';

  return (
    <InventoryDashboard
      inventory={inventory}
      lastUpdated={lastUpdated}
      userEmail={user.email || ''}
      userName={user.user_metadata?.full_name || user.user_metadata?.name || ''}
    />
  );
}
