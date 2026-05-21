import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import PageHero from '@/components/sections/PageHero';
import SherpaConsole from '@/components/ai-sherpa/SherpaConsole';
import SherpaSignedOut from '@/components/ai-sherpa/SherpaSignedOut';

// The Sherpa console is auth-aware (logged-in clinicians get the live input;
// anon visitors get the sign-in CTA), so this page must be rendered per
// request rather than cached.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Clinical Protocols',
  description:
    'Evidence-aligned peptide protocols for clinical practice — written and curated by the Peptide Pure medical team. Browse by category or stack.',
  alternates: { canonical: '/protocols' },
};

type ProtocolRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  summary: string | null;
  peptides: string[];
  image_url: string | null;
  sort_order: number;
};

const ALLOWED_HOSTS = new Set([
  'dzbvaswimmaxfvambivu.supabase.co',
  'peptidepure.com',
  'www.peptide.buzz',
  'peptide.buzz',
]);

function safeImage(url: string | null): boolean {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  try {
    return ALLOWED_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

export default async function ProtocolsIndex() {
  const supabase = await createClient();
  const [
    { data: { user } },
    { data },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('protocols')
      .select('id, slug, title, category, summary, peptides, image_url, sort_order')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true }),
  ]);

  const protocols = (data ?? []) as ProtocolRow[];

  // Group by category for the "good organization" Scott asked for.
  const byCategory = new Map<string, ProtocolRow[]>();
  for (const p of protocols) {
    const key = p.category ?? 'Other';
    const list = byCategory.get(key) ?? [];
    list.push(p);
    byCategory.set(key, list);
  }
  const categories = Array.from(byCategory.keys());

  return (
    <>
      <PageHero
        sectionLabel="Clinical Library"
        heading="Peptide Protocols"
        subtitle="Evidence-aligned peptide stacks for clinical practice — curated by the Peptide Pure medical team, organized by therapeutic focus."
      />

      {user ? <SherpaConsole /> : <SherpaSignedOut />}

      <section className="py-16">
        <div className="container-xl">
          <div className="flex items-baseline justify-between mb-8 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>
              Browse the Library
            </h2>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-light)' }}>
              {protocols.length} protocol{protocols.length === 1 ? '' : 's'} published
            </span>
          </div>
          {protocols.length === 0 ? (
            <p className="text-center text-sm" style={{ color: 'var(--text-light)' }}>
              Protocols are being curated. Check back soon.
            </p>
          ) : (
            <div className="space-y-14">
              {categories.map((cat) => (
                <div key={cat}>
                  <div className="flex items-baseline justify-between mb-5 gap-4">
                    <h3 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>
                      {cat}
                    </h3>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-light)' }}>
                      {byCategory.get(cat)!.length} protocol{byCategory.get(cat)!.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {byCategory.get(cat)!.map((p) => (
                      <Link
                        key={p.id}
                        href={`/protocols/${p.slug}`}
                        className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                        style={{ background: 'white', border: '1px solid var(--border)', boxShadow: '0 4px 18px rgba(11,31,58,0.06)' }}
                      >
                        <div className="relative h-44" style={{ background: 'linear-gradient(135deg, var(--navy), #11305c)' }}>
                          {safeImage(p.image_url) ? (
                            <Image
                              src={p.image_url!}
                              alt={p.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                              <span
                                className="text-xs font-bold uppercase tracking-[0.18em]"
                                style={{ color: 'var(--gold)' }}
                              >
                                {p.category ?? 'Protocol'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col p-5">
                          <h4 className="text-base font-bold mb-2 group-hover:underline" style={{ color: 'var(--navy)' }}>
                            {p.title}
                          </h4>
                          {p.summary && (
                            <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: 'var(--text-mid)' }}>
                              {p.summary}
                            </p>
                          )}
                          {p.peptides.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-auto">
                              {p.peptides.slice(0, 4).map((pep) => (
                                <span
                                  key={pep}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                  style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)' }}
                                >
                                  {pep}
                                </span>
                              ))}
                              {p.peptides.length > 4 && (
                                <span className="text-[10px] font-semibold px-2 py-0.5" style={{ color: 'var(--text-light)' }}>
                                  +{p.peptides.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--gold)' }}>
                            Read protocol
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
