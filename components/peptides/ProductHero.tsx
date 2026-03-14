import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';

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

type CatConfig = { color: string; label: string };

export default function ProductHero({
  product,
  catConfig,
  meta,
}: {
  product: Product;
  catConfig: CatConfig;
  meta: Record<string, any>;
}) {
  const dosage = meta.dosage as string | undefined;
  const administration = meta.administration as string | undefined;
  const storage = meta.storage as string | undefined;
  const purity = meta.purity as string | undefined;
  const volume = meta.volume as string | undefined;
  const features = (meta.features ?? []) as string[];
  const hasSpecs = dosage || administration || storage || purity || volume;

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ background: 'var(--off-white)', borderBottom: '1px solid var(--border)' }}>
        <div className="container-xl py-3.5">
          <nav className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-light)' }}>
            <Link href="/" className="hover:underline">Home</Link>
            <ChevronRight />
            <Link href="/peptides" className="hover:underline">Peptides</Link>
            <ChevronRight />
            <span style={{ color: catConfig.color }} className="font-medium">{catConfig.label}</span>
            <ChevronRight />
            <span style={{ color: 'var(--navy)' }} className="font-semibold">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Hero */}
      <section className="container-xl py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left -- Image */}
          <div className="lg:w-5/12">
            <div className="sticky top-24">
              <div
                className="rounded-2xl overflow-hidden flex items-center justify-center aspect-square shadow-lg"
                style={{ background: 'linear-gradient(145deg, #0B1F3A 0%, #1a3a6b 60%, #243f6e 100%)' }}
              >
                <img
                  src={product.image_url || '/images/oral-peptides.png'}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Notices below image */}
              {(product.requires_prescription || product.requires_consultation) && (
                <div className="mt-4 space-y-2">
                  {product.requires_prescription && (
                    <div className="flex items-center gap-2.5 text-xs font-medium px-4 py-3 rounded-xl" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
                      <IconAlert />
                      Prescription Required
                    </div>
                  )}
                  {product.requires_consultation && (
                    <div className="flex items-center gap-2.5 text-xs font-medium px-4 py-3 rounded-xl" style={{ background: '#DBEAFE', color: '#1E40AF', border: '1px solid #BFDBFE' }}>
                      <IconChat />
                      Consultation Required
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right -- Info */}
          <div className="lg:w-7/12">
            {/* Category + subcategory */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full"
                style={{ background: `${catConfig.color}12`, color: catConfig.color, border: `1px solid ${catConfig.color}25` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: catConfig.color }} />
                {catConfig.label}
              </span>
              {product.subcategory && (
                <span className="text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-full" style={{ background: 'var(--off-white)', color: 'var(--text-light)', border: '1px solid var(--border)' }}>
                  {product.subcategory}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2" style={{ color: 'var(--navy)' }}>
              {product.name}
            </h1>

            {product.sku && (
              <p className="text-xs font-mono mb-5" style={{ color: 'var(--text-light)' }}>
                SKU: {product.sku}
              </p>
            )}

            {/* Short description */}
            {product.description && (
              <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-mid)' }}>
                {product.description}
              </p>
            )}

            <hr className="mb-8" style={{ borderColor: 'var(--border)' }} />

            {/* Specs grid */}
            {hasSpecs && (
              <div className="rounded-xl overflow-hidden mb-8" style={{ border: '1px solid var(--border)' }}>
                <div className="px-5 py-3" style={{ background: 'var(--navy)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Product Specifications</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3" style={{ background: 'var(--off-white)' }}>
                  {dosage && <SpecCell label="Dosage" value={dosage} />}
                  {administration && <SpecCell label="Administration" value={administration} />}
                  {purity && <SpecCell label="Purity" value={purity} />}
                  {volume && <SpecCell label="Volume" value={volume} />}
                  {storage && <SpecCell label="Storage" value={storage} />}
                </div>
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--navy)' }}>
                  Key Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm rounded-lg px-3.5 py-2.5" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
                      <IconCheck />
                      <span style={{ color: 'var(--text-mid)' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price_cents: product.price_cents,
                image_url: product.image_url,
              }}
            />

            {/* Trust strip */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs" style={{ color: 'var(--text-light)' }}>
              <span className="flex items-center gap-1.5">
                <IconShield />
                Third-party tested
              </span>
              <span className="flex items-center gap-1.5">
                <IconFlask />
                Clinical-grade
              </span>
              <span className="flex items-center gap-1.5">
                <IconLock />
                Clinician access only
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Icon helpers ── */

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-light)' }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>{value}</p>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="opacity-40">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="shrink-0 mt-0.5" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" style={{ color: 'var(--gold)' }}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconFlask() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 5a2 2 0 00-2 2v1a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9zM5 12h14l-1.5 9H6.5L5 12z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
