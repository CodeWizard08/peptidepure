import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getContent } from '@/lib/content';
import InventoryDashboard from '@/components/InventoryDashboard';

type Status = 'ok' | 'low' | 'order' | 'out';

type InventoryItem = {
  product: string;
  dose: string;
  stock: number;
  status: Status;
  notes?: string;
};

type InventoryData = {
  lastUpdated: string;
  inventory: InventoryItem[];
};

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Current peptide inventory and availability for authorized clinicians.',
  alternates: { canonical: '/inventory' },
};

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account');

  const data = await getContent('inventory') as InventoryData;

  return (
    <InventoryDashboard
      inventory={data.inventory}
      lastUpdated={data.lastUpdated}
      userEmail={user.email || ''}
      userName={user.user_metadata?.full_name || user.user_metadata?.name || ''}
    />
  );
}
