import Link from 'next/link';
import { formatCents } from '@/lib/format';

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  price_cents: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  metadata: {
    strength?: string;
    amount?: string;
    form?: string;
    brand?: string;
    inventory?: string;
    lead_time_days?: number | null;
    patient_price_cents?: number | null;
    volume_pricing?: Record<string, number> | null;
  } | null;
};

type CategoryConfig = Record<string, { color: string; subtitle: string }>;

function InventoryBadge({ inventory, leadTime }: { inventory?: string; leadTime?: number | null }) {
  if (inventory === 'oos') {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: '#FEE2E2', color: '#DC2626' }}>
        Out of Stock
      </span>
    );
  }
  if (inventory === 'lead_time') {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#D97706' }}>
        {leadTime ? `${leadTime}-Day Lead` : 'Pre-Order'}
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: '#D1FAE5', color: '#059669' }}>
      In Stock
    </span>
  );
}

export default function ProductGrid({
  products,
  user,
  categoryFilter,
  categoryMap,
  currentPage,
  totalPages,
  totalProducts,
  from,
  PRODUCTS_PER_PAGE,
  CATEGORY_CONFIG,
}: {
  products: Product[];
  user: any;
  categoryFilter: string | undefined;
  categoryMap: Map<string, any[]>;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  from: number;
  PRODUCTS_PER_PAGE: number;
  CATEGORY_CONFIG: CategoryConfig;
}) {
  return (
    <>
      {/* Category filter pills */}
      {categoryMap.size > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/peptides"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors"
            style={{
              background: !categoryFilter ? 'var(--navy)' : 'var(--off-white)',
              color: !categoryFilter ? 'white' : 'var(--text-mid)',
              border: `1px solid ${!categoryFilter ? 'var(--navy)' : 'var(--border)'}`,
            }}
          >
            All
          </Link>
          {Array.from(categoryMap.keys()).map((cat) => {
            const active = categoryFilter === cat;
            const config = CATEGORY_CONFIG[cat];
            return (
              <Link
                key={cat}
                href={`/peptides?category=${encodeURIComponent(cat)}`}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors"
                style={{
                  background: active ? (config?.color ?? 'var(--navy)') : 'var(--off-white)',
                  color: active ? 'white' : (config?.color ?? 'var(--text-mid)'),
                  border: `1px solid ${active ? (config?.color ?? 'var(--navy)') : 'var(--border)'}`,
                }}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 && (
        <>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--navy)' }}>
                {categoryFilter ?? 'All Products'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                Showing {from + 1}–{Math.min(from + PRODUCTS_PER_PAGE, totalProducts)} of {totalProducts} product{totalProducts !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {products.map((product) => {
              const meta = product.metadata;
              const inventory = meta?.inventory ?? 'in_stock';
              const brand = meta?.brand ?? 'peptidepure';
              const form = meta?.form ?? product.subcategory;
              const catConfig = CATEGORY_CONFIG[product.category];
              const catColor = catConfig?.color ?? 'var(--navy)';

              return (
                <Link
                  key={product.id}
                  href={`/peptides/${product.slug}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm card-hover flex flex-col group"
                  style={{ border: '1px solid var(--border)' }}
                >
                  {/* Image / header area */}
                  <div className="h-40 flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #0B1F3A, #1a3a6b)' }}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 relative z-10">
                        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5" className="opacity-40">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                        </svg>
                        {meta?.strength && (
                          <span className="text-white/70 text-sm font-bold">{meta.strength}</span>
                        )}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                    {/* Top-left: brand badge */}
                    {brand === 'peptidebuzz' && (
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90" style={{ color: 'var(--navy)' }}>
                        Peptide Buzz
                      </span>
                    )}

                    {/* Top-right: inventory status */}
                    <div className="absolute top-2.5 right-2.5">
                      <InventoryBadge inventory={inventory} leadTime={meta?.lead_time_days} />
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    {/* Product name */}
                    <h3 className="text-sm font-bold mb-1 group-hover:underline" style={{ color: 'var(--navy)' }}>
                      {product.name}
                    </h3>

                    {/* Description */}
                    {product.description && (
                      <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-mid)' }}>
                        {product.description}
                      </p>
                    )}

                    {/* Tags: category + form */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: `${catColor}12`, color: catColor, border: `1px solid ${catColor}30` }}
                      >
                        {product.category}
                      </span>
                      {form && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--off-white)', color: 'var(--text-light)' }}>
                          {form}
                        </span>
                      )}
                      {meta?.amount && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--off-white)', color: 'var(--text-light)' }}>
                          {meta.amount}
                        </span>
                      )}
                    </div>

                    {/* Pricing */}
                    {user ? (
                      <div className="mb-3">
                        {product.price_cents > 0 && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-bold" style={{ color: 'var(--gold)' }}>
                              {formatCents(product.price_cents)}
                            </span>
                            {meta?.patient_price_cents && (
                              <span className="text-[10px]" style={{ color: 'var(--text-light)' }}>
                                Patient: {formatCents(meta.patient_price_cents)}
                              </span>
                            )}
                          </div>
                        )}
                        {meta?.volume_pricing && (
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-light)' }}>
                            Volume pricing available (MOQ 10)
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs font-medium mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-light)' }}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Login for pricing
                      </p>
                    )}

                    {/* CTA */}
                    <span
                      className="mt-auto text-center py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity group-hover:opacity-90"
                      style={{ background: inventory === 'oos' ? 'var(--text-light)' : 'var(--navy)' }}
                    >
                      {inventory === 'oos' ? 'Notify Me' : 'View Details'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} categoryFilter={categoryFilter} />
          )}
        </>
      )}

      {/* Empty state */}
      {products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--navy)' }}>No products found</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-light)' }}>
            {categoryFilter ? `No products in "${categoryFilter}" yet.` : 'Products will appear here once added.'}
          </p>
          {categoryFilter && (
            <Link href="/peptides" className="text-sm font-medium hover:underline" style={{ color: 'var(--gold)' }}>
              View all products &rarr;
            </Link>
          )}
        </div>
      )}
    </>
  );
}

/* ── Pagination ── */

function buildPageUrl(page: number, category?: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (category) params.set('category', category);
  const qs = params.toString();
  return `/peptides${qs ? `?${qs}` : ''}`;
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

function Pagination({
  currentPage,
  totalPages,
  categoryFilter,
}: {
  currentPage: number;
  totalPages: number;
  categoryFilter: string | undefined;
}) {
  return (
    <nav className="flex items-center justify-center gap-1.5 mb-14">
      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(currentPage - 1, categoryFilter)}
          className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
          style={{ color: 'var(--navy)' }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium opacity-30 cursor-not-allowed" style={{ color: 'var(--text-light)' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </span>
      )}

      {getPageNumbers(currentPage, totalPages).map((p: number | string, i: number) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm" style={{ color: 'var(--text-light)' }}>...</span>
        ) : (
          <Link
            key={p}
            href={buildPageUrl(p as number, categoryFilter)}
            className="min-w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: p === currentPage ? 'var(--navy)' : 'transparent',
              color: p === currentPage ? 'white' : 'var(--text-mid)',
            }}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(currentPage + 1, categoryFilter)}
          className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
          style={{ color: 'var(--navy)' }}
        >
          Next
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium opacity-30 cursor-not-allowed" style={{ color: 'var(--text-light)' }}>
          Next
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </nav>
  );
}
