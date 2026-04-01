'use client';

import { useState, useEffect, useCallback } from 'react';

type InventoryStatus = 'in_stock' | 'lead_time' | 'oos';

type Product = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price_cents: number;
  is_active: boolean;
  metadata: {
    inventory?: InventoryStatus;
    lead_time_days?: number;
    patient_price_cents?: number;
    [key: string]: unknown;
  };
};

type RowState = {
  price_dollars: string;
  patient_price_dollars: string;
  inventory: InventoryStatus;
  lead_time_days: string;
  dirty: boolean;
  saving: boolean;
};

const INVENTORY_OPTIONS: { value: InventoryStatus; label: string; color: string; bg: string }[] = [
  { value: 'in_stock', label: 'In Stock', color: '#065F46', bg: '#D1FAE5' },
  { value: 'lead_time', label: 'Lead Time', color: '#92400E', bg: '#FEF3C7' },
  { value: 'oos', label: 'Out of Stock', color: '#991B1B', bg: '#FEE2E2' },
];

function inventoryColor(status: InventoryStatus) {
  return INVENTORY_OPTIONS.find((o) => o.value === status) ?? INVENTORY_OPTIONS[0];
}

function productToRow(p: Product): RowState {
  return {
    price_dollars: p.price_cents ? String(p.price_cents / 100) : '',
    patient_price_dollars: p.metadata?.patient_price_cents
      ? String((p.metadata.patient_price_cents as number) / 100)
      : '',
    inventory: (p.metadata?.inventory as InventoryStatus) || 'in_stock',
    lead_time_days: p.metadata?.lead_time_days ? String(p.metadata.lead_time_days) : '',
    dirty: false,
    saving: false,
  };
}

