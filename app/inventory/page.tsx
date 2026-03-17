import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import InventoryTable from '@/components/InventoryTable';

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
  const data = await getContent('inventory') as InventoryData;
  const { lastUpdated, inventory } = data;

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="pt-28 pb-12" style={{ background: 'var(--navy)' }}>
        <div className="container-xl">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--gold)' }}
          >
            Clinician Portal
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Current Inventory
          </h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      <div className="py-10">
        <div className="container-xl">
          <InventoryTable inventory={inventory} />

          <p className="text-xs text-center mt-6" style={{ color: 'var(--text-light)' }}>
            Inventory levels are updated regularly. Contact us for real-time availability on specific products.
          </p>
        </div>
      </div>
    </div>
  );
}
