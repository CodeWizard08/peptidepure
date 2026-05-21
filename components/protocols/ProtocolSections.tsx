import type {
  ProtocolMeta,
  IndicationGroup,
  DosingRow,
  Interaction,
  InteractionClassification,
  ReconstitutionStep,
  QualityIndicator,
  ResearchReference,
  Pharmacokinetics,
  MolecularInfo,
  QuickStartItem,
  SideEffectGroup,
} from '@/lib/protocols/types';

// ─── Common atoms ────────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-2xl font-bold mb-5"
      style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}
    >
      {children}
    </h2>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'white', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(11,31,58,0.05)' }}
    >
      {children}
    </div>
  );
}

// ─── Quick Start Guide (sidebar) ─────────────────────────────────────────────
export function QuickStartSidebar({ items }: { items: QuickStartItem[] }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(11,31,58,0.05)' }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--navy)' }}>Quick Start Guide</h3>
      <ul className="space-y-4">
        {items.map((it) => (
          <li key={it.label} className="flex gap-3">
            <span className="shrink-0 w-1 mt-1 rounded-full" style={{ background: 'var(--gold)' }} aria-hidden />
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>
                {it.label}
              </p>
              <p className="text-sm mt-0.5 leading-snug" style={{ color: 'var(--text-dark)' }}>
                {it.value}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Overview (Key Benefits + Mechanism side cards) ──────────────────────────
export function OverviewCallouts({ meta }: { meta: ProtocolMeta }) {
  if (!meta.key_benefits && !meta.mechanism_short) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {meta.key_benefits && (
        <div className="rounded-xl p-5" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--navy)' }}>Key Benefits</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{meta.key_benefits}</p>
        </div>
      )}
      {meta.mechanism_short && (
        <div className="rounded-xl p-5" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--navy)' }}>Mechanism of Action</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{meta.mechanism_short}</p>
        </div>
      )}
    </div>
  );
}

// ─── Molecular Information ───────────────────────────────────────────────────
export function MolecularSection({ data }: { data: MolecularInfo }) {
  if (!data || (!data.weight && !data.length && !data.type && !data.sequence)) return null;
  return (
    <section className="mb-12">
      <SectionHeading>Molecular Information</SectionHeading>
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
          {data.weight && <Stat label="Weight" value={data.weight} />}
          {data.length && <Stat label="Length" value={data.length} />}
          {data.type   && <Stat label="Type"   value={data.type} />}
        </div>
        {data.sequence && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-light)' }}>
              Amino Acid Sequence
            </p>
            <p
              className="text-xs font-mono px-3 py-2.5 rounded-lg wrap-break-word"
              style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)', lineHeight: 1.6 }}
            >
              {data.sequence}
            </p>
          </div>
        )}
        {data.footnote && (
          <p className="text-xs mt-3 italic" style={{ color: 'var(--text-light)' }}>* {data.footnote}</p>
        )}
      </Card>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-light)' }}>{label}</p>
      <p className="text-base font-semibold" style={{ color: 'var(--navy)' }}>{value}</p>
    </div>
  );
}

