import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CATEGORY_CONFIG, getBaseProductName, type ProductRow } from '@/lib/peptideConfig';
import ProductDetailBody from '@/components/peptides/ProductDetailBody';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, description, category, image_url, price_cents')
    .eq('slug', slug).eq('is_active', true).single();

  if (!product) return { title: 'Product Not Found' };

  const baseName = getBaseProductName(product.name);
  const desc = product.description ?? `${baseName} — clinical-grade ${product.category} peptide from PeptidePure.`;
  const ogImage = product.image_url ?? 'https://dzbvaswimmaxfvambivu.supabase.co/storage/v1/object/public/peptides/wp-content/uploads/2025/05/product-line-up.webp';

  return {
    title: `${baseName} — ${product.category} Peptide`,
    description: desc,
    alternates: { canonical: `/peptides/${slug}` },
    openGraph: {
      title: `${baseName} | PeptidePure™`, description: desc,
      url: `https://peptidepure.com/peptides/${slug}`, type: 'website',
      images: [{ url: ogImage, width: 640, height: 640, alt: `${baseName} peptide vial` }],
    },
    twitter: { card: 'summary_large_image', title: `${baseName} | PeptidePure™`, description: desc, images: [ogImage] },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase.from('products').select('*').eq('slug', slug).eq('is_active', true).single<ProductRow>();
  if (!product) notFound();

  const baseName = getBaseProductName(product.name);

  const { data: allVariants } = await supabase
    .from('products').select('id, name, slug, price_cents, sku, metadata')
    .eq('is_active', true).eq('category', product.category).order('price_cents', { ascending: true });

  const variants = (allVariants ?? []).filter((v) => getBaseProductName(v.name) === baseName);

  const { data: related } = await supabase
    .from('products').select('id, name, slug, description, image_url, category, metadata')
    .eq('category', product.category).eq('is_active', true).neq('id', product.id)
    .order('sort_order', { ascending: true }).limit(20);

  const seenBases = new Set([baseName]);
  const dedupedRelated = (related ?? []).filter((r) => {
    const base = getBaseProductName(r.name);
    if (seenBases.has(base)) return false;
    seenBases.add(base);
    return true;
  }).slice(0, 4);

  const catConfig = CATEGORY_CONFIG[product.category] ?? { color: 'var(--navy)', label: product.category };
  const meta = product.metadata ?? {};

  return <ProductDetailBody product={product} baseName={baseName} variants={variants} catConfig={catConfig} meta={meta} slug={slug} dedupedRelated={dedupedRelated} />;
}
