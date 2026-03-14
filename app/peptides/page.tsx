import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Peptide Catalog',
  description:
    'Browse our full catalog of USA cGMP-compliant peptides. BPC-157, TB-500, Tirzepatide, and more — available exclusively to licensed clinicians.',
  alternates: { canonical: '/peptides' },
  openGraph: {
    title: 'Peptide Catalog — PeptidePure™',
    description:
      'Browse USA cGMP-compliant peptides: BPC-157, TB-500, Tirzepatide, and more. Exclusively for licensed clinicians.',
  },
};
import { getContent } from '@/lib/content';
import { createClient } from '@/lib/supabase/server';
import { formatCents } from '@/lib/format';
import PageHero from '@/components/sections/PageHero';

const PRODUCTS_PER_PAGE = 9;

// Category display config (color + subtitle for sidebar)
const CATEGORY_CONFIG: Record<string, { color: string; subtitle: string }> = {
  'Metabolic / Weight Loss': { color: '#C8952C', subtitle: 'Endocrine System' },
  'MSK / Tissue Repair': { color: '#2563EB', subtitle: 'Musculoskeletal System' },
  'Longevity / Mitochondrial': { color: '#059669', subtitle: 'Cellular Aging, Neuroprotection, Energy Systems' },
  'Growth Hormone / GH Receptor': { color: '#7C3AED', subtitle: 'Endocrine & Muscular System' },
  'Immune / Antimicrobial': { color: '#DC2626', subtitle: 'Immune & Inflammatory Regulation' },
  'Cognitive & Mood': { color: '#0891B2', subtitle: 'Neuroendocrine & Neurotransmitter Support' },
};

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

