import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { createClient } from '@/lib/supabase/server';
import PageHero from '@/components/sections/PageHero';
import CategorySidebar from '@/components/peptides/CategorySidebar';
import StarterPackages from '@/components/peptides/StarterPackages';
import ProductGrid from '@/components/peptides/ProductGrid';
import ProtocolsSection from '@/components/peptides/ProtocolsSection';

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

const PRODUCTS_PER_PAGE = 9;

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

  const { data: { user } } = await supabase.auth.getUser();

  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, slug, category')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

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
          <CategorySidebar categoryMap={categoryMap} CATEGORY_CONFIG={CATEGORY_CONFIG} />

          <main className="flex-1 min-w-0">
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)' }}>
              {content.customBadge}
            </div>

            <StarterPackages user={user} packages={content.starterPackages} />

            <ProductGrid
              products={(products ?? []) as Product[]}
              user={user}
              categoryFilter={categoryFilter}
              categoryMap={categoryMap}
              currentPage={currentPage}
              totalPages={totalPages}
              totalProducts={totalProducts}
              from={from}
              PRODUCTS_PER_PAGE={PRODUCTS_PER_PAGE}
              CATEGORY_CONFIG={CATEGORY_CONFIG}
            />

            <ProtocolsSection content={content.protocols} />
          </main>
        </div>
      </div>
    </>
  );
}