// ─── Pharmacokinetics + SVG decay chart ──────────────────────────────────────
export function PharmacokineticsSection({ data }: { data: Pharmacokinetics }) {
  const peak_day = data?.peak_day;
  const half_life_days = data?.half_life_days;
  const total_days = data?.total_days;
  // Curve renders only when all three numeric inputs are finite, positive,
  // and ordered correctly. Otherwise we fall back to the stat row only.
  const chartReady =
    Number.isFinite(peak_day) && (peak_day as number) > 0 &&
    Number.isFinite(half_life_days) && (half_life_days as number) > 0 &&
    Number.isFinite(total_days) && (total_days as number) > (peak_day as number);

  if (!chartReady) {
    if (data?.peak || data?.half_life || data?.cleared) {
      return (
        <section className="mb-12">
          <SectionHeading>Pharmacokinetics</SectionHeading>
          <Card>
            <div className="grid grid-cols-3 gap-4">
              {data.peak      && <Stat label="Peak"      value={data.peak} />}
              {data.half_life && <Stat label="Half-life" value={data.half_life} />}
              {data.cleared   && <Stat label="Cleared"   value={data.cleared} />}
            </div>
          </Card>
        </section>
      );
    }
    return null;
  }

  // Re-type the guarded numerics so the curve math is non-nullable.
  const peakDay = peak_day as number;
  const halfLifeDays = half_life_days as number;
  const totalDays = total_days as number;
  // Build curve points: linear ramp 0→peak, then exponential decay.
  const points: Array<[number, number]> = [];
  const STEPS = 60;
  for (let i = 0; i <= STEPS; i++) {
    const t = (i / STEPS) * totalDays;
    let pct: number;
    if (t <= peakDay) {
      pct = (t / peakDay) * 100;
    } else {
      pct = 100 * Math.pow(0.5, (t - peakDay) / halfLifeDays);
    }
    points.push([t, pct]);
  }

  // Chart dims (viewBox coordinates).
  const W = 600;
  const H = 220;
  const PAD_L = 36;
  const PAD_R = 16;
  const PAD_T = 18;
  const PAD_B = 30;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const xCoord = (t: number) => PAD_L + (t / totalDays) * chartW;
  const yCoord = (pct: number) => PAD_T + chartH - (pct / 100) * chartH;

  const pathD = points.map(([t, pct], i) => `${i === 0 ? 'M' : 'L'} ${xCoord(t).toFixed(1)} ${yCoord(pct).toFixed(1)}`).join(' ');

  const xTicks = [0, Math.round(totalDays / 4), Math.round(totalDays / 2), Math.round((totalDays * 3) / 4), totalDays];
  const xLabels: Record<number, string> = { 0: 'Dose', [totalDays]: `${totalDays}d` };

  return (
    <section className="mb-12">
      <SectionHeading>Pharmacokinetics</SectionHeading>
      <Card>
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 mb-5 text-sm">
          {data.peak      && <span><strong style={{ color: 'var(--navy)' }}>Peak:</strong> {data.peak}</span>}
          {data.half_life && <span><strong style={{ color: 'var(--navy)' }}>Half-life:</strong> {data.half_life}</span>}
          {data.cleared   && <span><strong style={{ color: 'var(--navy)' }}>Cleared:</strong> {data.cleared}</span>}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Pharmacokinetic curve" className="w-full h-auto">
          {/* gridlines */}
          {[0, 25, 50, 75, 100].map((pct) => (
            <line
              key={pct}
              x1={PAD_L}
              x2={W - PAD_R}
              y1={yCoord(pct)}
              y2={yCoord(pct)}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray={pct === 0 ? undefined : '3 3'}
            />
          ))}
          {/* y-axis labels */}
          {[0, 50, 100].map((pct) => (
            <text key={pct} x={PAD_L - 6} y={yCoord(pct) + 4} fontSize="10" fill="#94a3b8" textAnchor="end">
              {pct}%
            </text>
          ))}
          {/* curve */}
          <path d={pathD} fill="none" stroke="var(--navy)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
          {/* peak marker */}
          <circle cx={xCoord(peakDay)} cy={yCoord(100)} r="4.5" fill="var(--gold)" stroke="white" strokeWidth="1.5" />
          {/* half-life marker */}
          <circle cx={xCoord(peakDay + halfLifeDays)} cy={yCoord(50)} r="3.5" fill="var(--navy)" stroke="white" strokeWidth="1.5" />
          {/* x-axis tick labels */}
          {xTicks.map((t) => (
            <text key={t} x={xCoord(t)} y={H - 10} fontSize="10" fill="#94a3b8" textAnchor="middle">
              {xLabels[t] ?? `${t}d`}
            </text>
          ))}
        </svg>
        <div className="flex gap-5 text-xs mt-2" style={{ color: 'var(--text-light)' }}>
          <span><span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: 'var(--gold)' }} />Peak</span>
          <span><span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: 'var(--navy)' }} />Half-life</span>
          {data.source_label && (
            <span className="ml-auto italic">{data.source_label}</span>
          )}
        </div>
      </Card>
    </section>
  );
}

// ─── Research Indications (accordion) ────────────────────────────────────────
const EFFECTIVENESS_COLOR: Record<string, { bg: string; color: string }> = {
  'MOST EFFECTIVE': { bg: 'rgba(34,197,94,0.15)', color: '#16a34a' },
  'EFFECTIVE':      { bg: 'rgba(34,197,94,0.10)', color: '#16a34a' },
  'EMERGING':       { bg: 'rgba(234,179,8,0.18)', color: '#a16207' },
  'MIXED':          { bg: 'rgba(148,163,184,0.18)', color: '#475569' },
};

