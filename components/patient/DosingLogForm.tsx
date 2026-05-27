'use client';

import { useState, useCallback } from 'react';

const ROUTE_OPTIONS = ['SQ', 'IM', 'oral', 'nasal', 'topical', 'nebulized', 'other'] as const;
const COMMON_SIDE_EFFECTS = ['nausea', 'headache', 'fatigue', 'injection-site pain', 'dizziness', 'flushing'];

const INPUT_CLS = 'w-full rounded-lg px-3 py-2 text-sm focus:outline-none';
const INPUT_STYLE: React.CSSProperties = { background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--navy)' };

type LogEntry = { id: string; created_at: string; peptide_name: string; dose_amount: string; route: string; injection_site: string | null; notes: string | null; side_effects: string[] };

export default function DosingLogForm({ onLogged }: { onLogged: (entry: LogEntry) => void }) {
  const [peptide, setPeptide] = useState('');
  const [dose, setDose] = useState('');
  const [route, setRoute] = useState<string>('SQ');
  const [site, setSite] = useState('');
  const [notes, setNotes] = useState('');
  const [sideEffects, setSideEffects] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const reset = () => {
    setPeptide(''); setDose(''); setRoute('SQ'); setSite('');
    setNotes(''); setSideEffects(new Set()); setError('');
  };

  const submit = useCallback(async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/patient/dosing-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peptide_name: peptide,
          dose_amount: dose,
          route,
          injection_site: site || undefined,
          notes: notes || undefined,
          side_effects: Array.from(sideEffects),
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || 'Failed to save');
      }
      const data = await res.json();
      onLogged({
        id: data.id,
        created_at: data.created_at,
        peptide_name: peptide,
        dose_amount: dose,
        route,
        injection_site: site || null,
        notes: notes || null,
        side_effects: Array.from(sideEffects),
      });
      reset();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }, [peptide, dose, route, site, notes, sideEffects, onLogged]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'white', border: '1px solid var(--border)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-5 py-4 flex items-center justify-between"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--gold)' }}>
            Log a dose
          </p>
          <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>
            Record what you took today
          </p>
        </div>
        <svg
          className="w-4 h-4 transition-transform shrink-0"
          style={{ color: 'var(--text-light)', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
                Peptide / supplement <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <input
                type="text" required value={peptide} onChange={(e) => setPeptide(e.target.value)}
                placeholder="e.g. BPC-157" className={INPUT_CLS} style={INPUT_STYLE}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
                Dose <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <input
                type="text" required value={dose} onChange={(e) => setDose(e.target.value)}
                placeholder="e.g. 250 mcg" className={INPUT_CLS} style={INPUT_STYLE}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>Route</label>
              <select
                value={route} onChange={(e) => setRoute(e.target.value)}
                className={INPUT_CLS} style={INPUT_STYLE}
              >
                {ROUTE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>Injection site</label>
              <input
                type="text" value={site} onChange={(e) => setSite(e.target.value)}
                placeholder="e.g. abdomen left" className={INPUT_CLS} style={INPUT_STYLE}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-mid)' }}>
              Any side effects?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SIDE_EFFECTS.map((se) => {
                const active = sideEffects.has(se);
                return (
                  <button
                    key={se}
                    type="button"
                    onClick={() => setSideEffects((prev) => {
                      const next = new Set(prev);
                      if (next.has(se)) next.delete(se); else next.add(se);
                      return next;
                    })}
                    className="px-2.5 py-1 rounded-lg text-xs transition-colors"
                    style={{
                      background: active ? 'rgba(220,38,38,0.08)' : 'var(--off-white)',
                      color: active ? '#DC2626' : 'var(--text-mid)',
                      border: active ? '1px solid rgba(220,38,38,0.3)' : '1px solid var(--border)',
                    }}
                  >
                    {se}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>Notes</label>
            <textarea
              rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go?" className={INPUT_CLS} style={INPUT_STYLE}
            />
          </div>

          {error && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(220,38,38,0.06)', color: '#DC2626' }}>
              {error}
            </p>
          )}

          <button
            onClick={submit}
            disabled={submitting || !peptide.trim() || !dose.trim()}
            className="btn-primary text-sm w-full sm:w-auto"
            style={{ opacity: submitting || !peptide.trim() || !dose.trim() ? 0.6 : 1 }}
          >
            {submitting ? 'Saving...' : 'Log dose'}
          </button>
        </div>
      )}
    </div>
  );
}
