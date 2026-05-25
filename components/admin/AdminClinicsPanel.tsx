'use client';

import { useState, useEffect, useCallback } from 'react';

type Clinic = {
  id: string;
  slug: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  brand_primary: string | null;
  brand_accent: string | null;
  brand_logo_url: string | null;
  status: 'active' | 'suspended' | 'archived';
  owner_user_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'archived', label: 'Archived' },
];

const STATUS_COLORS: Record<Clinic['status'], { bg: string; text: string }> = {
  active: { bg: '#D1FAE5', text: '#065F46' },
  suspended: { bg: '#FEF3C7', text: '#92400E' },
  archived: { bg: '#F3F4F6', text: '#4B5563' },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

type FormState = {
  slug: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  brand_primary: string;
  brand_accent: string;
  brand_logo_url: string;
  status: Clinic['status'];
  owner_user_id: string;
  notes: string;
};

const emptyForm: FormState = {
  slug: '',
  name: '',
  contact_email: '',
  contact_phone: '',
  brand_primary: '',
  brand_accent: '',
  brand_logo_url: '',
  status: 'active',
  owner_user_id: '',
  notes: '',
};

function toForm(c: Clinic): FormState {
  return {
    slug: c.slug,
    name: c.name,
    contact_email: c.contact_email ?? '',
    contact_phone: c.contact_phone ?? '',
    brand_primary: c.brand_primary ?? '',
    brand_accent: c.brand_accent ?? '',
    brand_logo_url: c.brand_logo_url ?? '',
    status: c.status,
    owner_user_id: c.owner_user_id ?? '',
    notes: c.notes ?? '',
  };
}

function toPayload(f: FormState): Record<string, unknown> {
  return {
    slug: f.slug,
    name: f.name,
    contact_email: f.contact_email || null,
    contact_phone: f.contact_phone || null,
    brand_primary: f.brand_primary || null,
    brand_accent: f.brand_accent || null,
    brand_logo_url: f.brand_logo_url || null,
    status: f.status,
    owner_user_id: f.owner_user_id || null,
    notes: f.notes || null,
  };
}

const INPUT_CLASS = 'w-full rounded-lg px-3 py-2 text-sm focus:outline-none';
const INPUT_STYLE: React.CSSProperties = {
  background: 'white',
  border: '1px solid var(--border)',
  color: 'var(--navy)',
};

export default function AdminClinicsPanel() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const fetchClinics = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (activeFilter !== 'all') params.set('status', activeFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await fetch(`/api/admin/clinics?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setClinics(data.clinics ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter, debouncedSearch]);

  useEffect(() => { fetchClinics(); }, [fetchClinics]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const startCreate = () => {
    setCreating(true);
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const startEdit = (clinic: Clinic) => {
    setCreating(false);
    setEditingId(clinic.id);
    setForm(toForm(clinic));
    setFormError(null);
  };

  const cancelForm = () => {
    setCreating(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const saveForm = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const url = editingId
        ? `/api/admin/clinics?id=${editingId}`
        : '/api/admin/clinics';
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPayload(form)),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Save failed');
      showToast('success', editingId ? 'Clinic updated' : 'Clinic created');
      cancelForm();
      await fetchClinics();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/clinics?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('success', 'Clinic deleted');
      setConfirmDeleteId(null);
      if (editingId === id) cancelForm();
      await fetchClinics();
    } catch {
      showToast('error', 'Failed to delete clinic');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="p-8" style={{ background: 'var(--off-white)', minHeight: '100%' }}>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>Clinics</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
            {total} clinic{total !== 1 ? 's' : ''} registered. Each clinic gets a slug used in
            <span className="font-mono"> /p/intake?clinic=&lt;slug&gt;</span> share links.
          </p>
        </div>
        {!creating && !editingId && (
          <button
            onClick={startCreate}
            className="text-xs font-semibold px-4 py-2 rounded-lg"
            style={{ background: 'var(--navy)', color: 'white' }}
          >
            + New clinic
          </button>
        )}
      </div>

      {(creating || editingId) && (
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'white', border: '1px solid var(--border)' }}
        >
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--navy)' }}>
            {editingId ? 'Edit clinic' : 'Register a new clinic'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
                Slug <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="acme-medical"
                className={`${INPUT_CLASS} font-mono`}
                style={INPUT_STYLE}
              />
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-light)' }}>
                lowercase, letters/digits/dashes/underscores, max 64 chars
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
                Name <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Acme Medical Group"
                className={INPUT_CLASS}
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
                Contact email
              </label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className={INPUT_CLASS}
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
                Contact phone
              </label>
              <input
                type="tel"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                className={INPUT_CLASS}
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Clinic['status'] })}
                className={INPUT_CLASS}
                style={INPUT_STYLE}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
                Owner user ID
              </label>
              <input
                type="text"
                value={form.owner_user_id}
                onChange={(e) => setForm({ ...form, owner_user_id: e.target.value })}
                placeholder="Supabase auth user UUID (optional)"
                className={`${INPUT_CLASS} font-mono text-xs`}
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
                Brand primary (hex)
              </label>
              <input
                type="text"
                value={form.brand_primary}
                onChange={(e) => setForm({ ...form, brand_primary: e.target.value })}
                placeholder="#0B1F3A"
                className={`${INPUT_CLASS} font-mono`}
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
                Brand accent (hex)
              </label>
              <input
                type="text"
                value={form.brand_accent}
                onChange={(e) => setForm({ ...form, brand_accent: e.target.value })}
                placeholder="#C8952C"
                className={`${INPUT_CLASS} font-mono`}
                style={INPUT_STYLE}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
                Brand logo URL
              </label>
              <input
                type="url"
                value={form.brand_logo_url}
                onChange={(e) => setForm({ ...form, brand_logo_url: e.target.value })}
                placeholder="https://…"
                className={INPUT_CLASS}
                style={INPUT_STYLE}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
                Notes (internal)
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={INPUT_CLASS}
                style={INPUT_STYLE}
              />
            </div>
          </div>

          {formError && (
            <div
              className="text-sm px-4 py-3 rounded-xl mb-4"
              style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', color: '#DC2626' }}
            >
              {formError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={saveForm}
              disabled={saving}
              className="text-xs font-semibold px-4 py-2 rounded-lg"
              style={{ background: 'var(--navy)', color: 'white', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create clinic'}
            </button>
            <button
              onClick={cancelForm}
              disabled={saving}
              className="text-xs font-semibold px-4 py-2 rounded-lg"
              style={{ background: 'white', color: 'var(--text-mid)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-6">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveFilter(tab.key); setPage(1); }}
            className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors"
            style={{
              background: activeFilter === tab.key ? 'var(--navy)' : 'white',
              color: activeFilter === tab.key ? 'white' : 'var(--text-mid)',
              border: `1px solid ${activeFilter === tab.key ? 'var(--navy)' : 'var(--border)'}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by name, slug, or email…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-sm px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
        />
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm"
          style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}
        >
          Failed to load clinics. Check your Supabase connection.
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-light)' }}>Loading clinics…</p>
        </div>
      ) : clinics.length === 0 ? (
        <div
          className="rounded-xl py-20 text-center"
          style={{ background: 'white', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--text-mid)' }}>
            No clinics registered yet
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
            Click <span className="font-semibold">+ New clinic</span> to register one. Submissions that
            arrive via <span className="font-mono">/p/intake?clinic=&lt;slug&gt;</span> will then be linked
            to the matching clinic record.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {clinics.map((clinic) => {
            const colors = STATUS_COLORS[clinic.status];
            const isConfirming = confirmDeleteId === clinic.id;
            return (
              <div
                key={clinic.id}
                className="rounded-xl px-5 py-4 flex items-center gap-4 flex-wrap"
                style={{ background: 'white', border: '1px solid var(--border)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {clinic.status}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>
                      {clinic.name}
                    </span>
                    <span className="text-xs font-mono" style={{ color: 'var(--gold)' }}>
                      {clinic.slug}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
                    {clinic.contact_email ?? '— no email'}
                    {clinic.contact_phone && ` · ${clinic.contact_phone}`}
                    {' · '}
                    registered {fmtDate(clinic.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isConfirming ? (
                    <>
                      <span className="text-xs" style={{ color: '#991B1B' }}>Delete?</span>
                      <button
                        onClick={() => handleDelete(clinic.id)}
                        className="text-xs px-2 py-1 rounded-lg font-bold text-white"
                        style={{ background: '#DC2626' }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs px-2 py-1 rounded-lg font-semibold"
                        style={{ color: 'var(--text-mid)', border: '1px solid var(--border)', background: 'white' }}
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(clinic)}
                        className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                        style={{ color: 'var(--navy)', background: 'white', border: '1px solid var(--border)' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(clinic.id)}
                        className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                        style={{ color: '#991B1B', background: '#FEE2E2', border: '1px solid #FCA5A5' }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{ background: toast.type === 'success' ? '#059669' : '#DC2626', color: 'white' }}
        >
          {toast.message}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <button
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-2 rounded-lg text-xs font-bold"
              style={{ background: 'white', color: 'var(--text-mid)', border: '1px solid var(--border)' }}
            >
              ← Prev
            </button>
          )}
          <span className="px-3 py-2 text-xs" style={{ color: 'var(--text-light)' }}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 rounded-lg text-xs font-bold"
              style={{ background: 'white', color: 'var(--text-mid)', border: '1px solid var(--border)' }}
            >
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
