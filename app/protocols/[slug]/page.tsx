import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createClient } from '@/lib/supabase/server';
import PageHero from '@/components/sections/PageHero';

type ProtocolRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  summary: string | null;
  body_md: string;
  peptides: string[];
  image_url: string | null;
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('protocols')
    .select('title, summary')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!data) return { title: 'Protocol not found' };
  return {
    title: `${data.title} | Peptide Pure Protocol`,
    description: data.summary ?? `${data.title} — clinical peptide protocol curated by Peptide Pure.`,
    alternates: { canonical: `/protocols/${slug}` },
  };
}

export default async function ProtocolDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('protocols')
    .select('id, slug, title, category, summary, body_md, peptides, image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single<ProtocolRow>();

  if (!data) notFound();

  return (
    <>
      <PageHero
        sectionLabel={data.category ?? 'Clinical Protocol'}
        heading={data.title}
        subtitle={data.summary ?? undefined}
      />

      <section className="py-16">
        <div className="container-xl max-w-3xl">
          {/* Peptide chips */}
          {data.peptides.length > 0 && (
            <div className="mb-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: 'var(--gold)' }}>
                Peptides in this protocol
              </p>
              <div className="flex flex-wrap gap-2">
                {data.peptides.map((p) => (
                  <span
                    key={p}
                    className="text-sm font-semibold px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)' }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hero image */}
          {safeImage(data.image_url) && (
            <div className="relative w-full mb-10 rounded-2xl overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
              <Image
                src={data.image_url!}
                alt={data.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          )}

          {/* Body — admin-curated markdown */}
          {data.body_md.trim().length > 0 ? (
            <div className="prose-product">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.body_md}</ReactMarkdown>
            </div>
          ) : (
            <div
              className="rounded-xl p-6 text-sm leading-relaxed"
              style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-mid)' }}
            >
              The detailed clinical write-up for this protocol is being prepared.
              Reach out to the Peptide Pure team for the working draft.
            </div>
          )}

          <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
            <Link
              href="/protocols"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:underline"
              style={{ color: 'var(--navy)' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              All protocols
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