export default function AdminInventoryPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [inventoryFilter, setInventoryFilter] = useState('all');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error();
      const data = await res.json();
      const prods: Product[] = data.products || [];
      setProducts(prods);
      const initial: Record<string, RowState> = {};
      prods.forEach((p) => { initial[p.id] = productToRow(p); });
      setRows(initial);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateRow = (id: string, patch: Partial<RowState>) => {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch, dirty: true } }));
  };

  const handleSave = async (product: Product) => {
    const row = rows[product.id];
    if (!row) return;
    setRows((prev) => ({ ...prev, [product.id]: { ...prev[product.id], saving: true } }));

    const price_cents = row.price_dollars ? Math.round(parseFloat(row.price_dollars) * 100) : 0;
    const patient_price_cents = row.patient_price_dollars
      ? Math.round(parseFloat(row.patient_price_dollars) * 100)
      : undefined;

    const metadata = {
      ...product.metadata,
      inventory: row.inventory,
      ...(row.inventory === 'lead_time' && row.lead_time_days
        ? { lead_time_days: parseInt(row.lead_time_days, 10) }
        : { lead_time_days: undefined }),
      ...(patient_price_cents !== undefined ? { patient_price_cents } : {}),
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, price_cents, metadata }),
      });
      if (!res.ok) throw new Error();
      showToast('success', `${product.name} updated`);
      setRows((prev) => ({ ...prev, [product.id]: { ...prev[product.id], dirty: false, saving: false } }));
      // Refresh product list in background
      fetch('/api/admin/products').then((r) => r.json()).then((data) => {
        setProducts(data.products || []);
      });
    } catch {
      showToast('error', `Failed to save ${product.name}`);
      setRows((prev) => ({ ...prev, [product.id]: { ...prev[product.id], saving: false } }));
    }
  };

  const handleSaveAll = async () => {
    const dirtyProducts = products.filter((p) => rows[p.id]?.dirty);
    if (dirtyProducts.length === 0) return;
    for (const p of dirtyProducts) {
      await handleSave(p);
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  const dirtyCount = Object.values(rows).filter((r) => r.dirty).length;

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (inventoryFilter !== 'all' && (rows[p.id]?.inventory || p.metadata?.inventory || 'in_stock') !== inventoryFilter) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-8" style={{ background: 'var(--off-white)', minHeight: '100%' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>Inventory & Pricing</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
            Inline edit prices and stock status for all products
          </p>
        </div>
        {dirtyCount > 0 && (
          <button
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ background: 'var(--gold)' }}
          >
            Save All ({dirtyCount} changed)
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
          Failed to load products.
        </div>
      )}

      {/* Filters */}
      {!loading && products.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            type="text"
            placeholder="Search by product name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-45 px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
          <select
            value={inventoryFilter}
            onChange={(e) => setInventoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
          >
            <option value="all">All Stock Status</option>
            {INVENTORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }} />
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>Loading products…</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>
              {products.length === 0 ? 'No products yet.' : 'No products match your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--off-white)' }}>
                  {['Product', 'Status', 'Clinician Price', 'Retail / Patient Price', 'Stock Status', 'Lead Time (days)', ''].map((h) => {
                    const hideMobile = ['Status', 'Retail / Patient Price', 'Lead Time (days)'].includes(h);
                    return (
                      <th key={h} className={`px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${hideMobile ? 'hidden lg:table-cell' : ''}`} style={{ color: 'var(--text-light)' }}>
                        {h}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, idx) => {
                  const row = rows[product.id];
                  if (!row) return null;
                  const inv = inventoryColor(row.inventory);
                  const isDirty = row.dirty;
                  return (
                    <tr
                      key={product.id}
                      style={{
                        borderBottom: idx < filteredProducts.length - 1 ? '1px solid var(--border)' : 'none',
                        background: isDirty ? '#FFFBEB' : 'white',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Product name */}
                      <td className="px-3 sm:px-4 py-3">
                        <p className="text-sm font-semibold truncate max-w-40" style={{ color: 'var(--navy)' }}>{product.name}</p>
                        <p className="text-xs mt-0.5 truncate max-w-40" style={{ color: 'var(--text-light)' }}>{product.category}{product.subcategory ? ` · ${product.subcategory}` : ''}</p>
                      </td>

                      {/* Active badge */}
                      <td className="px-3 sm:px-4 py-3 hidden lg:table-cell">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full"
                          style={{
                            background: product.is_active ? '#D1FAE5' : '#F3F4F6',
                            color: product.is_active ? '#065F46' : '#6B7280',
                          }}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Clinician price */}
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs" style={{ color: 'var(--text-light)' }}>$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.price_dollars}
                            onChange={(e) => updateRow(product.id, { price_dollars: e.target.value })}
                            className="w-24 px-2 py-1.5 rounded-lg text-sm focus:outline-none font-semibold"
                            style={{
                              background: 'var(--off-white)',
                              border: `1px solid ${isDirty ? 'var(--gold)' : 'var(--border)'}`,
                              color: 'var(--navy)',
                            }}
                          />
                        </div>
                      </td>

                      {/* Retail / patient price */}
                      <td className="px-3 sm:px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <span className="text-xs" style={{ color: 'var(--text-light)' }}>$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.patient_price_dollars}
                            onChange={(e) => updateRow(product.id, { patient_price_dollars: e.target.value })}
                            placeholder="—"
                            className="w-24 px-2 py-1.5 rounded-lg text-sm focus:outline-none"
                            style={{
                              background: 'var(--off-white)',
                              border: `1px solid ${isDirty ? 'var(--gold)' : 'var(--border)'}`,
                              color: 'var(--text-dark)',
                            }}
                          />
                        </div>
                      </td>

                      {/* Inventory status */}
                      <td className="px-3 sm:px-4 py-3">
                        <select
                          value={row.inventory}
                          onChange={(e) => updateRow(product.id, { inventory: e.target.value as InventoryStatus })}
                          className="px-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none"
                          style={{
                            background: inv.bg,
                            color: inv.color,
                            border: `1px solid ${isDirty ? 'var(--gold)' : 'transparent'}`,
                          }}
                        >
                          {INVENTORY_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Lead time days — only relevant when status is lead_time */}
                      <td className="px-3 sm:px-4 py-3 hidden lg:table-cell">
                        {row.inventory === 'lead_time' ? (
                          <input
                            type="number"
                            min="1"
                            value={row.lead_time_days}
                            onChange={(e) => updateRow(product.id, { lead_time_days: e.target.value })}
                            placeholder="e.g. 7"
                            className="w-20 px-2 py-1.5 rounded-lg text-sm focus:outline-none"
                            style={{
                              background: 'var(--off-white)',
                              border: `1px solid ${isDirty ? 'var(--gold)' : 'var(--border)'}`,
                              color: 'var(--text-dark)',
                            }}
                          />
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-light)' }}>—</span>
                        )}
                      </td>

                      {/* Save button */}
                      <td className="px-3 sm:px-4 py-3">
                        {isDirty && (
                          <button
                            onClick={() => handleSave(product)}
                            disabled={row.saving}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white whitespace-nowrap"
                            style={{ background: row.saving ? 'var(--text-light)' : 'var(--gold)', opacity: row.saving ? 0.7 : 1 }}
                          >
                            {row.saving ? 'Saving…' : 'Save'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      {!loading && products.length > 0 && (
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <p className="text-xs" style={{ color: 'var(--text-light)' }}>
            <span style={{ color: '#92400E' }}>●</span> Yellow rows have unsaved changes
          </p>
          <p className="text-xs" style={{ color: 'var(--text-light)' }}>
            Clinician Price = what the clinician pays &nbsp;·&nbsp; Retail Price = suggested patient-facing price
          </p>
        </div>
      )}

      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg" style={{ background: toast.type === 'success' ? '#059669' : '#DC2626', color: 'white' }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
