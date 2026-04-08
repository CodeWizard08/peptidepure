/**
 * BundlePrompt
 *
 * Server component. Surfaces the most relevant Foundation/Growth/Premier
 * starter bundle for the current peptide based on its category.
 *
 * Reads content/peptides.json starterPackages and matches the peptide's
 * category against the bundle's focus text. Only renders for peptides
 * that fit one of the bundles (i.e. have non-zero pricing and standard category).
 */

import Link from 'next/link';
import { getContent } from '@/lib/content';

type StarterPackage = {
  name: string;
  price: string;
  wholesale: string;
  retail: string;
  tier: string;
  desc: string;
  focus: string;
  detail: string;
  bonus: string;
  highlight: boolean;
};

type PeptidesContent = {
  starterPackages?: StarterPackage[];
};

/**
 * Heuristic: pick the bundle whose focus text most strongly references
 * the product's category. We bias toward the highlighted (Most Popular) tier
 * when there's no obvious match, since the business plan emphasizes the
 * Growth Bundle as the primary AOV target.
 */
function pickBundle(packages: StarterPackage[], category: string): StarterPackage | null {
  if (packages.length === 0) return null;

  // Categories that align with each bundle's focus text
  const categoryHints: Record<string, string[]> = {
    'Metabolism/Weight Loss': ['weight', 'metabolic', 'tirz', 'reta'],
    'Longevity & Mitochondrial': ['longevity', 'mitochondrial', 'epithalon', 'mots'],
    'MSK/Tissue Repair': ['repair', 'tissue', 'bpc', 'ghk'],
    'Growth Hormone': ['growth', 'hormone'],
    'Cognitive & Mood': ['cognitive', 'mood', 'neuro'],
  };

  const hints = categoryHints[category] ?? [];
  const cat = category.toLowerCase();

  // Score each bundle by overlap with the category hints
  const scored = packages.map((pkg) => {
    const focus = (pkg.focus + ' ' + pkg.desc).toLowerCase();
    let score = 0;
    if (focus.includes(cat)) score += 5;
    for (const hint of hints) {
      if (focus.includes(hint)) score += 2;
    }
    if (pkg.highlight) score += 1; // tiebreaker toward Most Popular
    return { pkg, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.pkg ?? null;
}

export default async function BundlePrompt({
  baseName,
  category,
  productPriceCents,
}: {
  baseName: string;
  category: string;
  productPriceCents: number;
}) {
  // Don't show for free/legacy products
  if (productPriceCents === 0) return null;

  const content = (await getContent('peptides')) as PeptidesContent;
  const packages = content.starterPackages ?? [];
  const bundle = pickBundle(packages, category);

  if (!bundle) return null;

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, var(--gold-pale) 0%, #fff5e0 100%)',
        borderTop: '1px solid rgba(200,149,44,0.2)',
        borderBottom: '1px solid rgba(200,149,44,0.2)',
      }}
    >
      <div className="container-xl py-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          {/* Left — savings pitch */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: 'var(--gold)',
                  color: 'var(--navy)',
                }}
              >
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {bundle.tier}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>
                Bundle Pricing Available
              </span>
            </div>

            <h3 className="text-2xl font-bold leading-tight mb-2" style={{ color: 'var(--navy)' }}>
              Save up to 80% with the {bundle.name.replace('$', '')}
            </h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-mid)' }}>
              {baseName} is included in this clinic-tier package. Bundle includes{' '}
              <strong style={{ color: 'var(--navy)' }}>{bundle.focus.toLowerCase()}</strong> with{' '}
              <strong style={{ color: 'var(--navy)' }}>{bundle.bonus}</strong> as a bonus.
            </p>

            {/* Price comparison strip */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <PriceLine
                label="Bundle Price"
                value={bundle.price}
                color="var(--navy)"
                size="lg"
              />
              <PriceLine
                label="Wholesale Value"
                value={bundle.wholesale}
                color="var(--text-mid)"
                strike
              />
              <PriceLine
                label="Patient Retail"
                value={bundle.retail}
                color="var(--text-light)"
                strike
              />
            </div>
          </div>

          {/* Right — CTA */}
          <div className="lg:shrink-0">
            <Link
              href="/peptides#starter-packages"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:shadow-lg"
              style={{
                background: 'var(--navy)',
                color: 'white',
              }}
            >
              View Bundle Details
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                className="transition-transform group-hover:translate-x-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceLine({
  label,
  value,
  color,
  strike,
  size,
}: {
  label: string;
  value: string;
  color: string;
  strike?: boolean;
  size?: 'lg';
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: 'var(--text-light)' }}
      >
        {label}:
      </span>
      <span
        className={size === 'lg' ? 'text-lg font-bold' : 'text-sm font-semibold'}
        style={{
          color,
          textDecoration: strike ? 'line-through' : 'none',
        }}
      >
        {value}
      </span>
    </div>
  );
}
