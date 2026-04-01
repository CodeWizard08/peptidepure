'use client';

import { useState, useMemo, useRef } from 'react';

/* ── Types ─────────────────────────────────────────────── */
type Status = 'ok' | 'low' | 'order' | 'out';

type InventoryItem = {
  product: string;
  dose: string;
  stock: number;
  status: Status;
  notes?: string;
};

type ViewMode = 'grid' | 'table';
type CategoryKey = 'all' | 'weight' | 'recovery' | 'longevity' | 'cognitive' | 'hormonal' | 'specialty';

/* ── Constants ─────────────────────────────────────────── */
const STATUS_CONFIG: Record<Status, { label: string; bg: string; text: string; dot: string; glow: string; accent: string }> = {
  ok:    { label: 'In Stock',     bg: 'rgba(16,185,129,0.08)',  text: '#065F46', dot: '#10B981', glow: 'rgba(16,185,129,0.3)',  accent: '#10B981' },
  low:   { label: 'Low Stock',    bg: 'rgba(245,158,11,0.08)',  text: '#92400E', dot: '#F59E0B', glow: 'rgba(245,158,11,0.3)',  accent: '#F59E0B' },
  order: { label: 'On Order',     bg: 'rgba(239,68,68,0.08)',   text: '#991B1B', dot: '#EF4444', glow: 'rgba(239,68,68,0.3)',   accent: '#EF4444' },
  out:   { label: 'Out of Stock', bg: 'rgba(156,163,175,0.08)', text: '#6B7280', dot: '#9CA3AF', glow: 'rgba(156,163,175,0.2)', accent: '#9CA3AF' },
};

const CATEGORIES: { key: CategoryKey; label: string; icon: string }[] = [
  { key: 'all',        label: 'All Products', icon: '⬡' },
  { key: 'weight',     label: 'Weight Mgmt',  icon: '◎' },
  { key: 'recovery',   label: 'Recovery',     icon: '✦' },
  { key: 'longevity',  label: 'Longevity',    icon: '◈' },
  { key: 'cognitive',  label: 'Cognitive',    icon: '◇' },
  { key: 'hormonal',   label: 'Hormonal',     icon: '○' },
  { key: 'specialty',  label: 'Specialty',    icon: '△' },
];

const CATEGORY_MAP: Record<string, CategoryKey> = {
  'TIRZ': 'weight', 'RETA': 'weight', 'AOD': 'weight', 'Mots-C': 'weight',
  'BPC-157': 'recovery', 'TB500': 'recovery', 'BPC-157/TB500 (Wolverine)': 'recovery',
  'SS-31': 'recovery', 'GHK-Cu': 'recovery', 'KPV': 'recovery',
  'Epithalon': 'longevity', 'NAD+': 'longevity', 'Thymosin Alpha-1': 'longevity',
  'GLOW': 'longevity', 'Glutathione': 'longevity',
  'Semax': 'cognitive', 'Selank': 'cognitive', 'Selank Amidate': 'cognitive',
  'DSIP': 'cognitive', 'Cerebrolysin': 'cognitive', 'ARA-290': 'cognitive',
  'CJC/Ipamorelin': 'hormonal', 'HGH': 'hormonal', 'HCG': 'hormonal',
  'PT-141': 'hormonal', 'MT-2 (Melanotan)': 'hormonal', 'Tesamorelin': 'hormonal',
  'Kisspeptin': 'hormonal', 'Oxytocin': 'hormonal', 'IGF-LR3': 'hormonal',
  'KLOW': 'specialty', 'SNAP8': 'specialty', 'Super Human Blend': 'specialty',
  'Botox': 'specialty', 'LIPO-C+': 'specialty', 'MGF': 'specialty',
};

function getCategory(product: string): CategoryKey {
  return CATEGORY_MAP[product] || 'specialty';
}

