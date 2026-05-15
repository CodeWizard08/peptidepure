/**
 * PeptideBuzzCollection
 *
 * Home-page showcase of the Peptide Buzz OTC line for clinic bulk purchasing.
 * Reads live from the products table (brand='peptidebuzz'), so admins can
 * tweak names, pricing, and image_url in the admin Products panel and the
 * showcase updates automatically.
 *
 * Cards link into the existing /peptides/<slug> product detail page so the
 * standard catalog flow handles bulk-quantity selection and checkout.
 */

import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';

type BuzzProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  metadata: Record<string, unknown> | null;
};

const COLLECTION_ACCENT: Record<string, { gradient: string; chip: string }> = {
  Neurosting: {
    gradient: 'linear-gradient(135deg, #0e1f3a 0%, #1a3a6b 60%, #0b1f3a 100%)',
    chip: '#0891B2',
  },
  'Royale Repair': {
    gradient: 'linear-gradient(135deg, #1a0e1f 0%, #3a1a2e 60%, #1f0b18 100%)',
    chip: '#C8952C',
  },
  default: {
    gradient: 'linear-gradient(135deg, #0B1F3A 0%, #11305c 100%)',
    chip: '#C8952C',
  },
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// next/image throws at runtime for hostnames not in next.config.ts's allowlist.
// Allow relative paths and the Supabase storage host we already permit; fall
// back to the branded text treatment for anything else so the home page can't
// be broken by an admin pasting a random CDN URL into the Products panel.
const ALLOWED_IMAGE_HOSTS = new Set([
  'dzbvaswimmaxfvambivu.supabase.co',
  'peptidepure.com',
  'www.peptide.buzz',
  'peptide.buzz',
]);

function isImageRenderable(url: string): boolean {
  if (url.startsWith('/')) return true;
  try {
    const u = new URL(url);
    return ALLOWED_IMAGE_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

function Card({ p }: { p: BuzzProduct }) {
  const meta = (p.metadata ?? {}) as Record<string, unknown>;
  const collection = (meta.collection as string) ?? 'default';
  const accent = COLLECTION_ACCENT[collection] ?? COLLECTION_ACCENT.default;
  const amount = meta.amount as string | undefined;
  const form = meta.form as string | undefined;
  const upsellCents = meta.upsell_cents as number | undefined;

  return (
    <Link
      href={`/peptides/${p.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
      style={{
        background: accent.gradient,
        border: '1px solid rgba(200,149,44,0.25)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
      }}
    >
      {/* Collection chip */}
      <span
        className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full"
        style={{
          background: 'rgba(0,0,0,0.4)',
          color: accent.chip,
          border: `1px solid ${accent.chip}55`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent.chip }} />
        {collection !== 'default' ? collection : 'Peptide Buzz'}
      </span>

      {/* Image area — falls back to a graphical treatment when image_url isn't set yet */}
      <div className="relative h-52 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }}
        />
        {p.image_url && isImageRenderable(p.image_url) ? (
          <Image
            src={p.image_url}
            alt={p.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-6"
          />
        ) : (
          <div className="relative text-center px-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: accent.chip }}>
              Peptide Buzz™
            </p>
            <p className="text-2xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {collection !== 'default' ? collection : p.name}
            </p>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-5">
        <h3 className="text-base font-bold text-white leading-snug mb-1.5 group-hover:text-[var(--gold)] transition-colors">
          {p.name}
        </h3>
        {(amount || form) && (
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {[form, amount].filter(Boolean).join(' · ')}
          </p>
        )}
        {p.description && (
          <p className="text-xs leading-relaxed mb-4 line-clamp-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {p.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Clinic bulk · per unit
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold" style={{ color: accent.chip }}>
                {formatCents(p.price_cents)}
              </span>
              {upsellCents && (
                <span className="text-xs line-through" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {formatCents(upsellCents)}
                </span>
              )}
            </div>
          </div>
          <span
            className="text-xs font-semibold inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            View
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function PeptideBuzzCollection() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, description, price_cents, image_url, metadata')
    .eq('is_active', true)
    .filter('metadata->>brand', 'eq', 'peptidebuzz')
    .order('sort_order', { ascending: true })
    .limit(8);

  const products = (data ?? []) as BuzzProduct[];
  if (products.length === 0) return null;

  return (
    <section className="py-20" style={{ background: '#0a1628', borderTop: '1px solid rgba(200,149,44,0.15)' }}>
      <div className="container-xl">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] mb-4 px-3 py-1.5 rounded-full"
              style={{
                color: 'var(--gold)',
                background: 'rgba(200,149,44,0.12)',
                border: '1px solid rgba(200,149,44,0.35)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--gold)' }} />
              Peptide Buzz™ · OTC Line
            </p>
            <h2
              className="text-white leading-tight mb-3"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)' }}
            >
              Bulk OTC Wellness, Built for Your Clinic
            </h2>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Patient-friendly oral pouches and topical peptides — formulated and tested under the same Peptide Pure
              standards. Stock your retail shelf, offer patient takeaway, or bundle into protocol packages with
              clinic-bulk pricing.
            </p>
          </div>
          <Link
            href="/peptides?shop=buzz"
            className="self-start lg:self-end inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'var(--gold)', color: 'var(--navy)' }}
          >
            View all Peptide Buzz
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6 21 12m0 0-7.5 6M21 12H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.slice(0, 4).map((p) => (
            <Card key={p.id} p={p} />
          ))}
        </div>

        {products.length > 4 && (
          <p className="mt-6 text-center text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            +{products.length - 4} more Peptide Buzz product{products.length - 4 === 1 ? '' : 's'} in the full catalog
          </p>
        )}
      </div>
    </section>
  );
}
