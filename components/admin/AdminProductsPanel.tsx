'use client';

import { useState, useEffect, useCallback } from 'react';

type ProductMetadata = {
  strength?: string;
  amount?: string;
  form?: string;
  brand?: string;
  inventory?: 'in_stock' | 'lead_time' | 'oos';
  lead_time_days?: number;
  patient_price_cents?: number;
  [key: string]: unknown;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  price_cents: number;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  metadata: ProductMetadata;
  created_at?: string;
};

type FormState = {
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  description: string;
  price_dollars: string;
  patient_price_dollars: string;
  image_url: string;
  sort_order: string;
  is_active: boolean;
  strength: string;
  amount: string;
  form: string;
  brand: string;
  inventory: 'in_stock' | 'lead_time' | 'oos';
  lead_time_days: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  slug: '',
  category: '',
  subcategory: '',
  description: '',
  price_dollars: '',
  patient_price_dollars: '',
  image_url: '',
  sort_order: '0',
  is_active: true,
  strength: '',
  amount: '',
  form: '',
  brand: '',
  inventory: 'in_stock',
  lead_time_days: '',
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function productToForm(p: Product): FormState {
  const meta = p.metadata || {};
  return {
    name: p.name || '',
    slug: p.slug || '',
    category: p.category || '',
    subcategory: p.subcategory || '',
    description: p.description || '',
    price_dollars: p.price_cents ? String(p.price_cents / 100) : '',
    patient_price_dollars: meta.patient_price_cents
      ? String((meta.patient_price_cents as number) / 100)
      : '',
    image_url: p.image_url || '',
    sort_order: String(p.sort_order ?? 0),
    is_active: p.is_active ?? true,
    strength: (meta.strength as string) || '',
    amount: (meta.amount as string) || '',
    form: (meta.form as string) || '',
    brand: (meta.brand as string) || '',
    inventory: (meta.inventory as 'in_stock' | 'lead_time' | 'oos') || 'in_stock',
    lead_time_days: meta.lead_time_days ? String(meta.lead_time_days) : '',
  };
}

function formToPayload(f: FormState): Record<string, unknown> {
  const price_cents = f.price_dollars ? Math.round(parseFloat(f.price_dollars) * 100) : 0;
  const patient_price_cents = f.patient_price_dollars
    ? Math.round(parseFloat(f.patient_price_dollars) * 100)
    : undefined;

  const metadata: ProductMetadata = {};
  if (f.strength) metadata.strength = f.strength;
  if (f.amount) metadata.amount = f.amount;
  if (f.form) metadata.form = f.form;
  if (f.brand) metadata.brand = f.brand;
  if (f.inventory) metadata.inventory = f.inventory;
  if (f.inventory === 'lead_time' && f.lead_time_days) {
    metadata.lead_time_days = parseInt(f.lead_time_days, 10);
  }
  if (patient_price_cents !== undefined) metadata.patient_price_cents = patient_price_cents;

  return {
    name: f.name,
    slug: f.slug,
    category: f.category,
    subcategory: f.subcategory,
    description: f.description,
    price_cents,
    image_url: f.image_url,
    is_active: f.is_active,
    sort_order: parseInt(f.sort_order, 10) || 0,
    metadata,
  };
}

const STATUS_BADGE = {
  active: { bg: '#D1FAE5', text: '#065F46' },
  inactive: { bg: '#F3F4F6', text: '#6B7280' },
};

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-mid)' }}>
        {label}
        {required && <span style={{ color: '#DC2626' }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
        style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
      />
      {hint && <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>{hint}</p>}
    </div>
  );
}

