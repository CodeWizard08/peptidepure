import Link from 'next/link';

type CategoryConfig = Record<string, { color: string; subtitle: string }>;

// Preferred display order for categories
const CATEGORY_ORDER = [
  'Metabolism/Weight Loss',
  'MSK/Tissue Repair',
  'Longevity & Mitochondrial',
  'Growth Hormone',
  'Immune/Antimicrobial',
  'Cognitive & Mood',
  'Aminos & Specialty Blends',
  'Nootropics',
  'Anti-aging Aesthetics',
];

export default function CategorySidebar({
  categoryMap,
  CATEGORY_CONFIG,
}: {
  categoryMap: Map<string, { id: string; name: string; slug: string }[]>;
  CATEGORY_CONFIG: CategoryConfig;
}) {
  // Sort entries by preferred order, unknowns go last
  const entries = Array.from(categoryMap.entries()).sort(([a], [b]) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const totalCount = entries.reduce((sum, [, items]) => sum + items.length, 0);

  return (
    <aside className="lg:w-64 shrink-0">
      {/* Mobile: horizontal scrollable bar */}
      <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-2 w-max">
          <Link
            href="/peptides"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap"
            style={{
              background: 'var(--navy)',
              color: '#fff',
            }}
          >
            All ({totalCount})
          </Link>
          {entries.map(([category, items]) => {
            const config = CATEGORY_CONFIG[category] ?? { color: 'var(--navy)', subtitle: category };
            return (
              <Link
                key={category}
                href={`/peptides?category=${encodeURIComponent(category)}`}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap"
                style={{
                  background: 'var(--off-white)',
                  color: config.color,
                  border: `1px solid ${config.color}`,
                }}
              >
                {category}
                <span className="opacity-60">({items.length})</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop: full sidebar with collapsible sections */}
      <div className="hidden lg:block sticky top-28">
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border)' }}>
          <div className="px-5 py-4" style={{ background: 'var(--navy)' }}>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Categories</h3>
          </div>
          <div className="bg-white" style={{ borderTop: 'none' }}>
            {/* All Peptides link */}
            <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <Link
                href="/peptides"
                className="text-sm font-bold hover:underline flex items-center justify-between"
                style={{ color: 'var(--navy)' }}
              >
                All Products
                <span className="text-xs font-normal" style={{ color: 'var(--text-light)' }}>({totalCount})</span>
              </Link>
            </div>

            {/* Collapsible category sections */}
            {entries.map(([category, items], index) => {
              const config = CATEGORY_CONFIG[category] ?? { color: 'var(--navy)', subtitle: category };
              return (
                <details
                  key={category}
                  open={index < 3}
                  className="group"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <summary
                    className="px-5 py-4 cursor-pointer list-none flex items-center justify-between"
                    style={{ WebkitAppearance: 'none' }}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold" style={{ color: config.color }}>
                        {category}
                      </span>
                      <span className="text-xs ml-1" style={{ color: 'var(--text-light)' }}>
                        ({items.length})
                      </span>
                      <p className="text-[11px] italic mt-0.5" style={{ color: 'var(--text-light)' }}>
                        {config.subtitle}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 shrink-0 ml-2 transition-transform duration-200 group-open:rotate-180"
                      style={{ color: 'var(--text-light)' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4">
                    <div className="mb-2">
                      <Link
                        href={`/peptides?category=${encodeURIComponent(category)}`}
                        className="text-xs font-medium hover:underline"
                        style={{ color: config.color }}
                      >
                        View all {category} →
                      </Link>
                    </div>
                    <ul className="space-y-1">
                      {items.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/peptides/${product.slug}`}
                            className="text-xs hover:underline"
                            style={{ color: 'var(--text-mid)' }}
                          >
                            {product.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
