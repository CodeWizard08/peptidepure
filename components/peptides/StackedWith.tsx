/**
 * StackedWith
 *
 * Server component. Fetches peptides referenced by metadata.synergistic_with
 * and displays them as "Frequently stacked with" cards.
 *
 * Data shape: metadata.synergistic_with = [{ slug: string, reason?: string }]
 *   or simply [string, string, ...] (we accept both for forward compatibility)
 */

import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { formatCents } from '@/lib/format';
import { getBaseProductName } from '@/lib/peptideConfig';

type SynergyItem = { slug: string; reason?: string };

type StackProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  category: string;
  price_cents: number;
  metadata: Record<string, unknown> | null;
};

export default async function StackedWith({
  baseName,
  synergisticWith,
}: {
  baseName: string;
  synergisticWith: unknown;
}) {
  // Normalize input shape: accept either ["slug", "slug"] or [{slug, reason}, ...]
  const items: SynergyItem[] = Array.isArray(synergisticWith)
    ? synergisticWith
        .map((it) => {
          if (typeof it === 'string') return { slug: it };
          if (it && typeof it === 'object' && 'slug' in it) {
            return { slug: String((it as { slug: string }).slug), reason: (it as { reason?: string }).reason };
          }
          return null;
        })
        .filter((x): x is SynergyItem => x !== null)
    : [];

  if (items.length === 0) return null;

  const supabase = await createClient();
  const slugs = items.map((i) => i.slug);

  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, description, image_url, category, price_cents, metadata')
    .in('slug', slugs)
    .eq('is_active', true);

  if (!products || products.length === 0) return null;

  // Preserve the order from synergistic_with array
  const ordered = items
    .map((item) => products.find((p) => p.slug === item.slug))
    .filter((p): p is StackProduct => p !== undefined);

  if (ordered.length === 0) return null;

  return (
    <section style={{ background: 'var(--off-white)' }}>
      <div className="container-xl py-14">
        {/* Header */}
        <div className="mb-8">
          <p
            className="text-xs font-bold uppercase tracking-[0.18em] mb-2"
            style={{ color: 'var(--gold)' }}
          >
            Clinical Synergy
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--navy)' }}>
            Frequently stacked with {baseName}
          </h2>
          <p className="text-base max-w-xl" style={{ color: 'var(--text-mid)' }}>
            Peptides commonly combined with {baseName} for synergistic clinical outcomes.
          </p>
        </div>

        {/* Stack cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ordered.map((product, i) => {
            const stackBaseName = getBaseProductName(product.name);
            const reason = items[i]?.reason;
            const meta = (product.metadata ?? {}) as Record<string, unknown>;
            const strength = meta.strength as string | undefined;

            return (
              <Link
                key={product.id}
                href={`/peptides/${product.slug}`}
                className="group flex gap-4 p-4 rounded-2xl bg-white transition-all hover:shadow-md"
                style={{ border: '1px solid var(--border)' }}
              >
                {/* Image */}
                <div
                  className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden"
                  style={{ background: 'linear-gradient(145deg, #0B1F3A 0%, #1a3a6b 100%)' }}
                >
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={stackBaseName}
                      fill
                      sizes="96px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-xs font-bold">
                      {strength}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3
                      className="text-base font-bold leading-snug mb-1 group-hover:underline"
                      style={{ color: 'var(--navy)' }}
                    >
                      {stackBaseName}
                    </h3>
                    {reason ? (
                      <p
                        className="text-sm leading-relaxed line-clamp-2"
                        style={{ color: 'var(--text-mid)' }}
                      >
                        {reason}
                      </p>
                    ) : (
                      product.description && (
                        <p
                          className="text-sm leading-relaxed line-clamp-2"
                          style={{ color: 'var(--text-mid)' }}
                        >
                          {product.description}
                        </p>
                      )
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-base font-bold" style={{ color: 'var(--gold)' }}>
                      {formatCents(product.price_cents)}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="transition-transform group-hover:translate-x-1"
                      style={{ color: 'var(--navy)' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