export default function AdminProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [formState, setFormState] = useState<FormState>(EMPTY_FORM);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormState(productToForm(product));
    setSlugManuallyEdited(true); // Don't auto-update slug when editing existing
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormState(EMPTY_FORM);
    setSlugManuallyEdited(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormState(EMPTY_FORM);
    setSlugManuallyEdited(false);
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState((prev) => {
      const updated = { ...prev, [key]: value };
      // Auto-generate slug from name if not manually edited
      if (key === 'name' && !slugManuallyEdited) {
        updated.slug = slugify(value as string);
      }
      return updated;
    });
  };

  const handleSlugChange = (v: string) => {
    setSlugManuallyEdited(true);
    setField('slug', v);
  };

  const handleSave = async () => {
    if (!formState.name.trim()) {
      showToast('error', 'Product name is required');
      return;
    }
    if (!formState.category.trim()) {
      showToast('error', 'Category is required');
      return;
    }

    setSaving(true);
    const payload = formToPayload(formState);

    try {
      let res: Response;
      if (editingId === 'new') {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save');
      }

      showToast('success', editingId === 'new' ? 'Product created!' : 'Product updated!');
      handleCancel();
      await fetchProducts();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, is_active: !product.is_active }),
      });
      if (!res.ok) throw new Error();
      showToast('success', `Product ${!product.is_active ? 'activated' : 'deactivated'}`);
      await fetchProducts();
    } catch {
      showToast('error', 'Failed to update product status');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('success', 'Product deleted');
      setConfirmDeleteId(null);
      await fetchProducts();
    } catch {
      showToast('error', 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.slug?.toLowerCase().includes(q)) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (statusFilter === 'active' && !p.is_active) return false;
    if (statusFilter === 'inactive' && p.is_active) return false;
    return true;
  });

  const isEditing = editingId !== null;

  return (
    <div className="p-8" style={{ background: 'var(--off-white)', minHeight: '100%' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
            Products
          </h2>
          {!loading && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
              {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={handleAddNew}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ background: 'var(--gold)' }}
          >
            + Add Product
          </button>
        )}
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm"
          style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}
        >
          Failed to load products.
        </div>
      )}

      {/* Search + filters */}
      {!isEditing && !loading && products.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            type="text"
            placeholder="Search by name or slug…"
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}

      {/* Add / Edit Form */}
      {isEditing && (
        <div
          className="mb-8 rounded-xl p-6"
          style={{ background: 'white', border: '2px solid rgba(200,149,44,0.3)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold" style={{ color: 'var(--navy)' }}>
              {editingId === 'new' ? 'Add New Product' : 'Edit Product'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--text-mid)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <InputField
              label="Name"
              value={formState.name}
              onChange={(v) => setField('name', v)}
              placeholder="e.g. BPC-157"
              required
            />

            {/* Slug */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-mid)' }}>
                Slug
              </label>
              <input
                type="text"
                value={formState.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="auto-generated from name"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none font-mono"
                style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
              />
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
                Auto-generated from name. Edit to override.
              </p>
            </div>

            {/* Category */}
            <InputField
              label="Category"
              value={formState.category}
              onChange={(v) => setField('category', v)}
              placeholder="e.g. Peptides"
              required
            />

            {/* Subcategory */}
            <InputField
              label="Subcategory"
              value={formState.subcategory}
              onChange={(v) => setField('subcategory', v)}
              placeholder="e.g. Growth Hormone Secretagogues"
            />

            {/* Price */}
            <InputField
              label="Price ($)"
              value={formState.price_dollars}
              onChange={(v) => setField('price_dollars', v)}
              type="number"
              placeholder="0.00"
              hint="Stored as cents (× 100)"
            />

            {/* Patient / Suggested Retail Price */}
            <InputField
              label="Suggested Retail Price ($)"
              value={formState.patient_price_dollars}
              onChange={(v) => setField('patient_price_dollars', v)}
              type="number"
              placeholder="0.00"
              hint="Stored in metadata.patient_price_cents"
            />

            {/* Image URL */}
            <InputField
              label="Image URL"
              value={formState.image_url}
              onChange={(v) => setField('image_url', v)}
              placeholder="https://..."
            />

            {/* Sort Order */}
            <InputField
              label="Sort Order"
              value={formState.sort_order}
              onChange={(v) => setField('sort_order', v)}
              type="number"
              placeholder="0"
            />
          </div>

          {/* Description */}
          <div className="mt-5">
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-mid)' }}>
              Description
            </label>
            <textarea
              value={formState.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-y"
              style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
              placeholder="Product description…"
            />
          </div>

          {/* Metadata fields */}
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-light)' }}>
              Metadata
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InputField
                label="Strength"
                value={formState.strength}
                onChange={(v) => setField('strength', v)}
                placeholder="e.g. 5mg"
              />
              <InputField
                label="Amount"
                value={formState.amount}
                onChange={(v) => setField('amount', v)}
                placeholder="e.g. 10ml"
              />
              <InputField
                label="Form"
                value={formState.form}
                onChange={(v) => setField('form', v)}
                placeholder="e.g. lyophilized"
              />
              <InputField
                label="Brand"
                value={formState.brand}
                onChange={(v) => setField('brand', v)}
                placeholder="e.g. PeptidePure"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Inventory */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-mid)' }}>
                  Inventory Status
                </label>
                <select
                  value={formState.inventory}
                  onChange={(e) => setField('inventory', e.target.value as 'in_stock' | 'lead_time' | 'oos')}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                >
                  <option value="in_stock">In Stock</option>
                  <option value="lead_time">Lead Time</option>
                  <option value="oos">Out of Stock</option>
                </select>
              </div>

              {/* Lead Time Days — only shown if lead_time */}
              {formState.inventory === 'lead_time' && (
                <InputField
                  label="Lead Time Days"
                  value={formState.lead_time_days}
                  onChange={(v) => setField('lead_time_days', v)}
                  type="number"
                  placeholder="e.g. 7"
                />
              )}
            </div>
          </div>

          {/* Active toggle */}
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setField('is_active', !formState.is_active)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ background: formState.is_active ? 'var(--gold)' : 'var(--border)' }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
                style={{ transform: formState.is_active ? 'translateX(1.375rem)' : 'translateX(0.25rem)' }}
              />
            </button>
            <span className="text-sm font-medium" style={{ color: 'var(--text-dark)' }}>
              {formState.is_active ? 'Active (visible to customers)' : 'Inactive (hidden)'}
            </span>
          </div>

          {/* Save / Cancel */}
          <div className="flex items-center gap-3 mt-6 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: saving ? 'var(--text-light)' : 'var(--gold)', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving…' : editingId === 'new' ? 'Create Product' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-lg text-sm font-medium"
              style={{ color: 'var(--text-mid)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Product table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'white', border: '1px solid var(--border)' }}
      >
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 rounded-full animate-spin"
              style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>
              Loading products…
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-mid)' }}>
              No products yet
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
              Click &ldquo;Add Product&rdquo; to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm" style={{ color: 'var(--text-light)' }}>No products match your filters.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--off-white)' }}>
                    {['Name', 'Category', 'Price', 'Status', 'Sort', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-light)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, idx) => {
                    const badge = product.is_active ? STATUS_BADGE.active : STATUS_BADGE.inactive;
                    const isCurrentlyEditing = editingId === product.id;
                    const isConfirmingDelete = confirmDeleteId === product.id;
                    return (
                      <tr
                        key={product.id}
                        style={{
                          borderBottom: idx < filteredProducts.length - 1 ? '1px solid var(--border)' : 'none',
                          background: isCurrentlyEditing ? 'var(--gold-pale)' : 'white',
                        }}
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>{product.name}</p>
                          {product.slug && <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-light)' }}>/{product.slug}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm" style={{ color: 'var(--text-dark)' }}>{product.category}</span>
                          {product.subcategory && <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>{product.subcategory}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>{fmt(product.price_cents)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full" style={{ background: badge.bg, color: badge.text }}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm" style={{ color: 'var(--text-mid)' }}>{product.sort_order}</span>
                        </td>
                        <td className="px-5 py-4">
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs" style={{ color: '#991B1B' }}>Delete permanently?</span>
                              <button onClick={() => handleDelete(product.id)} disabled={deleting} className="text-xs px-2 py-1 rounded-lg font-bold text-white" style={{ background: '#DC2626' }}>
                                {deleting ? '…' : 'Yes'}
                              </button>
                              <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ color: 'var(--text-mid)', border: '1px solid var(--border)' }}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleEdit(product)} className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ color: 'var(--navy)', background: 'var(--off-white)', border: '1px solid var(--border)' }}>
                                Edit
                              </button>
                              <button onClick={() => handleToggleActive(product)} className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ color: product.is_active ? '#991B1B' : '#065F46', background: product.is_active ? '#FEE2E2' : '#D1FAE5', border: `1px solid ${product.is_active ? '#FCA5A5' : '#6EE7B7'}` }}>
                                {product.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button onClick={() => setConfirmDeleteId(product.id)} className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ color: '#991B1B', background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{
            background: toast.type === 'success' ? '#059669' : '#DC2626',
            color: 'white',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
