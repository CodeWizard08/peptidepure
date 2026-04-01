'use client';

import { useState, useEffect } from 'react';

type Status = 'ok' | 'low' | 'order' | 'out';

type InventoryItem = {
  product: string;
  dose: string;
  stock: number;
  status: Status;
  notes?: string;
};

const STATUS_OPTIONS: { value: Status; label: string; bg: string; color: string }[] = [
  { value: 'ok',    label: 'OK',       bg: '#D1FAE5', color: '#065F46' },
  { value: 'low',   label: 'Low',      bg: '#FEF3C7', color: '#92400E' },
  { value: 'order', label: 'On Order', bg: '#DBEAFE', color: '#1E40AF' },
  { value: 'out',   label: 'Out',      bg: '#FEE2E2', color: '#991B1B' },
];

function statusStyle(s: Status) {
  return STATUS_OPTIONS.find((o) => o.value === s) ?? STATUS_OPTIONS[0];
}

const EMPTY_ITEM: InventoryItem = { product: '', dose: '', stock: 0, status: 'ok', notes: '' };

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 align-middle">{children}</td>;
}

function TextInput({ value, onChange, placeholder, mono }: { value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-2 py-1.5 rounded-lg text-sm focus:outline-none ${mono ? 'font-mono' : ''}`}
      style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
    />
  );
}

export default function AdminInventoryListPanel() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch('/api/admin/inventory')
      .then((r) => r.json())
      .then((data) => {
        setItems(data.inventory || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markDirty = () => setDirty(true);

  const updateItem = (idx: number, patch: Partial<InventoryItem>) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, ...patch } : item));
    markDirty();
  };

  const addRow = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
    markDirty();
  };

  const deleteRow = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  const moveRow = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= items.length) return;
    const updated = [...items];
    [updated[idx], updated[next]] = [updated[next], updated[idx]];
    setItems(updated);
    markDirty();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory: items }),
      });
      if (!res.ok) throw new Error();
      setDirty(false);
      showToast('success', 'Inventory saved — live on /inventory');
    } catch {
      showToast('error', 'Failed to save inventory');
    } finally {
      setSaving(false);
    }
  };

  // Filtered view for search — editing always works on the full `items` array by real index
  const filteredIndices = items
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) => {
      const q = searchQuery.toLowerCase();
      if (q && !item.product.toLowerCase().includes(q) && !item.dose.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      return true;
    });

  return (
    <div className="p-8" style={{ background: 'var(--off-white)', minHeight: '100%' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>Inventory List</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
            Manages <span className="font-mono text-xs">/inventory</span> page — {items.length} items
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && (
            <span className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>Unsaved changes</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ background: saving || !dirty ? 'var(--text-light)' : 'var(--gold)', opacity: saving || !dirty ? 0.6 : 1 }}
          >
            {saving ? 'Saving…' : 'Save & Publish'}
          </button>
        </div>
      </div>


      {/* Filters + Add */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search product or dose…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-45 px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | Status)}
          className="px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={addRow}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'var(--navy)' }}
        >
          + Add Row
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }} />
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>Loading inventory…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--off-white)' }}>
                  {['', 'Product', 'Dose', 'Stock', 'Status', 'Notes', ''].map((h, i) => (
                    <th key={i} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-light)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredIndices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm" style={{ color: 'var(--text-light)' }}>
                      {items.length === 0 ? 'No inventory items yet. Click "+ Add Row" to start.' : 'No items match your filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredIndices.map(({ item, idx }) => {
                    const st = statusStyle(item.status);
                    return (
                      <tr
                        key={idx}
                        style={{ borderBottom: '1px solid var(--border)' }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Move up/down */}
                        <Cell>
                          <div className="flex flex-col gap-0.5">
                            <button onClick={() => moveRow(idx, -1)} className="w-5 h-5 flex items-center justify-center rounded text-xs" style={{ color: 'var(--text-light)', background: 'var(--off-white)' }} title="Move up">▲</button>
                            <button onClick={() => moveRow(idx, 1)}  className="w-5 h-5 flex items-center justify-center rounded text-xs" style={{ color: 'var(--text-light)', background: 'var(--off-white)' }} title="Move down">▼</button>
                          </div>
                        </Cell>

                        {/* Product */}
                        <Cell>
                          <TextInput
                            value={item.product}
                            onChange={(v) => updateItem(idx, { product: v })}
                            placeholder="Product name"
                          />
                        </Cell>

                        {/* Dose */}
                        <Cell>
                          <TextInput
                            value={item.dose}
                            onChange={(v) => updateItem(idx, { dose: v })}
                            placeholder="e.g. 10mg"
                            mono
                          />
                        </Cell>

                        {/* Stock */}
                        <Cell>
                          <input
                            type="number"
                            min="0"
                            value={item.stock}
                            onChange={(e) => updateItem(idx, { stock: parseInt(e.target.value, 10) || 0 })}
                            className="w-20 px-2 py-1.5 rounded-lg text-sm font-semibold focus:outline-none text-center"
                            style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--navy)' }}
                          />
                        </Cell>

                        {/* Status */}
                        <Cell>
                          <select
                            value={item.status}
                            onChange={(e) => updateItem(idx, { status: e.target.value as Status })}
                            className="px-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none"
                            style={{ background: st.bg, color: st.color, border: '1px solid transparent' }}
                          >
                            {STATUS_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </Cell>

                        {/* Notes */}
                        <Cell>
                          <TextInput
                            value={item.notes || ''}
                            onChange={(v) => updateItem(idx, { notes: v })}
                            placeholder="Optional notes…"
                          />
                        </Cell>

                        {/* Delete */}
                        <Cell>
                          <button
                            onClick={() => deleteRow(idx)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold transition-colors hover:bg-red-50"
                            style={{ color: '#DC2626' }}
                            title="Delete row"
                          >
                            ✕
                          </button>
                        </Cell>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer add row */}
      {!loading && (
        <button
          onClick={addRow}
          className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ color: 'var(--text-mid)', border: '2px dashed var(--border)', background: 'transparent' }}
        >
          + Add Row
        </button>
      )}

      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg" style={{ background: toast.type === 'success' ? '#059669' : '#DC2626', color: 'white' }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