export default async function PeptidesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const { page: pageParam, category: categoryFilter } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const from = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  const [content, supabase] = await Promise.all([
    getContent<any>('peptides'),
    createClient(),
  ]);

  // Check auth for starter package CTA
  const { data: { user } } = await supabase.auth.getUser();

  // Sidebar query — all products for category grouping
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, slug, category')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  // Paginated query for the main grid
  let query = supabase
    .from('products')
    .select('id, name, slug, description, category, subcategory, price_cents, image_url, is_active, sort_order', { count: 'exact' })
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
    .range(from, to);

  if (categoryFilter) {
    query = query.eq('category', categoryFilter);
  }

  const { data: products, count: totalCount } = await query;

  const totalProducts = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));

  // Group all products by category for sidebar
  const categoryMap = new Map<string, { id: string; name: string; slug: string }[]>();
  for (const product of (allProducts ?? [])) {
    const list = categoryMap.get(product.category) ?? [];
    list.push(product);
    categoryMap.set(product.category, list);
  }

  return (
    <>
      <PageHero
        sectionLabel={content.hero.sectionLabel}
        heading={content.hero.heading}
        subtitle={content.hero.subtitle}
      />

      <div className="container-xl py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-20">
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border)' }}>
                <div className="px-5 py-4" style={{ background: 'var(--navy)' }}>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Categories</h3>
                </div>
                <div className="bg-white divide-y divide-gray-100">
                  {Array.from(categoryMap.entries()).map(([category, items]) => {
                    const config = CATEGORY_CONFIG[category] ?? { color: 'var(--navy)', subtitle: category };
                    return (
                      <div key={category} className="px-5 py-4">
                        <p className="text-sm font-bold mb-1" style={{ color: config.color }}>
                          {category}
                        </p>
                        <p className="text-xs italic mb-2" style={{ color: 'var(--text-light)' }}>
                          ({config.subtitle})
                        </p>
                        <ul className="space-y-1">
                          {items.map((product) => (
                            <li key={product.id}>
                              <Link href={`/peptides/${product.slug}`} className="text-xs hover:underline" style={{ color: 'var(--text-mid)' }}>
                                {product.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Custom Formulations badge */}
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)' }}>
              {content.customBadge}
            </div>

            {/* Starter Packages */}
            {user ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {content.starterPackages.map((pkg: any) => (
                  <div
                    key={pkg.name}
                    className={`rounded-2xl overflow-hidden shadow-sm flex flex-col relative ${pkg.highlight ? 'ring-2' : ''}`}
                    style={{
                      border: pkg.highlight ? '2px solid var(--gold)' : '1px solid var(--border)',
                      background: 'white',
                    }}
                  >
                    {pkg.highlight && (
                      <div className="text-center py-1.5 text-xs font-bold uppercase tracking-widest text-white" style={{ background: 'var(--gold)' }}>
                        Most Popular
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-light)' }}>
                        {pkg.tier}
                      </div>
                      <h3 className="text-xl font-bold mb-1" style={{ color: pkg.highlight ? 'var(--gold)' : 'var(--navy)' }}>
                        {pkg.price}
                      </h3>
                      <p className="text-sm mb-4" style={{ color: 'var(--text-mid)' }}>{pkg.desc}</p>
                      <div className="text-xs mb-3 p-3 rounded-lg" style={{ background: 'var(--off-white)' }}>
                        <strong style={{ color: 'var(--navy)' }}>Focus:</strong>{' '}
                        <span style={{ color: 'var(--text-mid)' }}>{pkg.focus}</span>
                      </div>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-light)' }}>{pkg.detail}</p>
                      <div className="mt-auto space-y-1">
                        <div className="flex justify-between text-xs">
                          <span style={{ color: 'var(--text-light)' }}>Wholesale Value:</span>
                          <span className="line-through" style={{ color: 'var(--text-light)' }}>{pkg.wholesale}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold">
                          <span style={{ color: 'var(--navy)' }}>Patient Retail Value:</span>
                          <span style={{ color: 'var(--gold)' }}>{pkg.retail}</span>
                        </div>
                        {pkg.bonus && (
                          <p className="text-xs mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)', color: 'var(--gold)' }}>
                            Bonus: {pkg.bonus}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="px-6 pb-5">
                      <Link
                        href="/contact"
                        className="w-full text-center block py-2.5 rounded-lg text-sm font-semibold transition-colors"
                        style={{ background: pkg.highlight ? 'var(--gold)' : 'var(--navy)', color: 'white' }}
                      >
                        Request Package
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden shadow-sm mb-8" style={{ border: '1px solid var(--border)', background: 'white' }}>
                <div className="px-6 py-5 flex items-center gap-3" style={{ background: 'var(--navy)' }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Starter Packages</h3>
                </div>
                <div className="p-8 text-center">
                  <p className="text-base font-semibold mb-2" style={{ color: 'var(--navy)' }}>
                    Pricing available for verified clinicians
                  </p>
                  <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-mid)' }}>
                    We offer tiered starter packages with volume discounts for licensed healthcare professionals. Log in or create an account to view pricing and request a package.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/account" className="btn-primary">
                      Log In to View Pricing
                    </Link>
                    <Link href="/contact" className="btn-outline">
                      Contact Sales
                    </Link>
                  </div>
                </div>
              </div>
            )}

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
            {(products ?? []).length > 0 && (
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
                  {(products as Product[]).map((product) => (
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
                  <nav className="flex items-center justify-center gap-1.5 mb-14">
                    {/* Previous */}
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

                    {/* Page numbers */}
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

                    {/* Next */}
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
                )}
              </>
            )}

            {/* Empty state */}
            {(products ?? []).length === 0 && (
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

            {/* Essential Protocols */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--navy)' }}>{content.protocols.heading}</h2>
              <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                {content.protocols.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {content.protocols.items.map((protocol: any, i: number) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm card-hover flex flex-col"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <div className="h-44 flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B1F3A, #1a3a6b)' }}>
                    <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                    <div className="flex flex-col items-center gap-3 relative z-10">
                      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5" className="opacity-60">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Protocol Bundle</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--navy)' }}>{protocol.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {protocol.tags.map((tag: string) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full uppercase tracking-wide font-medium" style={{ background: 'var(--off-white)', color: 'var(--text-light)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href="#"
                      className="mt-auto text-center py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: 'var(--navy)' }}
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

/* ── Helpers ── */

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
