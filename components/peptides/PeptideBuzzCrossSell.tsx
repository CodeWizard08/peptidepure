/**
 * PeptideBuzzCrossSell
 *
 * Bridges the clinical injectable funnel to the Peptide Buzz OTC line.
 * The business plan thesis: 80% of health-conscious consumers will never
 * inject — they need an OTC entry point. This widget converts PDP visitors
 * into Peptide Buzz customers (and vice versa once the OTC catalog moves
 * into Supabase).
 *
 * Static map keyed by canonical clinical baseName → matching OTC product.
 * Renders a "Daily wellness alternative" card that links to neurosting.com.
 */

import Link from 'next/link';

type BuzzProduct = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  badge?: string;
  bgGradient: string;
};

/**
 * Map: each clinical baseName → recommended Peptide Buzz product.
 * Multiple clinical peptides can point to the same OTC product when the
 * mechanism overlaps (e.g. Selank/Semax → NeuroSting).
 */
const CROSS_SELL_MAP: Record<string, BuzzProduct> = {
  // ── Cognitive/Mood injectables → NeuroSting oral pouches ──
  'Selank': {
    name: 'NeuroSting Oral Pouches',
    tagline: 'Patent-pending sublingual delivery',
    description: 'Daily nootropic peptide pouches for focus, calm, and mood support — no injection required.',
    url: 'https://neurosting.com',
    badge: 'In Stock',
    bgGradient: 'linear-gradient(135deg, #0891B2 0%, #0e7490 100%)',
  },
  'Semax': {
    name: 'NeuroSting Oral Pouches',
    tagline: 'Patent-pending sublingual delivery',
    description: 'Daily nootropic peptide pouches for focus, calm, and mood support — no injection required.',
    url: 'https://neurosting.com',
    badge: 'In Stock',
    bgGradient: 'linear-gradient(135deg, #0891B2 0%, #0e7490 100%)',
  },
  'NA-Selank Amidate': {
    name: 'NeuroSting Oral Pouches',
    tagline: 'Patent-pending sublingual delivery',
    description: 'Daily nootropic peptide pouches for focus, calm, and mood support — no injection required.',
    url: 'https://neurosting.com',
    badge: 'In Stock',
    bgGradient: 'linear-gradient(135deg, #0891B2 0%, #0e7490 100%)',
  },

  // ── GHK-Cu injectable → Royale Repair topical line ──
  'GHK-Cu': {
    name: 'Royale Repair GHK-Cu Serum',
    tagline: 'Topical copper peptide line',
    description: 'GHK-Cu + SNAP-8 face serum and whipped tallow balm. Daily skin regeneration without needles.',
    url: 'https://neurosting.com',
    badge: 'New',
    bgGradient: 'linear-gradient(135deg, #C8952C 0%, #b07d24 100%)',
  },

  // ── BPC-157 injectable → upcoming Gut Healing Powder (placeholder) ──
  'BPC-157': {
    name: 'Gut Healing Powder',
    tagline: 'Coming soon to Peptide Buzz',
    description: 'Daily oral gut-support blend formulated to complement BPC-157 protocols.',
    url: 'https://neurosting.com',
    badge: 'Coming Soon',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  },

  // ── NAD+ injectable → upcoming FXN Energy Strip ──
  'NAD+': {
    name: 'FXN Energy Strip',
    tagline: 'Coming soon to Peptide Buzz',
    description: 'Sublingual NAD+ precursor strips for daily mitochondrial energy support.',
    url: 'https://neurosting.com',
    badge: 'Coming Soon',
    bgGradient: 'linear-gradient(135deg, #7C3AED 0%, #6d28d9 100%)',
  },

  // ── PT-141 injectable → upcoming SX Performance Strip ──
  'PT-141': {
    name: 'SX Performance Strip',
    tagline: 'Coming soon to Peptide Buzz',
    description: 'Sublingual performance strips for daily libido and energy support.',
    url: 'https://neurosting.com',
    badge: 'Coming Soon',
    bgGradient: 'linear-gradient(135deg, #DC2626 0%, #b91c1c 100%)',
  },
};

export default function PeptideBuzzCrossSell({ baseName }: { baseName: string }) {
  const buzz = CROSS_SELL_MAP[baseName];
  if (!buzz) return null;

  return (
    <section style={{ background: 'var(--off-white)' }}>
      <div className="container-xl py-12">
        <div
          className="rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-5 gap-0"
          style={{ border: '1px solid var(--border)', background: 'white' }}
        >
          {/* Visual panel */}
          <div
            className="lg:col-span-2 relative flex items-center justify-center p-10 lg:p-12 overflow-hidden"
            style={{ background: buzz.bgGradient, minHeight: 220 }}
          >
            {/* Decorative dots pattern */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            />
            <div className="relative text-center text-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70 mb-2">
                Peptide Buzz™
              </p>
              <p className="text-2xl md:text-3xl font-bold leading-tight">{buzz.name}</p>
              <p className="text-sm opacity-75 mt-2">{buzz.tagline}</p>
            </div>

            {buzz.badge && (
              <span
                className="absolute top-4 right-4 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  color: 'var(--navy)',
                }}
              >
                {buzz.badge}
              </span>
            )}
          </div>

          {/* Body panel */}
          <div className="lg:col-span-3 p-7 lg:p-10 flex flex-col justify-center">
            <p
              className="text-xs font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: 'var(--gold)' }}
            >
              Daily Wellness Alternative
            </p>
            <h3 className="text-2xl font-bold leading-tight mb-3" style={{ color: 'var(--navy)' }}>
              Prefer a daily product over injection?
            </h3>
            <p className="text-base leading-relaxed mb-5" style={{ color: 'var(--text-mid)' }}>
              {buzz.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={buzz.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-base transition-all hover:shadow-md"
                style={{
                  background: 'var(--navy)',
                  color: 'white',
                }}
              >
                Shop {buzz.name.split(' ')[0]} →
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6 21 12m0 0-7.5 6M21 12H3" />
                </svg>
              </Link>
              <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                Opens neurosting.com in a new tab
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
