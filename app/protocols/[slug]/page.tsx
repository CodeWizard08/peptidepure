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
  patient_md: string;
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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { slug } = await params;
  const { view } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from('protocols')
    .select('id, slug, title, category, summary, body_md, patient_md, peptides, image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single<ProtocolRow>();

  if (!data) notFound();

  // ?view=patient → patient-facing version; default → clinician version.
  // If patient version is missing, fall back to clinician + show a notice.
  const hasPatient = (data.patient_md ?? '').trim().length > 0;
  const hasClinician = (data.body_md ?? '').trim().length > 0;
  const isPatientView = view === 'patient' && hasPatient;
  const activeBody = isPatientView ? data.patient_md : data.body_md;

  const clinicianHref = `/protocols/${slug}`;
  const patientHref = `/protocols/${slug}?view=patient`;

  return (
    <>
      <PageHero
        sectionLabel={isPatientView ? 'For Patients' : (data.category ?? 'Clinical Protocol')}
        heading={data.title}
        subtitle={data.summary ?? undefined}
      />

      <section className="py-16">
        <div className="container-xl max-w-3xl">
          {/* Audience switcher — only shown when both versions exist */}
          {hasPatient && hasClinician && (
            <div
              className="mb-8 inline-flex p-1 rounded-xl"
              style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}
            >
              <Link
                href={clinicianHref}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: isPatientView ? 'transparent' : 'white',
                  color: isPatientView ? 'var(--text-mid)' : 'var(--navy)',
                  boxShadow: isPatientView ? 'none' : '0 1px 3px rgba(11,31,58,0.08)',
                }}
              >
                For Clinicians
              </Link>
              <Link
                href={patientHref}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: isPatientView ? 'white' : 'transparent',
                  color: isPatientView ? 'var(--navy)' : 'var(--text-mid)',
                  boxShadow: isPatientView ? '0 1px 3px rgba(11,31,58,0.08)' : 'none',
                }}
              >
                For Patients
              </Link>
            </div>
          )}

          {/* Patient-share banner — only on clinician view, when patient_md exists */}
          {!isPatientView && hasPatient && (
            <div
              className="mb-8 flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-xl"
              style={{ background: 'var(--gold-pale)', border: '1px solid rgba(200,149,44,0.35)' }}
            >
              <div className="flex items-center gap-3">
                <svg width="18" height="18" fill="none" stroke="var(--gold)" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4m0 0l-4 4m4-4v12" />
                </svg>
                <p className="text-sm" style={{ color: 'var(--navy)' }}>
                  <strong>Patient version available.</strong> Share <code className="font-mono text-xs">?view=patient</code> with patients for the plain-language handout.
                </p>
              </div>
              <Link
                href={patientHref}
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: 'var(--gold)', color: 'var(--navy)' }}
              >
                Preview patient view →
              </Link>
            </div>
          )}

          {/* Peptide chips — hidden on patient view (technical) */}
          {!isPatientView && data.peptides.length > 0 && (
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

          {/* Body */}
          {activeBody.trim().length > 0 ? (
            <div className="prose-product">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeBody}</ReactMarkdown>
            </div>
          ) : (
            <div
              className="rounded-xl p-6 text-sm leading-relaxed"
              style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-mid)' }}
            >
              {isPatientView
                ? 'A patient-friendly version of this protocol is being prepared. Ask your clinician for details.'
                : 'The detailed clinical write-up for this protocol is being prepared.'}
            </div>
          )}

          {/* Patient-view footer — Print button + return-to-clinician */}
          {isPatientView && (
            <div className="mt-12 pt-8 flex flex-wrap items-center justify-between gap-4" style={{ borderTop: '1px solid var(--border)' }}>
              <Link
                href={clinicianHref}
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:underline"
                style={{ color: 'var(--navy)' }}
              >
                ← Clinician version
              </Link>
              <PrintButton />
            </div>
          )}

          {!isPatientView && (
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
          )}
        </div>
      </section>
    </>
  );
}

// Client-side print button — separate component so the page stays a server
// component. Importing the inline component file is overkill; inline this.
function PrintButton() {
  return (
    <form action="javascript:void(window.print())" className="inline">
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        style={{ background: 'var(--gold)', color: 'var(--navy)' }}
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print / Save as PDF
      </button>
    </form>
  );
}
