/**
 * MonitorLabsBlock
 *
 * Suggested labs to monitor during peptide therapy. This is the seed of the
 * Meridian TRACK module — every peptide should eventually map to specific
 * biomarkers so the AI protocol engine can interpret patient bloodwork.
 *
 * Reads metadata.monitor_labs: Array<{ name: string; rationale?: string; cadence?: string }>
 * Or accepts simple string[] for forward compatibility.
 */

type LabItem = { name: string; rationale?: string; cadence?: string };

export default function MonitorLabsBlock({ labs }: { labs?: unknown }) {
  // Normalize input shape
  const items: LabItem[] = Array.isArray(labs)
    ? labs
        .map((l) => {
          if (typeof l === 'string') return { name: l };
          if (l && typeof l === 'object' && 'name' in l) return l as LabItem;
          return null;
        })
        .filter((x): x is LabItem => x !== null)
    : [];

  if (items.length === 0) return null;

  return (
    <div
      className="rounded-2xl bg-white overflow-hidden h-full"
      style={{ border: '1px solid var(--border)' }}
    >
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ background: 'var(--gold-pale)', borderBottom: '1px solid rgba(200,149,44,0.2)' }}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6m-6 0a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3M9 17v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3M8 8h8m-8 4h6" />
        </svg>
        <h3
          className="text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: 'var(--gold)' }}
        >
          Suggested Labs to Monitor
        </h3>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {items.map((lab, i) => (
          <div key={i} className="px-5 py-3">
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>
                {lab.name}
              </p>
              {lab.cadence && (
                <span
                  className="shrink-0 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: 'var(--off-white)',
                    color: 'var(--text-light)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {lab.cadence}
                </span>
              )}
            </div>
            {lab.rationale && (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                {lab.rationale}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="px-5 py-2.5" style={{ background: 'var(--off-white)', borderTop: '1px solid var(--border)' }}>
        <p className="text-[10px] font-medium" style={{ color: 'var(--text-light)' }}>
          Lab interpretation guidance comes from peer-reviewed literature. Always individualize based on patient context.
        </p>
      </div>
    </div>
  );
}
