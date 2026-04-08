/**
 * MechanismBlock
 *
 * Displays structured pharmacology fields for clinicians:
 *  - receptor / pathway target
 *  - half-life
 *  - onset of action
 *  - route of metabolism
 *
 * Reads metadata.mechanism = { receptor, half_life, onset, metabolism }
 * Renders nothing if mechanism is unset.
 */

type Mechanism = {
  receptor?: string;
  half_life?: string;
  onset?: string;
  metabolism?: string;
};

export default function MechanismBlock({ mechanism }: { mechanism?: Mechanism }) {
  if (!mechanism) return null;
  const { receptor, half_life, onset, metabolism } = mechanism;
  if (!receptor && !half_life && !onset && !metabolism) return null;

  const rows: { label: string; value: string; icon: React.ReactNode }[] = [];
  if (receptor)   rows.push({ label: 'Receptor / Target', value: receptor,   icon: <IconTarget /> });
  if (half_life)  rows.push({ label: 'Half-Life',         value: half_life,  icon: <IconClock /> });
  if (onset)      rows.push({ label: 'Onset of Action',   value: onset,      icon: <IconBolt /> });
  if (metabolism) rows.push({ label: 'Metabolism',        value: metabolism, icon: <IconBeaker /> });

  return (
    <ClinicalCard
      label="Mechanism of Action"
      icon={
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17 9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
        </svg>
      }
    >
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <div
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--off-white)', color: 'var(--gold)' }}
            >
              {row.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: 'var(--text-light)' }}
              >
                {row.label}
              </p>
              <p className="text-base font-medium leading-relaxed" style={{ color: 'var(--navy)' }}>
                {row.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ClinicalCard>
  );
}

/* ── Card wrapper (shared with siblings via prop drilling for now) ── */
function ClinicalCard({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl bg-white overflow-hidden h-full"
      style={{ border: '1px solid var(--border)' }}
    >
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ background: 'var(--off-white)', borderBottom: '1px solid var(--border)' }}
      >
        <span style={{ color: 'var(--navy)' }}>{icon}</span>
        <h3
          className="text-sm font-bold uppercase tracking-[0.14em]"
          style={{ color: 'var(--navy)' }}
        >
          {label}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── Icons ── */
function IconTarget() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}
function IconBeaker() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v6.17a2 2 0 0 1-.59 1.42L4.6 14.4a2 2 0 0 0-.6 1.42V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.18a2 2 0 0 0-.59-1.41l-3.82-3.82A2 2 0 0 1 15 9.17V3M9 3h6M8 14h8" />
    </svg>
  );
}
