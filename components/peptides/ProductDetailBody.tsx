import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProductHero from '@/components/peptides/ProductHero';
import RelatedProducts from '@/components/peptides/RelatedProducts';
import IRBAuthorityStrip from '@/components/IRBAuthorityStrip';
import BundlePrompt from '@/components/peptides/BundlePrompt';
import ProtocolMembership from '@/components/peptides/ProtocolMembership';
import StackedWith from '@/components/peptides/StackedWith';
import MechanismBlock from '@/components/peptides/MechanismBlock';
import CautionsBlock from '@/components/peptides/CautionsBlock';
import MonitorLabsBlock from '@/components/peptides/MonitorLabsBlock';
import ReconstitutionCalculator from '@/components/peptides/ReconstitutionCalculator';
import PeptideBuzzCrossSell from '@/components/peptides/PeptideBuzzCrossSell';
import DiscoverTagsBlock from '@/components/peptides/DiscoverTagsBlock';
import { buildProductJsonLd, buildBreadcrumbJsonLd } from '@/lib/productJsonLd';
import type { ProductRow } from '@/lib/peptideConfig';

interface Props {
  product: ProductRow;
  baseName: string;
  variants: { id: string; name: string; slug: string; price_cents: number; sku: string | null; metadata: Record<string, unknown> | null }[];
  catConfig: { color: string; label: string };
  meta: Record<string, unknown>;
  slug: string;
  dedupedRelated: { id: string; name: string; slug: string; description: string | null; image_url: string | null; category: string; metadata?: Record<string, unknown> | null }[];
  isClinician?: boolean;
}

export default function ProductDetailBody({ product, baseName, variants, catConfig, meta, slug, dedupedRelated, isClinician = false }: Props) {
  const productJsonLd = buildProductJsonLd(product, slug, baseName);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(slug, baseName);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <ProductHero product={product} baseName={baseName} variants={variants} catConfig={catConfig} meta={meta} isClinician={isClinician} />

      <IRBAuthorityStrip />

      <BundlePrompt baseName={baseName} category={product.category} productPriceCents={product.price_cents} />

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

      <ClinicalReferenceSection baseName={baseName} meta={meta} />

      <DiscoverTagsBlock baseName={baseName} meta={meta} />

      <PeptideBuzzCrossSell baseName={baseName} />

      <ProtocolMembership baseName={baseName} />

      <StackedWith baseName={baseName} synergisticWith={meta.synergistic_with} />

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

/**
 * Clinical Reference section — only renders if at least one of mechanism,
 * cautions, monitor_labs, or strength is present. Layout: 2x2 grid on lg+,
 * stacked on mobile. Reconstitution Calculator always renders (it's pure math).
 */
function ClinicalReferenceSection({
  baseName,
  meta,
}: {
  baseName: string;
  meta: Record<string, unknown>;
}) {
  const mechanism = meta.mechanism as
    | { receptor?: string; half_life?: string; onset?: string; metabolism?: string }
    | undefined;
  const contraindications = (meta.contraindications as string[] | undefined) ?? [];
  const cautions = (meta.cautions as string[] | undefined) ?? [];
  const monitorLabs = meta.monitor_labs;
  const strength = meta.strength as string | undefined;
  const amount = meta.amount as string | undefined;

  const hasMechanism =
    mechanism && (mechanism.receptor || mechanism.half_life || mechanism.onset || mechanism.metabolism);
  const hasCautions = contraindications.length > 0 || cautions.length > 0;
  const hasLabs = Array.isArray(monitorLabs) && monitorLabs.length > 0;

  // If no clinical content AND no strength to power calculator, hide section
  if (!hasMechanism && !hasCautions && !hasLabs && !strength) return null;

  return (
    <section
      style={{
        background: 'white',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="container-xl py-14">
        <div className="mb-8">
          <p
            className="text-xs font-bold uppercase tracking-[0.18em] mb-2"
            style={{ color: 'var(--gold)' }}
          >
            For Clinicians
          </p>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--navy)' }}>
            Clinical Reference
          </h2>
          <p className="text-base mt-3 max-w-xl" style={{ color: 'var(--text-mid)' }}>
            Pharmacology, safety, monitoring, and dosing reference for {baseName}.
            Always individualize based on patient context.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {hasMechanism && <MechanismBlock mechanism={mechanism} />}
          {hasCautions && (
            <CautionsBlock contraindications={contraindications} cautions={cautions} />
          )}
          {hasLabs && <MonitorLabsBlock labs={monitorLabs} />}
          {strength && (
            <ReconstitutionCalculator
              defaultStrength={strength}
              defaultAmount={amount}
              baseName={baseName}
            />
          )}
        </div>
      </div>
    </section>
  );
}