/* ── Stock bar visual ──────────────────────────────────── */
function StockBar({ stock, status }: { stock: number; status: Status }) {
  const max = 250;
  const pct = Math.min((stock / max) * 100, 100);
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${cfg.dot}, ${cfg.accent})`,
            boxShadow: pct > 0 ? `0 0 6px ${cfg.glow}` : 'none',
          }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--navy)', minWidth: '2rem', textAlign: 'right' }}>
        {stock}
      </span>
    </div>
  );
}

/* ── Status Badge ──────────────────────────────────────── */
function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide"
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.dot}20` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: cfg.dot,
          boxShadow: status === 'low' || status === 'order' ? `0 0 5px ${cfg.glow}` : undefined,
          animation: status === 'order' ? 'pulse 2s ease-in-out infinite' : undefined,
        }}
      />
      {cfg.label}
    </span>
  );
}

/* ── Product Request Form ──────────────────────────────── */
function ProductRequestForm({ userEmail, userName }: { userEmail: string; userName: string }) {
  const [open, setOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [dosage, setDosage] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'product-request',
          data: {
            productName: productName.trim(),
            dosage: dosage.trim(),
            estimatedQuantity: quantity.trim(),
            notes: notes.trim(),
            email: userEmail,
            providerName: userName,
          },
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setProductName('');
        setDosage('');
        setQuantity('');
        setNotes('');
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch { /* silent */ }
    setSubmitting(false);
  };

  const inputStyle = {
    border: '1.5px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--navy)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-500"
      style={{
        border: open ? '1.5px solid var(--border)' : '1.5px solid transparent',
        background: open ? 'white' : 'linear-gradient(135deg, var(--navy) 0%, #152d50 60%, #1e3d6b 100%)',
        boxShadow: open ? 'var(--shadow-md)' : '0 8px 32px rgba(11,31,58,0.18)',
      }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left"
        style={{ transition: 'opacity 0.15s' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: open ? 'var(--gold-pale)' : 'rgba(200,149,44,0.18)',
              color: 'var(--gold)',
              boxShadow: open ? 'none' : '0 0 16px rgba(200,149,44,0.15)',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <h3
              className="text-base font-bold leading-tight"
              style={{ color: open ? 'var(--navy)' : 'white', fontFamily: 'var(--font-display)' }}
            >
              Can&apos;t find what you need?
            </h3>
            <p className="text-sm mt-0.5" style={{ color: open ? 'var(--text-mid)' : 'rgba(255,255,255,0.55)' }}>
              Request a product and we&apos;ll source it for you
            </p>
          </div>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
          style={{
            background: open ? 'var(--surface)' : 'rgba(255,255,255,0.08)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <svg width="14" height="14" fill="none" stroke={open ? 'var(--navy)' : 'rgba(255,255,255,0.7)'} strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Form body */}
      {open && (
        <div className="px-6 pb-6">
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: '1.5rem' }} />
          {submitted ? (
            <div
              className="rounded-xl p-6 text-center"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: '#10B981' }}>
                <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h4 className="text-base font-bold" style={{ color: '#065F46', fontFamily: 'var(--font-display)' }}>
                Request Submitted
              </h4>
              <p className="text-sm mt-1" style={{ color: '#047857' }}>
                Our team will review your request and follow up shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {[
                  { label: 'Product Name *', value: productName, onChange: setProductName, placeholder: 'e.g. Semaglutide', required: true },
                  { label: 'Preferred Dosage', value: dosage, onChange: setDosage, placeholder: 'e.g. 10mg', required: false },
                  { label: 'Estimated Qty (kits)', value: quantity, onChange: setQuantity, placeholder: 'e.g. 10', required: false },
                  { label: 'Additional Notes', value: notes, onChange: setNotes, placeholder: 'Urgency, brand preference, etc.', required: false },
                ].map(({ label, value, onChange, placeholder, required }) => (
                  <div key={label}>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-mid)' }}>
                      {label}
                    </label>
                    <input
                      type="text"
                      required={required}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
              <button
                type="submit"
                disabled={submitting || !productName.trim()}
                className="btn-primary"
              >
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Dashboard ────────────────────────────────────── */
export default function InventoryDashboard({
  inventory,
  lastUpdated,
  userEmail,
  userName,
}: {
  inventory: InventoryItem[];
  lastUpdated: string;
  userEmail: string;
  userName: string;
}) {
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState<Status | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [view, setView] = useState<ViewMode>('grid');
  const topRef = useRef<HTMLDivElement>(null);

  /* ── Computed ─────────────────────────────────────────── */
  const counts = useMemo(() => ({
    all:   inventory.length,
    ok:    inventory.filter((i) => i.status === 'ok').length,
    low:   inventory.filter((i) => i.status === 'low').length,
    order: inventory.filter((i) => i.status === 'order').length,
    out:   inventory.filter((i) => i.status === 'out').length,
  }), [inventory]);

  const totalUnits = useMemo(() => inventory.reduce((s, i) => s + i.stock, 0), [inventory]);

  const categoryCounts = useMemo(() => {
    const map: Record<CategoryKey, number> = { all: inventory.length, weight: 0, recovery: 0, longevity: 0, cognitive: 0, hormonal: 0, specialty: 0 };
    inventory.forEach((i) => { map[getCategory(i.product)]++; });
    return map;
  }, [inventory]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inventory.filter((item) => {
      const matchesStatus = activeStatus === 'all' || item.status === activeStatus;
      const matchesCategory = activeCategory === 'all' || getCategory(item.product) === activeCategory;
      const matchesSearch =
        !q ||
        item.product.toLowerCase().includes(q) ||
        item.dose.toLowerCase().includes(q) ||
        (item.notes ?? '').toLowerCase().includes(q);
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [inventory, search, activeStatus, activeCategory]);

  const hasActiveFilters = search || activeStatus !== 'all' || activeCategory !== 'all';

  const clearFilters = () => {
    setSearch('');
    setActiveStatus('all');
    setActiveCategory('all');
  };

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }} ref={topRef}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          50% { box-shadow: 0 0 0 5px rgba(16,185,129,0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .inv-card {
          animation: fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        .inv-card:hover {
          transform: translateY(-2px);
        }
        .inv-input:focus {
          border-color: var(--gold) !important;
          box-shadow: 0 0 0 3px rgba(200,149,44,0.12) !important;
        }
        .status-btn:hover {
          opacity: 0.9;
        }
        .cat-pill:hover {
          border-color: var(--navy) !important;
        }
        .table-row:hover td {
          background: rgba(11,31,58,0.025);
        }
      `}</style>

      {/* ── Hero Header ──────────────────────────────── */}
      <div
        className="pt-20 pb-16"
        style={{
          background: 'linear-gradient(150deg, #07172b 0%, #0B1F3A 40%, #0f2845 70%, #162f52 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle dot-grid pattern */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, rgba(200,149,44,0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Glow orb */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: '-80px', right: '-80px',
            width: '360px', height: '360px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,149,44,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container-xl" style={{ position: 'relative' }}>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              {/* Live indicator */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: '#10B981',
                    animation: 'livePulse 2s ease-in-out infinite',
                  }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: 'var(--gold)' }}
                >
                  Clinician Portal · Live
                </span>
              </div>
              <h1
                className="text-4xl md:text-5xl font-bold text-white leading-none"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
              >
                Inventory
              </h1>
              <p className="text-sm mt-2.5 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                Last updated: {lastUpdated}
              </p>
            </div>

            {/* Glassmorphism stat cards */}
            <div className="flex gap-3 flex-wrap">
              {[
                { value: counts.all,  label: 'Products',     color: 'var(--gold)',  icon: '◈' },
                { value: totalUnits,  label: 'Total Units',  color: '#10B981',      icon: '◎' },
                { value: counts.ok,   label: 'In Stock',     color: '#10B981',      icon: '✦' },
                { value: counts.out,  label: 'Out of Stock', color: '#EF4444',      icon: '○' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center px-5 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(12px)',
                    minWidth: '90px',
                  }}
                >
                  <div
                    className="text-[11px] font-bold uppercase tracking-widest mb-1"
                    style={{ color: stat.color, opacity: 0.9 }}
                  >
                    {stat.icon}
                  </div>
                  <div
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                  >
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: stat.color }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls Bar ─────────────────────────────── */}
      <div className="!-mt-7 container-xl relative z-10">
        <div
          className="rounded-2xl p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center"
          style={{
            background: 'white',
            border: '1.5px solid var(--border)',
            boxShadow: '0 8px 32px rgba(11,31,58,0.1)',
          }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--text-light)' }}
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search products, dosages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none inv-input"
              style={{
                border: '1.5px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--navy)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'var(--border)', color: 'var(--text-light)' }}
                aria-label="Clear search"
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3 h-3">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Status filters */}
          <div className="flex gap-1.5 overflow-x-auto">
            {([
              { key: 'all' as const,   label: 'All' },
              { key: 'ok' as const,    label: `In Stock (${counts.ok})` },
              { key: 'low' as const,   label: `Low (${counts.low})` },
              { key: 'order' as const, label: `On Order (${counts.order})` },
              { key: 'out' as const,   label: `Out (${counts.out})` },
            ]).map(({ key, label }) => {
              const active = activeStatus === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveStatus(key)}
                  className="status-btn px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                  style={{
                    background: active ? 'var(--navy)' : 'transparent',
                    color: active ? 'white' : 'var(--text-mid)',
                    border: `1.5px solid ${active ? 'var(--navy)' : 'var(--border)'}`,
                    boxShadow: active ? '0 2px 8px rgba(11,31,58,0.2)' : 'none',
                  }}
                >
                  {key !== 'all' && (
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                      style={{ background: active ? 'white' : STATUS_CONFIG[key].dot }}
                    />
                  )}
                  {label}
                </button>
              );
            })}
          </div>

          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden shrink-0" style={{ border: '1.5px solid var(--border)' }}>
            {(['grid', 'table'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-2 transition-all"
                style={{
                  background: view === v ? 'var(--navy)' : 'white',
                  color: view === v ? 'white' : 'var(--text-light)',
                }}
                aria-label={`${v} view`}
              >
                {v === 'grid' ? (
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <rect x="1" y="1" width="6" height="6" rx="1.5" />
                    <rect x="9" y="1" width="6" height="6" rx="1.5" />
                    <rect x="1" y="9" width="6" height="6" rx="1.5" />
                    <rect x="9" y="9" width="6" height="6" rx="1.5" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <rect x="1" y="2" width="14" height="2" rx="1" />
                    <rect x="1" y="7" width="14" height="2" rx="1" />
                    <rect x="1" y="12" width="14" height="2" rx="1" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category Pills ───────────────────────────── */}
      <div className="container-xl mt-5">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(({ key, label, icon }) => {
            const active = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className="cat-pill flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  background: active ? 'var(--navy)' : 'white',
                  color: active ? 'white' : 'var(--text-mid)',
                  border: `1.5px solid ${active ? 'var(--navy)' : 'var(--border)'}`,
                  boxShadow: active ? '0 2px 12px rgba(11,31,58,0.18)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ opacity: active ? 1 : 0.6, fontSize: '0.85em' }}>{icon}</span>
                {label}
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: active ? 'rgba(255,255,255,0.15)' : 'var(--surface)',
                    color: active ? 'rgba(255,255,255,0.85)' : 'var(--text-light)',
                  }}
                >
                  {categoryCounts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────── */}
      <div className="container-xl mt-5 pb-16">
        {/* Active filter summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-3 mb-5 px-1">
            <p className="text-xs" style={{ color: 'var(--text-light)' }}>
              Showing <strong style={{ color: 'var(--navy)', fontWeight: 700 }}>{filtered.length}</strong> of {inventory.length} products
              {search && <> matching &ldquo;<strong style={{ color: 'var(--navy)' }}>{search}</strong>&rdquo;</>}
            </p>
            <button
              onClick={clearFilters}
              className="text-xs font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--gold)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              Clear all
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          /* ── Empty state ──────────────────────────── */
          <div
            className="rounded-2xl py-20 text-center"
            style={{ background: 'white', border: '1.5px solid var(--border)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'var(--surface)' }}
            >
              <svg className="w-7 h-7" style={{ color: 'var(--text-light)' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-1.5" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>
              No products found
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-light)' }}>
              Try adjusting your search or filters
            </p>
            <button onClick={clearFilters} className="btn-outline-gold">
              Clear filters
            </button>
          </div>
        ) : view === 'grid' ? (
          /* ── Grid View ────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item, i) => {
              const cfg = STATUS_CONFIG[item.status];
              const isOut = item.status === 'out';
              return (
                <div
                  key={`${item.product}-${item.dose}`}
                  className="inv-card rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    background: 'white',
                    border: `1.5px solid ${isOut ? 'var(--border)' : cfg.dot + '22'}`,
                    animationDelay: `${i * 25}ms`,
                    opacity: isOut ? 0.7 : 1,
                    boxShadow: '0 2px 12px rgba(11,31,58,0.05)',
                  }}
                >
                  {/* Color accent bar */}
                  <div style={{ height: '3px', background: isOut ? 'var(--border)' : `linear-gradient(90deg, ${cfg.dot}, ${cfg.accent}88)` }} />

                  <div className="p-5">
                    {/* Top: category + status */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: 'var(--text-light)' }}
                      >
                        {CATEGORIES.find(c => c.key === getCategory(item.product))?.label}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>

                    {/* Product name */}
                    <h3
                      className="text-base font-bold leading-snug mb-0.5"
                      style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}
                    >
                      {item.product}
                    </h3>
                    <p className="text-xs mb-4 font-medium" style={{ color: 'var(--text-mid)' }}>
                      {item.dose}
                    </p>

                    {/* Stock bar */}
                    <StockBar stock={item.stock} status={item.status} />

                    {/* Notes */}
                    {item.notes && (
                      <p
                        className="text-[11px] mt-3 px-3 py-2 rounded-lg leading-relaxed"
                        style={{ background: 'var(--surface)', color: 'var(--text-mid)', borderLeft: `2px solid ${cfg.dot}40` }}
                      >
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Table View ───────────────────────────── */
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1.5px solid var(--border)', boxShadow: '0 4px 20px rgba(11,31,58,0.07)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ background: 'white' }}>
                <thead>
                  <tr style={{ background: 'var(--navy)' }}>
                    {['Product', 'Dose', 'Category', 'Stock', 'Status', 'Notes'].map((col, i) => (
                      <th
                        key={col}
                        className={`text-left px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-white${
                          col === 'Category' ? ' hidden sm:table-cell' : col === 'Notes' ? ' hidden md:table-cell' : ''
                        }`}
                        style={{ opacity: 0.85, fontWeight: 700, whiteSpace: 'nowrap' }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => (
                    <tr
                      key={`${item.product}-${item.dose}`}
                      className="table-row transition-colors"
                      style={{
                        borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                        opacity: item.status === 'out' ? 0.6 : 1,
                        background: i % 2 === 0 ? 'white' : 'rgba(11,31,58,0.012)',
                      }}
                    >
                      <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--navy)' }}>
                        {item.product}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-medium" style={{ color: 'var(--text-mid)' }}>
                        {item.dose}
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>
                          {CATEGORIES.find(c => c.key === getCategory(item.product))?.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5" style={{ minWidth: '140px' }}>
                        <StockBar stock={item.stock} status={item.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-3.5 text-xs hidden md:table-cell" style={{ color: 'var(--text-light)', maxWidth: '200px' }}>
                        {item.notes || <span style={{ opacity: 0.4 }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Product Request Section ────────────────── */}
        <div className="mt-10">
          <ProductRequestForm userEmail={userEmail} userName={userName} />
        </div>

        {/* ── Footer note ────────────────────────────── */}
        <p
          className="text-xs text-center mt-8 leading-relaxed"
          style={{ color: 'var(--text-light)', maxWidth: '480px', margin: '2rem auto 0' }}
        >
          Inventory levels are updated regularly. For real-time availability on specific products, contact us or submit a product request above.
        </p>
      </div>
    </div>
  );
}
