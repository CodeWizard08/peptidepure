import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProductHero from '@/components/peptides/ProductHero';
import RelatedProducts from '@/components/peptides/RelatedProducts';

const CATEGORY_CONFIG: Record<string, { color: string; label: string }> = {
  'Metabolic / Weight Loss': { color: '#C8952C', label: 'Metabolic / Weight Loss' },
  'MSK / Tissue Repair': { color: '#2563EB', label: 'MSK / Tissue Repair' },
  'Longevity / Mitochondrial': { color: '#059669', label: 'Longevity / Mitochondrial' },
  'Growth Hormone / GH Receptor': { color: '#7C3AED', label: 'Growth Hormone / GH Receptor' },
  'Immune / Antimicrobial': { color: '#DC2626', label: 'Immune / Antimicrobial' },
  'Cognitive & Mood': { color: '#0891B2', label: 'Cognitive & Mood' },
};

type Product = {
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, description, category')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.name} | PeptidePure`,
    description: product.description ?? `${product.name} — clinical-grade ${product.category} peptide from PeptidePure.`,
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
    .single<Product>();

  if (!product) notFound();

  const { data: related } = await supabase
    .from('products')
    .select('id, name, slug, description, image_url, category')
    .eq('category', product.category)
    .eq('is_active', true)
    .neq('id', product.id)
    .order('sort_order', { ascending: true })
    .limit(3);

  const catConfig = CATEGORY_CONFIG[product.category] ?? { color: 'var(--navy)', label: product.category };
  const meta = product.metadata ?? {};

  return (
    <>
      <ProductHero product={product} catConfig={catConfig} meta={meta} />

      {/* Long Description -- Markdown */}
      {product.long_description && (
        <section style={{ background: 'var(--off-white)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="container-xl py-14">
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold mb-8" style={{ color: 'var(--navy)' }}>
                About {product.name}
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

      <RelatedProducts products={related ?? []} />

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
