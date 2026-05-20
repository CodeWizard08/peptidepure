'use client';

import { useCallback, useEffect, useState } from 'react';

type Status = 'draft' | 'published' | 'archived';

type Protocol = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  summary: string | null;
  body_md: string;
  patient_md: string;
  peptides: string[];
  image_url: string | null;
  status: Status;
  sort_order: number;
};

type Audience = 'clinician' | 'patient';

const EMPTY: Protocol = {
  id: '',
  slug: '',
  title: '',
  category: '',
  summary: '',
  body_md: '',
  patient_md: '',
  peptides: [],
  image_url: '',
  status: 'draft',
  sort_order: 0,
};

const STATUS_COLOR: Record<Status, { bg: string; color: string }> = {
  draft: { bg: '#FEF3C7', color: '#92400E' },
  published: { bg: '#D1FAE5', color: '#065F46' },
  archived: { bg: '#E5E7EB', color: '#374151' },
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export default function AdminProtocolsPanel() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selected, setSelected] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState<Audience | null>(null);
  const [activeAudience, setActiveAudience] = useState<Audience>('clinician');
  const [draftInstructions, setDraftInstructions] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/protocols');
      const data = await res.json();
      setProtocols(data.protocols ?? []);
    } catch {
      showToast('error', 'Failed to load protocols');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { refresh(); }, [refresh]);

  const startNew = () => {
    setSelected({ ...EMPTY });
    setDraftInstructions('');
  };

  const startEdit = (p: Protocol) => {
    setSelected({ ...p });
    setDraftInstructions('');
  };

  const updateField = <K extends keyof Protocol>(k: K, v: Protocol[K]) => {
    if (!selected) return;
    setSelected({ ...selected, [k]: v });
  };

  const draftWithClaude = async (audience: Audience) => {
    if (!selected) return;
    if (!selected.title.trim()) { showToast('error', 'Title required before drafting'); return; }

    setDrafting(audience);
    try {
      const res = await fetch('/api/admin/protocols/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selected.title,
          summary: selected.summary,
          peptides: selected.peptides,
          category: selected.category,
          instructions: draftInstructions,
          audience,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Draft failed');
      const targetField: keyof Protocol = audience === 'patient' ? 'patient_md' : 'body_md';
      setSelected({ ...selected, [targetField]: data.markdown });
      setActiveAudience(audience);
      const u = data.usage;
      const tokenSummary = u
        ? ` · ${u.input_tokens}→${u.output_tokens} tokens${u.cache_read_input_tokens > 0 ? ` (${u.cache_read_input_tokens} cached)` : ''}`
        : '';
      const label = audience === 'patient' ? 'patient version' : 'clinician version';
      showToast('success', `Claude drafted ${label} (${data.markdown.length.toLocaleString()} chars)${tokenSummary}`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Draft failed');
    } finally {
      setDrafting(null);
    }
  };

  const save = async () => {
    if (!selected) return;
    if (!selected.title.trim()) { showToast('error', 'Title required'); return; }

    const slug = selected.slug.trim() || slugify(selected.title);
    if (!/^[a-z0-9-]+$/.test(slug)) { showToast('error', 'Slug must be lowercase alphanumeric + hyphens'); return; }

    setSaving(true);
    try {
      const payload = {
        title: selected.title.trim(),
        slug,
        category: selected.category?.trim() || null,
        summary: selected.summary?.trim() || null,
        body_md: selected.body_md ?? '',
        patient_md: selected.patient_md ?? '',
        peptides: selected.peptides,
        image_url: selected.image_url?.trim() || null,
        status: selected.status,
        sort_order: selected.sort_order,
      };
      const res = selected.id
        ? await fetch('/api/admin/protocols', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: selected.id, ...payload }),
          })
        : await fetch('/api/admin/protocols', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      showToast('success', `Saved · ${selected.status}`);
      setSelected(data.protocol);
      await refresh();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Protocol) => {
    if (!p.id) return;
    if (!confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/protocols?id=${encodeURIComponent(p.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast('success', 'Deleted');
      if (selected?.id === p.id) setSelected(null);
      await refresh();
    } catch {
      showToast('error', 'Delete failed');
    }
  };

  return (
    <div className="p-6 lg:p-8" style={{ background: 'var(--off-white)', minHeight: '100%' }}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>Protocols</h2>
          <p className="text-sm mt-1 max-w-2xl" style={{ color: 'var(--text-mid)' }}>
            Clinical protocol library at <code className="font-mono text-xs">/protocols</code>. Draft with Claude, edit, publish.
          </p>
        </div>
        <button
          onClick={startNew}
          className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'var(--navy)' }}
        >
          + New Protocol
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* List */}
        <div className="lg:col-span-4 rounded-xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <div className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-light)', background: 'var(--off-white)', borderBottom: '1px solid var(--border)' }}>
            {loading ? 'Loading…' : `${protocols.length} protocol${protocols.length === 1 ? '' : 's'}`}
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {protocols.map((p) => {
              const active = selected?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => startEdit(p)}
                  className="w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 flex items-start gap-3"
                  style={{ borderBottom: '1px solid var(--border)', background: active ? 'var(--gold-pale)' : 'transparent' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--navy)' }}>{p.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
                      {p.category ?? 'Uncategorized'} · {p.peptides.length} peptide{p.peptides.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: STATUS_COLOR[p.status].bg, color: STATUS_COLOR[p.status].color }}
                  >
                    {p.status}
                  </span>
                </button>
              );
            })}
            {!loading && protocols.length === 0 && (
              <p className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-light)' }}>
                No protocols yet. Click + New Protocol.
              </p>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-8">
          {!selected ? (
            <div className="rounded-xl p-10 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                Select a protocol on the left to edit, or click + New Protocol.
              </p>
            </div>
          ) : (
            <div className="rounded-xl p-5 lg:p-6 space-y-4" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Title">
                  <input
                    type="text"
                    value={selected.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      updateField('title', title);
                      if (!selected.id && !selected.slug) updateField('slug', slugify(title));
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                    placeholder="e.g. Aesthetic & Tissue Regeneration Protocol"
                  />
                </Field>
                <Field label="Slug (URL)">
                  <input
                    type="text"
                    value={selected.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
                    style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                    placeholder="lowercase-with-hyphens"
                  />
                </Field>
                <Field label="Category">
                  <input
                    type="text"
                    value={selected.category ?? ''}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                    placeholder="e.g. MSK/Tissue Repair"
                  />
                </Field>
                <Field label="Status">
                  <select
                    value={selected.status}
                    onChange={(e) => updateField('status', e.target.value as Status)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                  >
                    <option value="draft">Draft (hidden)</option>
                    <option value="published">Published (live on /protocols)</option>
                    <option value="archived">Archived</option>
                  </select>
                </Field>
              </div>

              <Field label="Short summary (shown on the card + page hero)">
                <textarea
                  value={selected.summary ?? ''}
                  onChange={(e) => updateField('summary', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                />
              </Field>

              <Field label="Peptides (one per line, e.g. 'Tirz 10mg')">
                <textarea
                  value={selected.peptides.join('\n')}
                  onChange={(e) => updateField('peptides', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
                  style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                />
              </Field>

              <Field label="Image URL (optional)">
                <input
                  type="text"
                  value={selected.image_url ?? ''}
                  onChange={(e) => updateField('image_url', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
                  style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                  placeholder="https://…"
                />
              </Field>

              {/* Draft with Claude — generates clinician OR patient version */}
              <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, var(--gold-pale) 0%, white 100%)', border: '1px solid rgba(200,149,44,0.35)' }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--gold)' }}>Draft with Claude</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-mid)' }}>
                      Two versions: clinician (technical, dosing schedules, evidence notes) and patient (plain language, what to expect, when to call). Each is independently drafted, edited, and saved.
                    </p>
                  </div>
                </div>
                <textarea
                  value={draftInstructions}
                  onChange={(e) => setDraftInstructions(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 mb-3 rounded-lg text-xs focus:outline-none"
                  style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                  placeholder="Optional: extra instructions (e.g. 'emphasize post-op recovery', 'patient is 45yo female')…"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => draftWithClaude('clinician')}
                    disabled={!!drafting || !selected.title.trim()}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                    style={{ background: !!drafting || !selected.title.trim() ? 'var(--text-light)' : 'var(--navy)' }}
                  >
                    {drafting === 'clinician' ? 'Drafting clinician…' : 'Draft Clinician Version'}
                  </button>
                  <button
                    onClick={() => draftWithClaude('patient')}
                    disabled={!!drafting || !selected.title.trim()}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: !!drafting || !selected.title.trim() ? 'var(--text-light)' : 'var(--gold)',
                      color: 'var(--navy)',
                    }}
                  >
                    {drafting === 'patient' ? 'Drafting patient…' : 'Draft Patient Version'}
                  </button>
                </div>
                <p className="text-[11px] mt-3" style={{ color: 'var(--text-light)' }}>
                  Drafting overwrites the corresponding textarea below. Save before re-drafting if you want to keep prior content.
                </p>
              </div>

              {/* Audience tab switcher for the body editor */}
              <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setActiveAudience('clinician')}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    background: activeAudience === 'clinician' ? 'white' : 'transparent',
                    color: activeAudience === 'clinician' ? 'var(--navy)' : 'var(--text-mid)',
                    boxShadow: activeAudience === 'clinician' ? '0 1px 3px rgba(11,31,58,0.08)' : 'none',
                  }}
                >
                  Clinician Body{selected.body_md.trim() ? ' ✓' : ''}
                </button>
                <button
                  onClick={() => setActiveAudience('patient')}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    background: activeAudience === 'patient' ? 'white' : 'transparent',
                    color: activeAudience === 'patient' ? 'var(--navy)' : 'var(--text-mid)',
                    boxShadow: activeAudience === 'patient' ? '0 1px 3px rgba(11,31,58,0.08)' : 'none',
                  }}
                >
                  Patient Body{selected.patient_md.trim() ? ' ✓' : ''}
                </button>
              </div>

              {activeAudience === 'clinician' ? (
                <Field label="Clinician body (markdown — technical, dosing, evidence, contraindications)">
                  <textarea
                    value={selected.body_md}
                    onChange={(e) => updateField('body_md', e.target.value)}
                    rows={20}
                    className="w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
                    style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)', lineHeight: 1.5 }}
                    placeholder={'## Overview\n\nProtocol description…'}
                  />
                </Field>
              ) : (
                <Field label="Patient body (markdown — plain language, what to expect, when to call)">
                  <textarea
                    value={selected.patient_md}
                    onChange={(e) => updateField('patient_md', e.target.value)}
                    rows={20}
                    className="w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
                    style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)', lineHeight: 1.5 }}
                    placeholder={'## What This Protocol Is For\n\nIn plain language…'}
                  />
                </Field>
              )}

              {/* Share link helper — only when both versions exist + protocol is saved */}
              {selected.id && selected.patient_md.trim() && selected.status === 'published' && (
                <div className="rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs" style={{ background: 'var(--gold-pale)', border: '1px solid rgba(200,149,44,0.3)' }}>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--navy)' }}>Patient handout link</p>
                    <p className="font-mono mt-0.5" style={{ color: 'var(--text-mid)' }}>
                      /protocols/{selected.slug}?view=patient
                    </p>
                  </div>
                  <a
                    href={`/protocols/${selected.slug}?view=patient`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg font-semibold"
                    style={{ background: 'var(--gold)', color: 'var(--navy)' }}
                  >
                    Open patient view →
                  </a>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {selected.id && (
                  <button
                    onClick={() => remove(selected)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold transition-colors hover:bg-red-50"
                    style={{ color: '#DC2626', border: '1px solid #FCA5A5' }}
                  >
                    Delete
                  </button>
                )}
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    onClick={() => setSelected(null)}
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    style={{ background: 'var(--off-white)', color: 'var(--text-mid)', border: '1px solid var(--border)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
                    style={{ background: saving ? 'var(--text-light)' : 'var(--gold)', opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? 'Saving…' : selected.id ? 'Save Changes' : 'Create Protocol'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{ background: toast.type === 'success' ? '#059669' : '#DC2626', color: 'white' }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-light)' }}>
        {label}
      </span>
      {children}
    </label>
  );
}