export function ResearchIndications({ data }: { data: IndicationGroup[] }) {
  if (!data?.length) return null;
  return (
    <section className="mb-12">
      <SectionHeading>Research Indications</SectionHeading>
      <Card>
        <div className="space-y-3">
          {data.map((group, idx) => {
            const pal = group.effectiveness ? EFFECTIVENESS_COLOR[group.effectiveness] : null;
            return (
              <details
                key={group.name + idx}
                open={idx === 0}
                className="rounded-xl"
                style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}
              >
                <summary className="cursor-pointer px-4 py-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle" style={{ background: 'var(--gold)' }} />
                    {group.name}
                  </span>
                  {pal && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: pal.bg, color: pal.color }}>
                      {group.effectiveness}
                    </span>
                  )}
                </summary>
                <div className="px-5 pb-4 pt-1 space-y-3">
                  {group.items.map((it, i) => (
                    <div key={i}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>{it.title}</p>
                      <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'var(--text-mid)' }}>{it.detail}</p>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </Card>
    </section>
  );
}

// ─── Research Protocols dosing table ─────────────────────────────────────────
export function ResearchProtocolsTable({ rows, timingNote }: { rows: DosingRow[]; timingNote?: string }) {
  if (!rows?.length) return null;
  return (
    <section className="mb-12">
      <SectionHeading>Research Protocols</SectionHeading>
      <Card>
        <div
          className="rounded-lg px-4 py-2.5 mb-4 text-xs font-semibold uppercase tracking-wider"
          style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)' }}
        >
          Disclaimer · These are commonly discussed research protocols and not medical advice. Consult a healthcare provider before use.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-2.5 pr-4 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Goal</th>
                <th className="text-left py-2.5 pr-4 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Dose</th>
                <th className="text-left py-2.5 pr-4 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Frequency</th>
                <th className="text-left py-2.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Route</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3 pr-4 font-semibold" style={{ color: 'var(--navy)' }}>{row.goal}</td>
                  <td className="py-3 pr-4" style={{ color: 'var(--text-dark)' }}>{row.dose}</td>
                  <td className="py-3 pr-4" style={{ color: 'var(--text-mid)' }}>{row.frequency}</td>
                  <td className="py-3" style={{ color: 'var(--text-mid)' }}>{row.route}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {timingNote && (
          <p className="text-xs mt-4 italic px-3 py-2 rounded-lg" style={{ background: 'var(--off-white)', color: 'var(--text-mid)' }}>
            <strong>Timing · </strong>{timingNote}
          </p>
        )}
      </Card>
    </section>
  );
}

// ─── Peptide Interactions ────────────────────────────────────────────────────
const INTERACTION_COLOR: Record<InteractionClassification, { bg: string; color: string; dot: string }> = {
  AVOID:       { bg: 'rgba(220,38,38,0.10)', color: '#dc2626', dot: '#dc2626' },
  MONITOR:     { bg: 'rgba(234,179,8,0.18)', color: '#a16207', dot: '#a16207' },
  SYNERGISTIC: { bg: 'rgba(34,197,94,0.14)', color: '#16a34a', dot: '#16a34a' },
  COMPATIBLE:  { bg: 'rgba(59,130,246,0.12)', color: '#2563eb', dot: '#2563eb' },
};

