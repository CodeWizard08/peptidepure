import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProductHero from '@/components/peptides/ProductHero';
import RelatedProducts from '@/components/peptides/RelatedProducts';
import { buildProductJsonLd, buildBreadcrumbJsonLd } from '@/lib/productJsonLd';
import type { ProductRow } from '@/lib/peptideConfig';

interface Props {
  product: ProductRow;
  baseName: string;
  variants: { id: string; name: string; slug: string; price_cents: number; sku?: string | null; metadata?: Record<string, unknown> | null }[];
  catConfig: { color: string; label?: string };
  meta: Record<string, unknown>;
  slug: string;
  dedupedRelated: { id: string; name: string; slug: string; description?: string | null; image_url?: string | null; category: string; metadata?: Record<string, unknown> | null }[];
}

export default function ProductDetailBody({ product, baseName, variants, catConfig, meta, slug, dedupedRelated }: Props) {
  const productJsonLd = buildProductJsonLd(product, slug, baseName);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(slug, baseName);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <ProductHero product={product} baseName={baseName} variants={variants} catConfig={catConfig} meta={meta} />

      {product.long_description && (
        <section style={{ background: 'var(--off-white)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="container-xl py-14">
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold mb-8" style={{ color: 'var(--navy)' }}>About {baseName}</h2>
              <div className="prose-product">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{product.long_description}</ReactMarkdown>
              </div>
            </div>
          </div>
        </section>
      )}

      <RelatedProducts products={dedupedRelated} />

      <div className="container-xl pb-14">
        <Link href="/peptides" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:underline" style={{ color: 'var(--navy)' }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Peptides
        </Link>
      </div>
    </>
  );
}
