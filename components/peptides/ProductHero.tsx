import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import { formatCents } from '@/lib/format';

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

type Variant = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  sku: string | null;
  metadata: Record<string, any> | null;
};

type CatConfig = { color: string; label: string };

export default function ProductHero({
  product,
  baseName,
  variants,
  catConfig,
  meta,
}: {
  product: Product;
  baseName: string;
  variants: Variant[];
  catConfig: CatConfig;
  meta: Record<string, any>;
}) {
  const inventory = (meta.inventory as string) ?? 'in_stock';
  const leadTimeDays = meta.lead_time_days as number | null;
  const patientPrice = (meta.patient_price_cents as number | null) ?? product.price_cents * 2;
  const volumePricing = meta.volume_pricing as Record<string, number> | null;
  const brand = (meta.brand as string) ?? 'peptidepure';
  const strength = meta.strength as string | undefined;
  const amount = meta.amount as string | undefined;
  const form = meta.form as string | undefined;
  const dosing = meta.dosing as { recommended_dose?: string; route?: string; frequency?: string; notes?: string } | undefined;

  const isOOS = inventory === 'oos';
  const isLeadTime = inventory === 'lead_time';
  const hasMultipleVariants = variants.length > 1;

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
            <Link
              href={`/peptides?category=${encodeURIComponent(product.category)}`}
              className="hover:underline font-medium"
              style={{ color: catConfig.color }}
            >
              {catConfig.label}
            </Link>
            <ChevronRight />
            <span style={{ color: 'var(--navy)' }} className="font-semibold">{baseName}</span>
          </nav>
        </div>
      </div>

      {/* MOQ Banner for lead time products */}
      {isLeadTime && (
        <div style={{ background: '#FEF3C7', borderBottom: '1px solid #FDE68A' }}>
          <div className="container-xl py-2.5 flex items-center justify-center gap-2">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold" style={{ color: '#92400E' }}>
              Minimum Order of 10 vials required — {leadTimeDays ?? 21}-day lead time for ordering and COA testing
            </span>
          </div>
        </div>
      )}

      {/* Product Hero */}
      <section className="container-xl py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left -- Image */}
          <div className="lg:w-5/12">
            <div className="sticky top-24">
              <div
                className="rounded-2xl overflow-hidden flex items-center justify-center aspect-square shadow-lg relative"
                style={{ background: 'linear-gradient(145deg, #0B1F3A 0%, #1a3a6b 60%, #243f6e 100%)' }}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={baseName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5" className="opacity-40">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                    {strength && <span className="text-white/60 text-lg font-bold relative z-10">{strength}</span>}
                  </div>
                )}

                {/* Inventory badge */}
                <div className="absolute top-3 right-3">
                  {isOOS && (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                      Out of Stock
                    </span>
                  )}
                  {isLeadTime && (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: '#FEF3C7', color: '#D97706' }}>
                      {leadTimeDays}-Day Lead
                    </span>
                  )}
                  {!isOOS && !isLeadTime && (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: '#D1FAE5', color: '#059669' }}>
                      In Stock
                    </span>
                  )}
                </div>

                {/* Brand badge */}
                {brand === 'peptidebuzz' && (
                  <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/90" style={{ color: 'var(--navy)' }}>
                    Peptide Buzz
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right -- Info */}
          <div className="lg:w-7/12">
            {/* Category + form tags */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full"
                style={{ background: `${catConfig.color}12`, color: catConfig.color, border: `1px solid ${catConfig.color}25` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: catConfig.color }} />
                {catConfig.label}
              </span>
              {form && (
                <span className="text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-full" style={{ background: 'var(--off-white)', color: 'var(--text-light)', border: '1px solid var(--border)' }}>
                  {form}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2" style={{ color: 'var(--navy)' }}>
              {baseName}
            </h1>

            {/* Strength + amount line */}
            {(strength || amount) && (
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-mid)' }}>
                {[strength, amount].filter(Boolean).join(' · ')}
              </p>
            )}

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

            {/* ═══ ALL AVAILABLE STRENGTHS / VARIANTS ═══ */}
            {hasMultipleVariants && (
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--navy)' }}>
                  Available Options
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {variants.map((v) => {
                    const vMeta = v.metadata ?? {};
                    const vStrength = vMeta.strength as string | undefined;
                    const vAmount = vMeta.amount as string | undefined;
                    const vInventory = (vMeta.inventory as string) ?? 'in_stock';
                    const isCurrentVariant = v.slug === product.slug;

                    return (
                      <Link
                        key={v.id}
                        href={`/peptides/${v.slug}`}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
                        style={{
                          background: isCurrentVariant ? `${catConfig.color}10` : 'var(--off-white)',
                          border: isCurrentVariant ? `2px solid ${catConfig.color}` : '1px solid var(--border)',
                          opacity: vInventory === 'oos' ? 0.5 : 1,
                        }}
                      >
                        <div>
                          <span className="font-semibold" style={{ color: 'var(--navy)' }}>
                            {vStrength ?? v.name}
                          </span>
                          {vAmount && (
                            <span className="text-xs ml-1.5" style={{ color: 'var(--text-light)' }}>
                              ({vAmount})
                            </span>
                          )}
                          {vInventory === 'oos' && (
                            <span className="text-[10px] ml-2 font-semibold" style={{ color: '#DC2626' }}>OOS</span>
                          )}
                          {vInventory === 'lead_time' && (
                            <span className="text-[10px] ml-2 font-semibold" style={{ color: '#D97706' }}>21-Day</span>
                          )}
                        </div>
                        <span className="font-bold text-sm" style={{ color: 'var(--gold)' }}>
                          {formatCents(v.price_cents)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══ VOLUME PRICING TABLE (lead time items) ═══ */}
            {volumePricing && (
              <div className="rounded-xl overflow-hidden mb-8" style={{ border: '1px solid var(--border)' }}>
                <div className="px-5 py-3" style={{ background: 'var(--navy)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Volume Pricing (per vial)</h3>
                </div>
                <div className="grid grid-cols-3" style={{ background: 'var(--off-white)' }}>
                  {Object.entries(volumePricing).map(([tier, cents]) => (
                    <div key={tier} className="px-4 py-3 text-center" style={{ borderRight: '1px solid var(--border)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-light)' }}>
                        {tier} vials
                      </p>
                      <p className="text-sm font-bold" style={{ color: 'var(--navy)' }}>
                        {formatCents(cents)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specs grid */}
            {(strength || amount || form) && (
              <div className="rounded-xl overflow-hidden mb-8" style={{ border: '1px solid var(--border)' }}>
                <div className="px-5 py-3" style={{ background: 'var(--navy)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Product Specifications</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3" style={{ background: 'var(--off-white)' }}>
                  {strength && <SpecCell label="Strength" value={strength} />}
                  {amount && <SpecCell label="Volume / Qty" value={amount} />}
                  {form && <SpecCell label="Form" value={form} />}
                  {product.price_cents > 0 && <SpecCell label="Suggested Retail Price" value={formatCents(patientPrice)} />}
                </div>
              </div>
            )}

            {/* Dosing Info */}
            {dosing && (
              <div className="rounded-xl overflow-hidden mb-8" style={{ border: '1px solid var(--border)' }}>
                <div className="px-5 py-3 flex items-center gap-2" style={{ background: 'var(--gold-pale)' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--gold)' }}>Dosing Guide</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3" style={{ background: 'var(--off-white)' }}>
                  {dosing.recommended_dose && <SpecCell label="Recommended Dose" value={dosing.recommended_dose} />}
                  {dosing.route && <SpecCell label="Route" value={dosing.route} />}
                  {dosing.frequency && <SpecCell label="Frequency" value={dosing.frequency} />}
                </div>
                {dosing.notes && (
                  <div className="px-5 py-3 text-xs" style={{ color: 'var(--text-mid)', borderTop: '1px solid var(--border)', background: 'var(--off-white)' }}>
                    <strong style={{ color: 'var(--navy)' }}>Note:</strong> {dosing.notes}
                  </div>
                )}
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
              inventory={inventory}
              leadTimeDays={leadTimeDays}
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

/* ── Helpers ── */

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
