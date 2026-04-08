/**
 * ProtocolMembership
 *
 * Server component. Reads content/peptides.json and finds Essential Protocol
 * Packages that include the current peptide. Renders matching protocols as
 * cards linking back to /peptides#protocols section.
 *
 * Drives AOV: every PDP becomes a funnel into the bundle/protocol upsell.
 */

import Link from 'next/link';
import Image from 'next/image';
import { getContent } from '@/lib/content';

type Protocol = {
  name: string;
  tags: string[];
  image: string;
  peptides: string[];
  description: string;
};

type PeptidesContent = {
  protocols?: {
    heading?: string;
    items?: Protocol[];
  };
};

/**
 * Match logic:
 *  - Strip strength/dose suffix from protocol peptide names ("BPC-157 10mg" → "BPC-157")
 *  - Compare normalized base names case-insensitively
 *  - This matches the same getBaseProductName logic used elsewhere
 */
function normalizeName(s: string): string {
  return s
    .replace(/\s+\d+m[cg]g?$/i, '')
    .replace(/\s+\(Lead Time\)$/i, '')
    .trim()
    .toLowerCase();
}

export default async function ProtocolMembership({ baseName }: { baseName: string }) {
  const content = (await getContent('peptides')) as PeptidesContent;
  const allProtocols = content.protocols?.items ?? [];
  const targetName = normalizeName(baseName);

  // Find protocols whose peptide list includes this peptide
  const matching = allProtocols.filter((p) =>
    p.peptides.some((peptideName) => normalizeName(peptideName) === targetName)
  );

  if (matching.length === 0) return null;

  return (
    <section
      style={{
        background: 'white',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="container-xl py-14">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: 'var(--gold)' }}
            >
              Essential Protocol Packages
            </p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--navy)' }}>
              {baseName} is part of {matching.length} clinical protocol
              {matching.length === 1 ? '' : 's'}
            </h2>
            <p className="text-base mt-3 max-w-xl" style={{ color: 'var(--text-mid)' }}>
              Bundle this peptide with synergistic compounds at clinic-tier pricing.
            </p>
          </div>
          <Link
            href="/peptides#protocols"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:underline"
            style={{ color: 'var(--navy)' }}
          >
            View all protocols
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Protocol cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matching.map((protocol) => (
            <Link
              key={protocol.name}
              href="/peptides#protocols"
              className="group rounded-2xl overflow-hidden bg-white transition-all hover:shadow-lg"
              style={{ border: '1px solid var(--border)' }}
            >
              {/* Image */}
              <div
                className="relative aspect-4/3 overflow-hidden"
                style={{ background: 'var(--navy)' }}
              >
                {protocol.image && (
                  <Image
                    src={protocol.image}
                    alt={protocol.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(11,31,58,0) 50%, rgba(11,31,58,0.85) 100%)',
                  }}
                />
                {/* "Includes this peptide" badge */}
                <div
                  className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    background: 'rgba(200,149,44,0.95)',
                    color: 'var(--navy)',
                  }}
                >
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Includes {baseName}
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3
                  className="text-lg font-bold leading-snug mb-2 group-hover:underline"
                  style={{ color: 'var(--navy)' }}
                >
                  {protocol.name}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-mid)' }}>
                  {protocol.description}
                </p>

                {/* Peptide list */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {protocol.peptides.slice(0, 5).map((peptide) => {
                    const isCurrent = normalizeName(peptide) === targetName;
                    return (
                      <span
                        key={peptide}
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background: isCurrent ? 'var(--gold-pale)' : 'var(--off-white)',
                          color: isCurrent ? 'var(--gold)' : 'var(--text-mid)',
                          border: isCurrent
                            ? '1px solid rgba(200,149,44,0.4)'
                            : '1px solid var(--border)',
                        }}
                      >
                        {peptide}
                      </span>
                    );
                  })}
                </div>

                {/* CTA */}
                <div
                  className="flex items-center justify-between pt-3 text-sm font-semibold"
                  style={{ color: 'var(--navy)', borderTop: '1px solid var(--border)' }}
                >
                  <span>View Protocol</span>
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
