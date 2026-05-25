'use client';

import { useState, useEffect, useCallback } from 'react';

type Intake = {
  id: string;
  created_at: string;
  clinic_slug: string | null;
  // Slice 3 — joined from the clinics table when patient_intakes.clinic_id
  // resolves to an active clinic. Null when the slug didn't match any
  // registered clinic (or was empty).
  clinic: { id: string; slug: string; name: string; status: string } | null;
  name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  primary_concerns: string[];
  current_peptides: string | null;
  goals: string | null;
  referring_clinician: string | null;
  referring_user_id: string | null;
  consent_research: boolean;
  consent_contact: boolean;
  status: 'new' | 'contacted' | 'archived';
  reviewed_at: string | null;
  admin_notes: string | null;
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'archived', label: 'Archived' },
];

const STATUS_COLORS: Record<Intake['status'], { bg: string; text: string }> = {
  new: { bg: '#DBEAFE', text: '#1E40AF' },
  contacted: { bg: '#D1FAE5', text: '#065F46' },
  archived: { bg: '#F3F4F6', text: '#4B5563' },
};

const CONCERN_LABELS: Record<string, string> = {
  pain_recovery: 'Pain & recovery',
  weight_metabolic: 'Weight & metabolic',
  longevity: 'Longevity',
  cognitive: 'Cognitive',
  sexual_health: 'Sexual health',
  sleep: 'Sleep',
  hormone: 'Hormone',
  gut_health: 'Gut health',
  skin_hair: 'Skin & hair',
  other: 'Other',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export default function AdminPatientIntakesPanel() {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Debounce search 250ms before firing a new API query. Codex rescue
  // review (LOW): the prior client-side filter only saw the current page.
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const fetchIntakes = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (activeFilter !== 'all') params.set('status', activeFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await fetch(`/api/admin/patient-intakes?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIntakes(data.intakes ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter, debouncedSearch]);

  useEffect(() => {
    fetchIntakes();
  }, [fetchIntakes]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const updateStatus = async (id: string, status: Intake['status']) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/patient-intakes?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      showToast('success', `Marked as ${status}`);
      await fetchIntakes();
    } catch {
      showToast('error', 'Failed to update intake');
    } finally {
      setBusyId(null);
    }
  };

  // Search/filter is now applied server-side; just render what came back.
  const filtered = intakes;

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="p-8" style={{ background: 'var(--off-white)', minHeight: '100%' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>Patient Intakes</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
          {total} intake{total !== 1 ? 's' : ''} submitted via <span className="font-mono">/p/intake</span>
        </p>
      </div>

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
          placeholder="Search by name, email, or clinic…"
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
          Failed to load intakes. Check your Supabase connection.
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-light)' }}>Loading intakes…</p>
        </div>
      ) : intakes.length === 0 ? (
        <div
          className="rounded-xl py-20 text-center"
          style={{ background: 'white', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--text-mid)' }}>
            No patient intakes yet
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
            Share <span className="font-mono">/p/intake</span> with patients (or use
            {' '}<span className="font-mono">?clinic=&lt;slug&gt;</span> to attribute to a clinic).
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="rounded-xl py-12 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-light)' }}>No intakes match your search.</p>
            </div>
          )}
          {filtered.map((intake) => {
            const isExpanded = expandedId === intake.id;
            const colors = STATUS_COLORS[intake.status];
            return (
              <div
                key={intake.id}
                className="rounded-xl overflow-hidden"
                style={{ background: 'white', border: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : intake.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {intake.status}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>
                        {intake.name}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                        {intake.email}
                      </span>
                      {intake.clinic_slug && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded"
                          style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}
                          title={
                            intake.clinic
                              ? `Registered clinic: ${intake.clinic.name} (${intake.clinic.slug})`
                              : 'Slug submitted, but no matching registered clinic. Add it under Clinics to link future intakes.'
                          }
                        >
                          {/* Show the canonical clinic name when the slug
                              resolves to a registered active clinic; fall
                              back to the bare slug otherwise so admin can
                              see what the patient submitted. */}
                          {intake.clinic ? (
                            <>
                              <span className="font-semibold">{intake.clinic.name}</span>
                              <span className="font-mono ml-1 opacity-60">/{intake.clinic.slug}</span>
                            </>
                          ) : (
                            <span className="font-mono">{intake.clinic_slug} (unregistered)</span>
                          )}
                        </span>
                      )}
                      {intake.referring_user_id && (
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded"
                          style={{ background: '#E0E7FF', color: '#3730A3' }}
                          title="Attributed to a clinician's share link"
                        >
                          via clinician
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
                      {fmtDate(intake.created_at)}
                      {intake.primary_concerns.length > 0 && (
                        <>
                          {' · '}
                          {intake.primary_concerns
                            .map((c) => CONCERN_LABELS[c] ?? c)
                            .join(', ')}
                        </>
                      )}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 transition-transform shrink-0"
                    style={{
                      color: 'var(--text-light)',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                    }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 rounded-xl p-4 mb-4" style={{ background: 'var(--off-white)' }}>
                      <DetailRow label="Phone" value={intake.phone} />
                      <DetailRow label="Date of birth" value={intake.date_of_birth} />
                      <DetailRow label="Referring clinician" value={intake.referring_clinician} />
                      <DetailRow label="Referring user ID" value={intake.referring_user_id} />
                      <DetailRow label="Reviewed at" value={intake.reviewed_at ? fmtDate(intake.reviewed_at) : null} />
                      <DetailRow label="Concerns" value={intake.primary_concerns.map((c) => CONCERN_LABELS[c] ?? c).join(', ') || null} />
                      <DetailRow label="Goals" value={intake.goals} multiline />
                      <DetailRow label="Current peptides" value={intake.current_peptides} multiline />
                      <DetailRow label="Admin notes" value={intake.admin_notes} multiline />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`mailto:${intake.email}?subject=Your%20PeptidePure%20intake`}
                        className="text-xs font-semibold px-3 py-2 rounded-lg"
                        style={{ background: 'var(--navy)', color: 'white' }}
                      >
                        Email patient →
                      </a>
                      {intake.status !== 'contacted' && (
                        <button
                          onClick={() => updateStatus(intake.id, 'contacted')}
                          disabled={busyId === intake.id}
                          className="text-xs font-semibold px-3 py-2 rounded-lg"
                          style={{ background: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7' }}
                        >
                          Mark contacted
                        </button>
                      )}
                      {intake.status !== 'archived' && (
                        <button
                          onClick={() => updateStatus(intake.id, 'archived')}
                          disabled={busyId === intake.id}
                          className="text-xs font-semibold px-3 py-2 rounded-lg"
                          style={{ background: 'white', color: 'var(--text-mid)', border: '1px solid var(--border)' }}
                        >
                          Archive
                        </button>
                      )}
                      {intake.status === 'archived' && (
                        <button
                          onClick={() => updateStatus(intake.id, 'new')}
                          disabled={busyId === intake.id}
                          className="text-xs font-semibold px-3 py-2 rounded-lg"
                          style={{ background: 'white', color: 'var(--text-mid)', border: '1px solid var(--border)' }}
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                )}
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

function DetailRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string | null;
  multiline?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <span
        className="text-xs font-semibold shrink-0"
        style={{ color: 'var(--text-light)', minWidth: '120px' }}
      >
        {label}
      </span>
      <span
        className="text-xs wrap-break-word"
        style={{
          color: 'var(--text-dark)',
          whiteSpace: multiline ? 'pre-wrap' : undefined,
        }}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}
