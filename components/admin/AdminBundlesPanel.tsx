'use client';

import { useCallback, useEffect, useState } from 'react';

type ProductOption = { id: string; name: string; sku: string | null };
type ComponentRow = { componentId: string; quantity: number };

export default function AdminBundlesPanel() {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [parentId, setParentId] = useState<string>('');
  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((data) => {
        const list = (data.products ?? []) as Array<{ id: string; name: string; sku: string | null }>;
        setProducts(list.map((p) => ({ id: p.id, name: p.name, sku: p.sku })).sort((a, b) => a.name.localeCompare(b.name)));
      })
      .finally(() => setLoading(false));
  }, []);

  const loadComponents = useCallback(async (pid: string) => {
    if (!pid) {
      setComponents([]);
      setDirty(false);
      return;
    }
    try {
      const res = await fetch(`/api/admin/bundle-components?parentId=${encodeURIComponent(pid)}`);
      const data = await res.json();
      type RawComponent = { component_product_id: string; quantity: number };
      const rows = (data.components ?? []).map((c: RawComponent) => ({
        componentId: c.component_product_id,
        quantity: c.quantity,
      }));
      setComponents(rows);
      setDirty(false);
    } catch {
      showToast('error', 'Failed to load components');
    }
  }, [showToast]);

  useEffect(() => { loadComponents(parentId); }, [parentId, loadComponents]);

  const addComponent = () => {
    setComponents((prev) => [...prev, { componentId: '', quantity: 1 }]);
    setDirty(true);
  };

  const updateComponent = (idx: number, patch: Partial<ComponentRow>) => {
    setComponents((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
    setDirty(true);
  };

  const removeComponent = (idx: number) => {
    setComponents((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!parentId) return;
    const clean = components.filter((c) => c.componentId && c.quantity > 0);
    const hasDupes = new Set(clean.map((c) => c.componentId)).size !== clean.length;
    if (hasDupes) { showToast('error', 'Each component can only appear once — merge duplicates'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/bundle-components', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId, components: clean }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Save failed');
      }
      setDirty(false);
      showToast('success', clean.length === 0 ? 'Cleared components' : `Saved ${clean.length} component${clean.length === 1 ? '' : 's'}`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const parentProduct = products.find((p) => p.id === parentId);

  return (
    <div className="p-8" style={{ background: 'var(--off-white)', minHeight: '100%' }}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>Bundle Components</h2>
          <p className="text-sm mt-1 max-w-2xl" style={{ color: 'var(--text-mid)' }}>
            Bind a bundle or protocol-package product to the individual peptides it contains. When a bundle is purchased,
            each component&apos;s inventory is decremented automatically (both <code className="font-mono text-xs">products.stock_quantity</code> and the linked inventory row).
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty || !parentId}
          className="shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: saving || !dirty || !parentId ? 'var(--text-light)' : 'var(--gold)', opacity: saving || !dirty || !parentId ? 0.6 : 1 }}
        >
          {saving ? 'Saving…' : 'Save Components'}
        </button>
      </div>

      <div className="rounded-xl p-5 mb-5" style={{ background: 'white', border: '1px solid var(--border)' }}>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-light)' }}>
          Parent (bundle / protocol product)
        </label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
          style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
        >
          <option value="">— Select a product —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}{p.sku ? ` (${p.sku})` : ''}
            </option>
          ))}
        </select>
      </div>

      {parentId && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'var(--off-white)', borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-mid)' }}>
              Components of {parentProduct?.name}
            </p>
            <button
              onClick={addComponent}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-white"
              style={{ background: 'var(--navy)' }}
            >
              + Add Component
            </button>
          </div>

          {components.length === 0 ? (
            <div className="py-14 text-center text-sm" style={{ color: 'var(--text-light)' }}>
              No components bound yet. Add one above to have it auto-decrement when this product is purchased.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Component peptide</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider w-40" style={{ color: 'var(--text-light)' }}>Qty per bundle</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {components.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2.5">
                      <select
                        value={row.componentId}
                        onChange={(e) => updateComponent(idx, { componentId: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-md text-sm focus:outline-none"
                        style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                      >
                        <option value="">— Select component —</option>
                        {products
                          .filter((p) => p.id !== parentId)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}{p.sku ? ` (${p.sku})` : ''}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => updateComponent(idx, { quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                        className="w-24 px-2.5 py-1.5 rounded-md text-sm text-center focus:outline-none"
                        style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--navy)' }}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => removeComponent(idx)}
                        className="w-7 h-7 flex items-center justify-center rounded text-sm font-bold hover:bg-red-50"
                        style={{ color: '#DC2626' }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
