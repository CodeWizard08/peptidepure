import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProductHero from '@/components/peptides/ProductHero';
import RelatedProducts from '@/components/peptides/RelatedProducts';

const CATEGORY_CONFIG: Record<string, { color: string; label: string }> = {
  'Metabolism/Weight Loss': { color: '#C8952C', label: 'Metabolism/Weight Loss' },
  'MSK/Tissue Repair': { color: '#2563EB', label: 'MSK/Tissue Repair' },
  'Longevity & Mitochondrial': { color: '#059669', label: 'Longevity & Mitochondrial' },
  'Growth Hormone': { color: '#7C3AED', label: 'Growth Hormone' },
  'Immune/Antimicrobial': { color: '#DC2626', label: 'Immune/Antimicrobial' },
  'Cognitive & Mood': { color: '#0891B2', label: 'Cognitive & Mood' },
  'Aminos & Specialty Blends': { color: '#6B7280', label: 'Aminos & Specialty Blends' },
  'Nootropics': { color: '#8B5CF6', label: 'Nootropics' },
  'Anti-aging Aesthetics': { color: '#EC4899', label: 'Anti-aging Aesthetics' },
};

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  category: string;
  subcategory: string | null;
  price_cents: number;
  image_url: string | null;
  sku: string | null;
  requires_prescription: boolean;
  requires_consultation: boolean;
  metadata: Record<string, any> | null;
};

// Derive a "base product name" from a variant name for grouping
// e.g. "TIRZ 10mg" → "TIRZ", "Epithalon 50mg" → "Epithalon", "BPC-157/TB500 20mg" → "BPC-157/TB500"
function getBaseProductName(name: string): string {
  return name.replace(/\s+\d+m[cg]g?$/i, '').replace(/\s+\(Lead Time\)$/i, '').trim();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, description, category, image_url, price_cents')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!product) return { title: 'Product Not Found' };

  const baseName = getBaseProductName(product.name);
  const desc = product.description ?? `${baseName} — clinical-grade ${product.category} peptide from PeptidePure.`;
  const ogImage = product.image_url ?? 'https://peptidepure.com/wp-content/uploads/2025/05/product-line-up.webp';

  return {
    title: `${baseName} — ${product.category} Peptide`,
    description: desc,
    alternates: {
      canonical: `/peptides/${slug}`,
    },
    openGraph: {
      title: `${baseName} | PeptidePure™`,
      description: desc,
      url: `https://peptidepure.com/peptides/${slug}`,
      type: 'website',
      images: [{ url: ogImage, width: 640, height: 640, alt: `${baseName} peptide vial` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${baseName} | PeptidePure™`,
      description: desc,
      images: [ogImage],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single<ProductRow>();

  if (!product) notFound();

  const baseName = getBaseProductName(product.name);

  // Find all strength variants of the same base product (same category, similar name)
  const { data: allVariants } = await supabase
    .from('products')
    .select('id, name, slug, price_cents, sku, metadata')
    .eq('is_active', true)
    .eq('category', product.category)
    .order('price_cents', { ascending: true });

  // Filter to matching base name
  const variants = (allVariants ?? []).filter(
    (v) => getBaseProductName(v.name) === baseName
  );

  // Related products (different base name, same category)
  const { data: related } = await supabase
    .from('products')
    .select('id, name, slug, description, image_url, category, metadata')
    .eq('category', product.category)
    .eq('is_active', true)
    .neq('id', product.id)
    .order('sort_order', { ascending: true })
    .limit(20);

  // Deduplicate related by base name, exclude current product variants
  const seenBases = new Set([baseName]);
  const dedupedRelated = (related ?? []).filter((r) => {
    const base = getBaseProductName(r.name);
    if (seenBases.has(base)) return false;
    seenBases.add(base);
    return true;
  }).slice(0, 4);

  const catConfig = CATEGORY_CONFIG[product.category] ?? { color: 'var(--navy)', label: product.category };
  const meta = product.metadata ?? {};

  // JSON-LD structured data
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? `${baseName} — clinical-grade ${product.category} peptide.`,
    image: product.image_url ?? undefined,
    sku: product.sku ?? undefined,
    brand: { '@type': 'Brand', name: 'PeptidePure™' },
    category: product.category,
    url: `https://peptidepure.com/peptides/${slug}`,
    ...(product.price_cents > 0
      ? {
          offers: {
            '@type': 'Offer',
            price: (product.price_cents / 100).toFixed(2),
            priceCurrency: 'USD',
            availability:
              meta.inventory_status === 'oos'
                ? 'https://schema.org/OutOfStock'
                : 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: 'PeptidePure™' },
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://peptidepure.com' },
      { '@type': 'ListItem', position: 2, name: 'All Peptides', item: 'https://peptidepure.com/peptides' },
      { '@type': 'ListItem', position: 3, name: baseName, item: `https://peptidepure.com/peptides/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductHero
        product={product}
        baseName={baseName}
        variants={variants}
        catConfig={catConfig}
        meta={meta}
      />

      {/* Long Description -- Markdown */}
      {product.long_description && (
        <section style={{ background: 'var(--off-white)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="container-xl py-14">
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold mb-8" style={{ color: 'var(--navy)' }}>
                About {baseName}
              </h2>
              <div className="prose-product">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {product.long_description}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </section>
      )}

      <RelatedProducts products={dedupedRelated} />

      {/* Back link */}
      <div className="container-xl pb-14">
        <Link
          href="/peptides"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:underline"
          style={{ color: 'var(--navy)' }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Peptides
        </Link>
      </div>
    </>
  );
}
