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
};

type CategoryConfig = Record<string, { color: string; subtitle: string }>;

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/peptides/${product.slug}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm card-hover flex flex-col group"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="h-44 flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #0B1F3A, #1a3a6b)' }}>
                  <img
                    src={product.image_url || '/images/oral-peptides.png'}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-sm font-bold mb-1 group-hover:underline" style={{ color: 'var(--navy)' }}>{product.name}</h3>
                  {product.description && (
                    <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-mid)' }}>
                      {product.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="text-xs px-2 py-0.5 rounded-full uppercase tracking-wide font-medium" style={{ background: 'var(--off-white)', color: 'var(--text-light)' }}>
                      {product.category}
                    </span>
                    {product.subcategory && (
                      <span className="text-xs px-2 py-0.5 rounded-full uppercase tracking-wide font-medium" style={{ background: 'var(--off-white)', color: 'var(--text-light)' }}>
                        {product.subcategory}
                      </span>
                    )}
                  </div>
                  {user ? (
                    product.price_cents > 0 && (
                      <p className="text-sm font-bold mb-3" style={{ color: 'var(--gold)' }}>
                        {formatCents(product.price_cents)}
                      </p>
                    )
                  ) : (
                    <p className="text-xs font-medium mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-light)' }}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Login for pricing
                    </p>
                  )}
                  <span
                    className="mt-auto text-center py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity group-hover:opacity-90"
                    style={{ background: 'var(--navy)' }}
                  >
                    View Details
                  </span>
                </div>
              </Link>
            ))}
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
