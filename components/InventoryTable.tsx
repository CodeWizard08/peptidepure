'use client';

import { useState, useMemo } from 'react';

type Status = 'ok' | 'low' | 'order' | 'out';

type InventoryItem = {
  product: string;
  dose: string;
  stock: number;
  status: Status;
  notes?: string;
};

const STATUS_CONFIG: Record<Status, { label: string; bg: string; text: string; dot: string }> = {
  ok:    { label: 'In Stock',        bg: '#ECFDF5', text: '#065F46', dot: '#10B981' },
  low:   { label: 'Low Stock',       bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B' },
  order: { label: 'Low — On Order',  bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' },
  out:   { label: 'Out of Stock',    bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
};

const FILTER_CARDS: { key: Status | 'all'; label: string }[] = [
  { key: 'all',   label: 'All Products' },
  { key: 'ok',    label: 'In Stock'     },
  { key: 'low',   label: 'Low Stock'    },
  { key: 'order', label: 'On Order'     },
  { key: 'out',   label: 'Out of Stock' },
];

export default function InventoryTable({ inventory }: { inventory: InventoryItem[] }) {
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState<Status | 'all'>('all');

  const counts = useMemo(() => ({
    all:   inventory.length,
    ok:    inventory.filter((i) => i.status === 'ok').length,
    low:   inventory.filter((i) => i.status === 'low').length,
    order: inventory.filter((i) => i.status === 'order').length,
    out:   inventory.filter((i) => i.status === 'out').length,
  }), [inventory]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inventory.filter((item) => {
      const matchesStatus = activeStatus === 'all' || item.status === activeStatus;
      const matchesSearch =
        !q ||
        item.product.toLowerCase().includes(q) ||
        item.dose.toLowerCase().includes(q) ||
        (item.notes ?? '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [inventory, search, activeStatus]);

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-light)' }}
            fill="none" stroke="currentColor" strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
            style={{
              border: '1px solid var(--border)',
              background: 'white',
              color: 'var(--navy)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full"
              style={{ color: 'var(--text-light)' }}
              aria-label="Clear search"
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Summary / filter cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        {FILTER_CARDS.map(({ key, label }) => {
          const isActive = activeStatus === key;
          const dotColor = key === 'all' ? 'var(--navy)' : STATUS_CONFIG[key as Status].dot;
          return (
            <button
              key={key}
              onClick={() => setActiveStatus(key)}
              className="rounded-xl p-4 text-center transition-all"
              style={{
                border: isActive ? '2px solid var(--navy)' : '1px solid var(--border)',
                background: isActive ? 'var(--navy)' : 'white',
                boxShadow: isActive ? '0 2px 8px rgba(11,31,58,0.12)' : undefined,
              }}
            >
              <div
                className="w-3 h-3 rounded-full mx-auto mb-2"
                style={{ background: isActive ? 'var(--gold)' : dotColor }}
              />
              <div
                className="text-2xl font-bold"
                style={{ color: isActive ? 'white' : 'var(--navy)' }}
              >
                {counts[key]}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-mid)' }}
              >
                {label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        {filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-light)' }}>
            <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
            <p className="text-sm font-medium">No products match your filters.</p>
            <button
              onClick={() => { setSearch(''); setActiveStatus('all'); }}
              className="mt-3 text-xs underline"
              style={{ color: 'var(--navy)' }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--navy)' }}>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">Product</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">Dose</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">Stock</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const cfg = STATUS_CONFIG[item.status];
                  return (
                    <tr
                      key={`${item.product}-${item.dose}`}
                      className="transition-colors hover:bg-gray-50"
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
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
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs hidden md:table-cell" style={{ color: 'var(--text-light)' }}>
                        {item.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Result count */}
      {(search || activeStatus !== 'all') && (
        <p className="text-xs mt-4 text-center" style={{ color: 'var(--text-light)' }}>
          Showing {filtered.length} of {inventory.length} products
          {search && <> matching &ldquo;<strong>{search}</strong>&rdquo;</>}
          {activeStatus !== 'all' && <> · filtered by <strong>{FILTER_CARDS.find(f => f.key === activeStatus)?.label}</strong></>}
        </p>
      )}
    </>
  );
}
