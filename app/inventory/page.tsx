import { getContent } from '@/lib/content';

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

const STATUS_CONFIG: Record<Status, { label: string; bg: string; text: string; dot: string }> = {
  ok:    { label: 'In Stock',   bg: '#ECFDF5', text: '#065F46', dot: '#10B981' },
  low:   { label: 'Low Stock',  bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B' },
  order: { label: 'Low — On Order', bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' },
  out:   { label: 'Out of Stock',   bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
};

export const metadata = {
  title: 'Inventory — PeptidePure™',
  description: 'Current peptide inventory and availability for authorized clinicians.',
};

export default async function InventoryPage() {
  const data = await getContent('inventory') as InventoryData;
  const { lastUpdated, inventory } = data;

  // Group by status for summary counts
  const counts = {
    ok: inventory.filter((i) => i.status === 'ok').length,
    low: inventory.filter((i) => i.status === 'low').length,
    order: inventory.filter((i) => i.status === 'order').length,
    out: inventory.filter((i) => i.status === 'out').length,
  };

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

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {([
              { key: 'ok' as const, label: 'In Stock', count: counts.ok },
              { key: 'low' as const, label: 'Low Stock', count: counts.low },
              { key: 'order' as const, label: 'On Order', count: counts.order },
              { key: 'out' as const, label: 'Out of Stock', count: counts.out },
            ]).map(({ key, label, count }) => (
              <div
                key={key}
                className="bg-white rounded-xl p-4 text-center"
                style={{ border: '1px solid var(--border)' }}
              >
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-2"
                  style={{ background: STATUS_CONFIG[key].dot }}
                />
                <div className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>{count}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-mid)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Inventory table */}
          <div
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--navy)' }}>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">
                      Product
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">
                      Dose
                    </th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">
                      Stock
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">
                      Status
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item, i) => {
                    const cfg = STATUS_CONFIG[item.status];
                    return (
                      <tr
                        key={`${item.product}-${item.dose}`}
                        className="transition-colors hover:bg-gray-50"
                        style={{ borderBottom: i < inventory.length - 1 ? '1px solid var(--border)' : 'none' }}
                      >
                        <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--navy)' }}>
                          {item.product}
                        </td>
                        <td className="px-5 py-3.5" style={{ color: 'var(--text-mid)' }}>
                          {item.dose}
                        </td>
                        <td className="px-5 py-3.5 text-center font-semibold" style={{ color: 'var(--navy)' }}>
                          {item.stock}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ background: cfg.bg, color: cfg.text }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: cfg.dot }}
                            />
                            {cfg.label}
                          </span>
                        </td>
                        <td
                          className="px-5 py-3.5 text-xs hidden md:table-cell"
                          style={{ color: 'var(--text-light)' }}
                        >
                          {item.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: 'var(--text-light)' }}>
            Inventory levels are updated regularly. Contact us for real-time availability on specific products.
          </p>

        </div>
      </div>
    </div>
  );
}
