/**
 * IRB Authority Strip
 *
 * Surfaces PeptidePure's clinical research moat: IRB-approved research protocol
 * (PPRN-001-2025 / IRCM-2025-467), MD-led oversight, and 503A/503B sourcing.
 *
 * Drops onto product detail pages, the catalog hero, /our-company, /coa.
 *
 * Variants:
 *  - "full"  : full info card with all 4 trust pillars (default — for PDPs)
 *  - "compact": single-line strip (for catalog headers)
 */

type Variant = 'full' | 'compact';

const IRB_PROTOCOL_ID = 'PPRN-001-2025';
const IRB_REGISTRY_ID = 'IRCM-2025-467';
const IRB_APPROVAL_DATE = 'December 3, 2025';
const PRINCIPAL_INVESTIGATOR = 'Dr. M. Scott Mortensen, MD, MPAS, MLT';

export default function IRBAuthorityStrip({ variant = 'full' }: { variant?: Variant }) {
  if (variant === 'compact') {
    return (
      <div
        className="w-full"
        style={{
          background: 'linear-gradient(90deg, var(--navy) 0%, #11305c 100%)',
          borderTop: '1px solid rgba(200,149,44,0.25)',
          borderBottom: '1px solid rgba(200,149,44,0.25)',
        }}
      >
        <div className="container-xl py-2.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-white/90">
          <span className="flex items-center gap-1.5">
            <ShieldDot />
            <strong className="text-white">IRB-Approved</strong>
            <span className="opacity-70">Protocol {IRB_PROTOCOL_ID}</span>
          </span>
          <Divider />
          <span>503A/503B Sourced</span>
          <Divider />
          <span>Per-batch COA Verified</span>
          <Divider />
          <span>MD-Led Clinical Oversight</span>
        </div>
      </div>
    );
  }

  return (
    <section
      className="w-full"
      style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #0f2a52 60%, #11305c 100%)',
        borderTop: '1px solid rgba(200,149,44,0.25)',
        borderBottom: '1px solid rgba(200,149,44,0.25)',
      }}
    >
      <div className="container-xl py-7">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          {/* Left — IRB headline */}
          <div className="flex items-start gap-4 lg:flex-1">
            <div
              className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(200,149,44,0.15)',
                border: '1px solid rgba(200,149,44,0.35)',
              }}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.18em] mb-1.5"
                style={{ color: 'var(--gold)' }}
              >
                IRB-Approved Research Protocol
              </p>
              <h3 className="text-lg font-bold text-white mb-1 leading-snug">
                {IRB_PROTOCOL_ID} <span className="text-white/40 mx-1.5">·</span>
                <span className="text-white/70 font-medium">{IRB_REGISTRY_ID}</span>
              </h3>
              <p className="text-sm text-white/55 leading-relaxed">
                Approved {IRB_APPROVAL_DATE} · Principal Investigator: {PRINCIPAL_INVESTIGATOR}
              </p>
            </div>
          </div>

          {/* Right — 4 trust pillars */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 lg:flex-1">
            <Pillar icon={<IconFlask />} label="503A/503B" sub="Sourced" />
            <Pillar icon={<IconShieldCheck />} label="Per-Batch" sub="COA Tested" />
            <Pillar icon={<IconStethoscope />} label="MD-Led" sub="Clinical Oversight" />
            <Pillar icon={<IconBuilding />} label="50-State" sub="Licensed" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Sub-components ── */

function Pillar({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span className="shrink-0" style={{ color: 'var(--gold)' }}>{icon}</span>
      <div className="min-w-0">
        <div className="text-sm font-bold text-white leading-tight">{label}</div>
        <div className="text-xs text-white/55 uppercase tracking-wider leading-tight mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

function Divider() {
  return <span className="text-white/25">·</span>;
}

function ShieldDot() {
  return (
    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconFlask() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 5a2 2 0 00-2 2v1a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9zM5 12h14l-1.5 9H6.5L5 12z" />
    </svg>
  );
}

function IconShieldCheck() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconStethoscope() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 3v6a4.5 4.5 0 009 0V3M6.75 21a3.75 3.75 0 003.75-3.75v-3M6.75 21a3.75 3.75 0 01-3.75-3.75h0M16.5 14.25v3.75a3.75 3.75 0 003.75 3.75M16.5 14.25a3.75 3.75 0 013.75 3.75M16.5 14.25v-1.5" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}