export function PeptideInteractions({ data }: { data: Interaction[] }) {
  if (!data?.length) return null;
  return (
    <section className="mb-12">
      <SectionHeading>Peptide Interactions</SectionHeading>
      <Card>
        <ul className="space-y-2">
          {data.map((it, i) => {
            const pal = INTERACTION_COLOR[it.classification] ?? INTERACTION_COLOR.COMPATIBLE;
            return (
              <li
                key={i}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg"
                style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}
              >
                <span className="flex items-center gap-3 text-sm font-semibold" style={{ color: 'var(--navy)' }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: pal.dot }} aria-hidden />
                  {it.peptide}
                  {it.note && (
                    <span className="hidden md:inline text-xs font-normal" style={{ color: 'var(--text-mid)' }}>
                      — {it.note}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: pal.bg, color: pal.color }}>
                  {it.classification.replace('_', ' ')}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}

// ─── Reconstitution Steps ────────────────────────────────────────────────────
export function ReconstitutionSteps({ steps, warning }: { steps: ReconstitutionStep[]; warning?: string }) {
  if (!steps?.length) return null;
  return (
    <section className="mb-12">
      <SectionHeading>How to Reconstitute</SectionHeading>
      <Card>
        {warning && (
          <div
            className="rounded-lg px-4 py-2.5 mb-4 text-xs font-semibold uppercase tracking-wider"
            style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)' }}
          >
            Important · {warning}
          </div>
        )}
        <ol className="space-y-3">
          {steps.map((s) => (
            <li key={s.step} className="flex gap-4 items-start">
              <span
                className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)' }}
              >
                {s.step}
              </span>
              <p className="text-sm leading-relaxed pt-1" style={{ color: 'var(--text-dark)' }}>
                {s.description}
              </p>
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
}

// ─── Quality Indicators ──────────────────────────────────────────────────────
const QUALITY_COLOR = {
  pass: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a', icon: '✓' },
  warn: { bg: 'rgba(234,179,8,0.18)', color: '#a16207', icon: '!' },
  fail: { bg: 'rgba(220,38,38,0.12)', color: '#dc2626', icon: '✕' },
};

export function QualityIndicatorsSection({ items }: { items: QualityIndicator[] }) {
  if (!items?.length) return null;
  return (
    <section className="mb-12">
      <SectionHeading>Quality Indicators</SectionHeading>
      <Card>
        <ul className="space-y-3">
          {items.map((it, i) => {
            const pal = QUALITY_COLOR[it.type] ?? QUALITY_COLOR.pass;
            return (
              <li key={i} className="flex gap-3 items-start">
                <span
                  className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                  style={{ background: pal.bg, color: pal.color }}
                  aria-hidden
                >
                  {pal.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>{it.title}</p>
                  <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'var(--text-mid)' }}>{it.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}

// ─── What to Expect ──────────────────────────────────────────────────────────
export function WhatToExpect({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <section className="mb-12">
      <SectionHeading>What to Expect</SectionHeading>
      <Card>
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} aria-hidden />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-dark)' }}>{it}</p>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

// ─── Side Effects + When to Stop tabs ────────────────────────────────────────
export function SideEffectsTabs({ data, slug }: { data: SideEffectGroup; slug: string }) {
  const hasSE = data?.side_effects?.length;
  const hasWS = data?.when_to_stop?.length;
  if (!hasSE && !hasWS) return null;

  return (
    <section className="mb-12">
      <SectionHeading>Side Effects &amp; Safety</SectionHeading>
      <Card>
        <div className="flex gap-2 mb-4 text-xs font-bold uppercase tracking-wider">
          {hasSE && (
            <a href={`#side-effects-${slug}`} className="px-3 py-1.5 rounded-lg" style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}>
              Side Effects · {data.side_effects.length}
            </a>
          )}
          {hasWS && (
            <a href={`#when-to-stop-${slug}`} className="px-3 py-1.5 rounded-lg" style={{ background: 'var(--off-white)', color: 'var(--text-mid)' }}>
              When to Stop · {data.when_to_stop.length}
            </a>
          )}
        </div>
        {hasSE && (
          <div id={`side-effects-${slug}`} className="mb-5">
            <ul className="space-y-2">
              {data.side_effects.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm" style={{ color: 'var(--text-dark)' }}>
                  <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} aria-hidden />
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {hasWS && (
          <div id={`when-to-stop-${slug}`}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-light)' }}>
              When to Stop & Call Provider
            </p>
            <ul className="space-y-2">
              {data.when_to_stop.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm" style={{ color: 'var(--text-dark)' }}>
                  <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full" style={{ background: '#dc2626' }} aria-hidden />
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </section>
  );
}

// ─── References ──────────────────────────────────────────────────────────────
export function ReferencesSection({ items }: { items: ResearchReference[] }) {
  if (!items?.length) return null;
  return (
    <section className="mb-12">
      <SectionHeading>References</SectionHeading>
      <Card>
        <div className="space-y-5">
          {items.map((ref, i) => (
            <div key={i} className="pb-4 last:pb-0" style={{ borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <p className="text-sm font-bold" style={{ color: 'var(--navy)' }}>{ref.title}</p>
              {ref.tags && ref.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                  {ref.tags.map((t) => (
                    <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{ref.summary}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

// ─── Related Peptides ────────────────────────────────────────────────────────
type RelatedItem = {
  slug: string;
  title: string;
  category: string | null;
  tags: string[];
};

export function RelatedPeptides({ items }: { items: RelatedItem[] }) {
  if (!items?.length) return null;
  return (
    <section className="mb-4">
      <SectionHeading>Related Peptides</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((p) => (
          <a
            key={p.slug}
            href={`/protocols/${p.slug}`}
            className="block rounded-xl p-4 transition-all hover:-translate-y-0.5"
            style={{ background: 'white', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(11,31,58,0.05)' }}
          >
            {p.tags[0] && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}>
                {p.tags[0]}
              </span>
            )}
            <p className="text-sm font-bold mt-2.5" style={{ color: 'var(--navy)' }}>{p.title}</p>
            {p.category && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>{p.category}</p>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
