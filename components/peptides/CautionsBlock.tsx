/**
 * CautionsBlock
 *
 * Displays contraindications and cautions for a peptide.
 *
 * Reads metadata.contraindications: string[]  (hard contraindications)
 *   and metadata.cautions: string[]            (relative cautions)
 *
 * Each entry is a single sentence. Renders nothing if both are empty.
 */

export default function CautionsBlock({
  contraindications = [],
  cautions = [],
}: {
  contraindications?: string[];
  cautions?: string[];
}) {
  if (contraindications.length === 0 && cautions.length === 0) return null;

  return (
    <div
      className="rounded-2xl bg-white overflow-hidden h-full"
      style={{ border: '1px solid var(--border)' }}
    >
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA' }}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
        </svg>
        <h3
          className="text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: '#991B1B' }}
        >
          Cautions &amp; Contraindications
        </h3>
      </div>

      <div className="p-5 space-y-4">
        {contraindications.length > 0 && (
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{ color: '#DC2626' }}
            >
              Contraindicated In
            </p>
            <ul className="space-y-1.5">
              {contraindications.map((item, i) => (
                <BulletItem key={i} variant="warning">
                  {item}
                </BulletItem>
              ))}
            </ul>
          </div>
        )}

        {cautions.length > 0 && (
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{ color: '#D97706' }}
            >
              Use Caution With
            </p>
            <ul className="space-y-1.5">
              {cautions.map((item, i) => (
                <BulletItem key={i} variant="caution">
                  {item}
                </BulletItem>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function BulletItem({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: 'warning' | 'caution';
}) {
  const dotColor = variant === 'warning' ? '#DC2626' : '#D97706';
  return (
    <li className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--text-mid)' }}>
      <span
        className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
        style={{ background: dotColor }}
      />
      <span>{children}</span>
    </li>
  );
}
