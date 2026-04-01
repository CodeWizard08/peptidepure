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
const STATUS_CONFIG: Record<Status, { label: string; bg: string; text: string; dot: string; glow: string }> = {
  ok:    { label: 'In Stock',       bg: '#ECFDF5', text: '#065F46', dot: '#10B981', glow: 'rgba(16,185,129,0.2)' },
  low:   { label: 'Low Stock',      bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B', glow: 'rgba(245,158,11,0.2)' },
  order: { label: 'On Order',       bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444', glow: 'rgba(239,68,68,0.2)' },
  out:   { label: 'Out of Stock',   bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF', glow: 'rgba(156,163,175,0.2)' },
};

const CATEGORIES: { key: CategoryKey; label: string; icon: string }[] = [
  { key: 'all',        label: 'All Products',    icon: '⬡' },
  { key: 'weight',     label: 'Weight Mgmt',     icon: '◎' },
  { key: 'recovery',   label: 'Recovery',         icon: '✦' },
  { key: 'longevity',  label: 'Longevity',        icon: '◈' },
  { key: 'cognitive',  label: 'Cognitive',         icon: '◇' },
  { key: 'hormonal',   label: 'Hormonal',          icon: '○' },
  { key: 'specialty',  label: 'Specialty',          icon: '△' },
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
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: cfg.dot,
            boxShadow: `0 0 8px ${cfg.glow}`,
          }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums w-8 text-right" style={{ color: 'var(--navy)' }}>
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
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: cfg.dot,
          boxShadow: status === 'low' || status === 'order' ? `0 0 6px ${cfg.glow}` : undefined,
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

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-500"
      style={{
        border: '1px solid var(--border)',
        background: open ? 'white' : 'linear-gradient(135deg, var(--navy) 0%, #1a3358 100%)',
      }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{
              background: open ? 'var(--gold-pale)' : 'rgba(200,149,44,0.15)',
              color: 'var(--gold)',
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <h3
              className="text-lg font-bold"
              style={{ color: open ? 'var(--navy)' : 'white', fontFamily: 'var(--font-display)' }}
            >
              Can&apos;t find what you need?
            </h3>
            <p className="text-sm mt-0.5" style={{ color: open ? 'var(--text-mid)' : 'rgba(255,255,255,0.6)' }}>
              Request a product and we&apos;ll source it for you
            </p>
          </div>
        </div>
        <svg
          width="20"
          height="20"
          fill="none"
          stroke={open ? 'var(--navy)' : 'rgba(255,255,255,0.5)'}
          strokeWidth="2"
          viewBox="0 0 24 24"
          className="transition-transform duration-300 shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {/* Form body */}
      {open && (
        <div className="px-6 pb-6">
          {submitted ? (
            <div
              className="rounded-xl p-6 text-center"
              style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}
            >
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: '#10B981' }}>
                <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h4 className="text-lg font-bold" style={{ color: '#065F46', fontFamily: 'var(--font-display)' }}>
                Request Submitted
              </h4>
              <p className="text-sm mt-1" style={{ color: '#047857' }}>
                Our team will review your request and follow up shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-mid)' }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Semaglutide"
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--navy)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-mid)' }}>
                    Preferred Dosage
                  </label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 10mg"
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--navy)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-mid)' }}>
                    Estimated Qty (kits)
                  </label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--navy)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-mid)' }}>
                    Additional Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Urgency, brand preference, etc."
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--navy)' }}
                  />
                </div>
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
      {/* Pulse animation for low/order items */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .inv-card {
          animation: fadeInUp 0.35s ease-out both;
        }
      `}</style>

      {/* ── Hero Header ──────────────────────────────── */}
      <div className="pt-20 pb-14" style={{ background: 'linear-gradient(145deg, var(--navy) 0%, #0f2a4a 50%, #1a3358 100%)' }}>
        <div className="container-xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--gold)', fontFamily: 'var(--font-body)' }}
              >
                Clinician Portal
              </p>
              <h1
                className="text-3xl md:text-5xl font-bold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Live Inventory
              </h1>
              <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Last updated: {lastUpdated}
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-6">
              {[
                { value: counts.all, label: 'Products', color: 'var(--gold)' },
                { value: totalUnits, label: 'Total Units', color: '#10B981' },
                { value: counts.ok, label: 'In Stock', color: '#10B981' },
                { value: counts.out, label: 'Out of Stock', color: '#EF4444' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
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
      <div className="container-xl -mt-6 relative z-10">
        <div
          className="rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center"
          style={{ background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
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
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--navy)' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-light)' }}
                aria-label="Clear search"
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Status filters */}
          <div className="flex gap-1.5 overflow-x-auto">
            {([
              { key: 'all' as const, label: 'All' },
              { key: 'ok' as const, label: `In Stock (${counts.ok})` },
              { key: 'low' as const, label: `Low (${counts.low})` },
              { key: 'order' as const, label: `On Order (${counts.order})` },
              { key: 'out' as const, label: `Out (${counts.out})` },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveStatus(key)}
                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: activeStatus === key ? 'var(--navy)' : 'var(--surface)',
                  color: activeStatus === key ? 'white' : 'var(--text-mid)',
                  border: `1px solid ${activeStatus === key ? 'var(--navy)' : 'var(--border)'}`,
                }}
              >
                {key !== 'all' && (
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                    style={{ background: activeStatus === key ? 'white' : STATUS_CONFIG[key].dot }}
                  />
                )}
                {label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: '1px solid var(--border)' }}>
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
                    <rect x="1" y="1" width="6" height="6" rx="1" />
                    <rect x="9" y="1" width="6" height="6" rx="1" />
                    <rect x="1" y="9" width="6" height="6" rx="1" />
                    <rect x="9" y="9" width="6" height="6" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <rect x="1" y="2" width="14" height="2" rx="0.5" />
                    <rect x="1" y="7" width="14" height="2" rx="0.5" />
                    <rect x="1" y="12" width="14" height="2" rx="0.5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category Pills ───────────────────────────── */}
      <div className="container-xl mt-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
              style={{
                background: activeCategory === key
                  ? 'var(--navy)'
                  : 'white',
                color: activeCategory === key ? 'white' : 'var(--text-mid)',
                border: `1.5px solid ${activeCategory === key ? 'var(--navy)' : 'var(--border)'}`,
                boxShadow: activeCategory === key ? 'var(--shadow-sm)' : undefined,
              }}
            >
              <span style={{ opacity: 0.7 }}>{icon}</span>
              {label}
              <span
                className="ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: activeCategory === key ? 'rgba(255,255,255,0.15)' : 'var(--surface)',
                  color: activeCategory === key ? 'rgba(255,255,255,0.8)' : 'var(--text-light)',
                }}
              >
                {categoryCounts[key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────── */}
      <div className="container-xl mt-6 pb-12">
        {/* Active filter summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-3 mb-4">
            <p className="text-xs" style={{ color: 'var(--text-light)' }}>
              Showing <strong style={{ color: 'var(--navy)' }}>{filtered.length}</strong> of {inventory.length} products
              {search && <> matching &ldquo;<strong>{search}</strong>&rdquo;</>}
            </p>
            <button
              onClick={clearFilters}
              className="text-xs font-medium underline"
              style={{ color: 'var(--gold)' }}
            >
              Clear all
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          /* ── Empty state ──────────────────────────── */
          <div
            className="rounded-2xl py-20 text-center"
            style={{ background: 'white', border: '1px solid var(--border)' }}
          >
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--surface)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--text-light)' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>
              No products found
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-light)' }}>
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
              return (
                <div
                  key={`${item.product}-${item.dose}`}
                  className="inv-card rounded-2xl p-5 transition-all hover:shadow-lg"
                  style={{
                    background: 'white',
                    border: `1px solid ${item.status === 'out' ? cfg.dot + '30' : 'var(--border)'}`,
                    animationDelay: `${i * 30}ms`,
                    opacity: item.status === 'out' ? 0.75 : 1,
                  }}
                >
                  {/* Top: status + category */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--text-light)' }}
                    >
                      {CATEGORIES.find(c => c.key === getCategory(item.product))?.label}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>

                  {/* Product name */}
                  <h3 className="text-lg font-bold leading-tight mb-0.5" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>
                    {item.product}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-mid)' }}>
                    {item.dose}
                  </p>

                  {/* Stock bar */}
                  <StockBar stock={item.stock} status={item.status} />

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-[11px] mt-3 px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-mid)' }}>
                      {item.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Table View ───────────────────────────── */
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--navy)' }}>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">Product</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">Dose</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden sm:table-cell">Category</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white w-40">Stock</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => (
                    <tr
                      key={`${item.product}-${item.dose}`}
                      className="transition-colors hover:bg-gray-50"
                      style={{
                        borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                        opacity: item.status === 'out' ? 0.65 : 1,
                      }}
                    >
                      <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--navy)' }}>
                        {item.product}
                      </td>
                      <td className="px-5 py-3.5" style={{ color: 'var(--text-mid)' }}>
                        {item.dose}
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>
                          {CATEGORIES.find(c => c.key === getCategory(item.product))?.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StockBar stock={item.stock} status={item.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-3.5 text-xs hidden md:table-cell" style={{ color: 'var(--text-light)' }}>
                        {item.notes || '—'}
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
        <p className="text-xs text-center mt-8" style={{ color: 'var(--text-light)' }}>
          Inventory levels are updated regularly. For real-time availability on specific products, contact us or submit a product request above.
        </p>
      </div>
    </div>
  );
}
