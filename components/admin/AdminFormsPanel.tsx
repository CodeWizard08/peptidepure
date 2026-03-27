'use client';

import { useState, useEffect, useCallback } from 'react';

type FormSubmission = {
  id: string;
  type: string;
  created_at: string;
  data: Record<string, unknown>;
  [key: string]: unknown;
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'baseline', label: 'Baseline' },
  { key: 'treatment-log', label: 'Treatment Log' },
  { key: 'ae-sae-report', label: 'AE/SAE Report' },
  { key: 'outcomes', label: 'Outcomes' },
  { key: 'contact', label: 'Contact' },
  { key: 'soap_capture', label: 'SOAP Capture' },
];

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  baseline: { bg: '#DBEAFE', text: '#1E40AF' },
  'treatment-log': { bg: '#E0E7FF', text: '#3730A3' },
  'ae-sae-report': { bg: '#FEE2E2', text: '#991B1B' },
  outcomes: { bg: '#D1FAE5', text: '#065F46' },
  contact: { bg: '#FEF3C7', text: '#92400E' },
  soap_capture: { bg: '#F3E8FF', text: '#6B21A8' },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

function getTypeColor(type: string) {
  return TYPE_COLORS[type] || { bg: 'var(--off-white)', text: 'var(--text-mid)' };
}

function getSubmitterInfo(submission: FormSubmission): string {
  const d = submission.data || {};
  const name =
    (d.full_name as string) ||
    (d.provider_name as string) ||
    (d.name as string) ||
    (d.first_name && d.last_name ? `${d.first_name} ${d.last_name}` : null) ||
    '—';
  return String(name);
}

function humanizeKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminFormsPanel() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (activeFilter !== 'all') params.set('type', activeFilter);
      const res = await fetch(`/api/admin/forms?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubmissions(data.submissions || []);
      setTotal(data.total || 0);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-8" style={{ background: 'var(--off-white)', minHeight: '100%' }}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
          Form Submissions
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
          {total} submission{total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveFilter(tab.key);
              setPage(1);
            }}
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

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm"
          style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}
        >
          Failed to load form submissions. Check your Supabase connection.
        </div>
      )}

      {/* Submissions list */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-light)' }}>
            Loading submissions…
          </p>
        </div>
      ) : submissions.length === 0 ? (
        <div
          className="rounded-xl py-20 text-center"
          style={{ background: 'white', border: '1px solid var(--border)' }}
        >
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--navy)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-mid)' }}>
            No submissions found
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
            {activeFilter !== 'all'
              ? `No ${activeFilter.replace('_', ' ')} submissions yet`
              : 'No form submissions yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((submission) => {
            const isExpanded = expandedId === submission.id;
            const typeColor = getTypeColor(submission.type);
            const submitter = getSubmitterInfo(submission);
            const formData = submission.data || {};

            return (
              <div
                key={submission.id}
                className="rounded-xl overflow-hidden"
                style={{ background: 'white', border: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : submission.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                        style={{ background: typeColor.bg, color: typeColor.text }}
                      >
                        {submission.type?.replace(/_/g, ' ') || 'Unknown'}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>
                        {submitter}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
                      {fmtDate(submission.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                      {Object.keys(formData).length} fields
                    </span>
                    <svg
                      className="w-4 h-4 transition-transform"
                      style={{
                        color: 'var(--text-light)',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded data */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="mt-4">
                      <p
                        className="text-xs font-bold uppercase tracking-widest mb-3"
                        style={{ color: 'var(--text-light)' }}
                      >
                        Submission Data
                      </p>
                      {Object.keys(formData).length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                          No data fields
                        </p>
                      ) : (
                        <div
                          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 rounded-xl p-4"
                          style={{ background: 'var(--off-white)' }}
                        >
                          {Object.entries(formData).map(([key, value]) => (
                            <div key={key} className="flex gap-3">
                              <span
                                className="text-xs font-semibold shrink-0"
                                style={{ color: 'var(--text-light)', minWidth: '120px' }}
                              >
                                {humanizeKey(key)}
                              </span>
                              <span
                                className="text-xs break-words"
                                style={{ color: 'var(--text-dark)' }}
                              >
                                {value === null || value === undefined
                                  ? '—'
                                  : typeof value === 'object'
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Raw top-level fields (outside data) */}
                    {Object.entries(submission)
                      .filter(([k]) => !['id', 'type', 'created_at', 'data'].includes(k))
                      .length > 0 && (
                      <div className="mt-4">
                        <p
                          className="text-xs font-bold uppercase tracking-widest mb-3"
                          style={{ color: 'var(--text-light)' }}
                        >
                          Additional Fields
                        </p>
                        <div
                          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 rounded-xl p-4"
                          style={{ background: 'var(--off-white)' }}
                        >
                          {Object.entries(submission)
                            .filter(([k]) => !['id', 'type', 'created_at', 'data'].includes(k))
                            .map(([key, value]) => (
                              <div key={key} className="flex gap-3">
                                <span
                                  className="text-xs font-semibold shrink-0"
                                  style={{ color: 'var(--text-light)', minWidth: '120px' }}
                                >
                                  {humanizeKey(key)}
                                </span>
                                <span
                                  className="text-xs break-words"
                                  style={{ color: 'var(--text-dark)' }}
                                >
                                  {value === null || value === undefined
                                    ? '—'
                                    : typeof value === 'object'
                                    ? JSON.stringify(value, null, 2)
                                    : String(value)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
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
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => (
              <>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span key={`ellipsis-${p}`} className="px-2 py-2 text-xs" style={{ color: 'var(--text-light)' }}>
                    …
                  </span>
                )}
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-9 h-9 rounded-lg text-xs font-bold"
                  style={{
                    background: page === p ? 'var(--navy)' : 'white',
                    color: page === p ? 'white' : 'var(--text-mid)',
                    border: `1px solid ${page === p ? 'var(--navy)' : 'var(--border)'}`,
                  }}
                >
                  {p}
                </button>
              </>
            ))}
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
