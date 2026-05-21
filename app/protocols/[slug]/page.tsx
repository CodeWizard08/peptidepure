import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createClient } from '@/lib/supabase/server';
import PageHero from '@/components/sections/PageHero';
import ProtocolHero from '@/components/protocols/ProtocolHero';
import {
  QuickStartSidebar,
  OverviewCallouts,
  MolecularSection,
  PharmacokineticsSection,
  ResearchIndications,
  ResearchProtocolsTable,
  PeptideInteractions,
  ReconstitutionSteps,
  QualityIndicatorsSection,
  WhatToExpect,
  SideEffectsTabs,
  ReferencesSection,
  RelatedPeptides,
} from '@/components/protocols/ProtocolSections';
import { normalizeProtocolMeta, type ProtocolMeta } from '@/lib/protocols/types';

type ProtocolRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  summary: string | null;
  body_md: string;
  patient_md: string;
  peptides: string[];
  image_url: string | null;
  tags: string[];
  protocol_meta: ProtocolMeta;
};

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

/**
 * Strip the "## Overview" section from body_md to render alone, then return
 * the rest so we can decide whether to still show it. The new layout uses
 * structured sections for the rest, but for protocols without extracted
 * metadata we still fall back to rendering the full body.
 */
function splitOverview(md: string): { overview: string; remainder: string } {
  if (!md) return { overview: '', remainder: '' };
  const lines = md.split('\n');
  let inOverview = false;
  let overviewDone = false;
  const overviewLines: string[] = [];
  const remainderLines: string[] = [];
  for (const line of lines) {
    if (/^##\s+Overview\s*$/i.test(line)) {
      inOverview = true;
      continue;
    }
    if (inOverview && /^##\s+/.test(line)) {
      inOverview = false;
      overviewDone = true;
    }
    if (inOverview) overviewLines.push(line);
    else if (overviewDone) remainderLines.push(line);
    else remainderLines.push(line);
  }
  return { overview: overviewLines.join('\n').trim(), remainder: remainderLines.join('\n').trim() };
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
    .select('id, slug, title, subtitle, category, summary, body_md, patient_md, peptides, image_url, tags, protocol_meta')
    .eq('slug', slug)
    .eq('status', 'published')
    .single<ProtocolRow>();

  if (!data) notFound();

  const hasPatient = (data.patient_md ?? '').trim().length > 0;
  const hasClinician = (data.body_md ?? '').trim().length > 0;
  const isPatientView = view === 'patient' && hasPatient;

  if (isPatientView) {
    return <PatientView data={data} hasClinician={hasClinician} />;
  }

  return <ClinicianView data={data} hasPatient={hasPatient} />;
}

// ─── Clinician view — full pep-pedia-style layout ────────────────────────────
async function ClinicianView({ data, hasPatient }: { data: ProtocolRow; hasPatient: boolean }) {
  const meta = normalizeProtocolMeta(data.protocol_meta);
  const tags = Array.isArray(data.tags) ? data.tags.filter((t): t is string => typeof t === 'string') : [];
  const { overview, remainder } = splitOverview(data.body_md ?? '');
  const hasStructuredMeta =
    !!meta.indications?.length ||
    !!meta.dosing_table?.length ||
    !!meta.reconstitution?.length ||
    !!meta.what_to_expect?.length ||
    !!meta.side_effects ||
    !!meta.references?.length;

  // Fetch related protocols (same category, different slug)
  const supabase = await createClient();
  const { data: related } = await supabase
    .from('protocols')
    .select('slug, title, category, tags')
    .eq('status', 'published')
    .eq('category', data.category)
    .neq('slug', data.slug)
    .limit(4);

  return (
    <>
      <ProtocolHero
        category={data.category}
        title={data.title}
        subtitle={data.subtitle}
        tags={tags}
        meta={meta}
      />

      {/* Patient-share banner */}
      {hasPatient && (
        <div className="container-xl pt-6">
          <div
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-xl"
            style={{ background: 'var(--gold-pale)', border: '1px solid rgba(200,149,44,0.35)' }}
          >
            <p className="text-sm" style={{ color: 'var(--navy)' }}>
              <strong>Patient version available.</strong> Share <code className="font-mono text-xs">?view=patient</code> with patients for the plain-language handout.
            </p>
            <Link
              href={`/protocols/${data.slug}?view=patient`}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--gold)', color: 'var(--navy)' }}
            >
              Preview patient view →
            </Link>
          </div>
        </div>
      )}

      <section className="py-10 lg:py-14">
        <div className="container-xl grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main column */}
          <main className="lg:col-span-8 min-w-0">
            {(overview || meta.key_benefits || meta.mechanism_short) && (
              <section className="mb-12">
                <h2
                  className="text-2xl font-bold mb-5"
                  style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}
                >
                  Overview
                </h2>
                {overview && (
                  <div className="prose-product">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{overview}</ReactMarkdown>
                  </div>
                )}
                <OverviewCallouts meta={meta} />
              </section>
            )}

            {meta.molecular && <MolecularSection data={meta.molecular} />}
            {meta.pharmacokinetics && <PharmacokineticsSection data={meta.pharmacokinetics} />}
            {meta.indications && <ResearchIndications data={meta.indications} />}
            {meta.dosing_table && (
              <ResearchProtocolsTable rows={meta.dosing_table} timingNote={meta.dosing_timing_note} />
            )}
            {meta.interactions && <PeptideInteractions data={meta.interactions} />}
            {meta.reconstitution && (
              <ReconstitutionSteps steps={meta.reconstitution} warning={meta.reconstitution_warning} />
            )}
            {meta.quality_indicators && <QualityIndicatorsSection items={meta.quality_indicators} />}
            {meta.what_to_expect && <WhatToExpect items={meta.what_to_expect} />}
            {meta.side_effects && <SideEffectsTabs data={meta.side_effects} slug={data.slug} />}
            {meta.references && <ReferencesSection items={meta.references} />}

            {/* Fallback: if no structured metadata exists yet, render the full body_md
                so the page still has substance until extraction has run. */}
            {!hasStructuredMeta && remainder.trim() && (
              <section className="mb-12">
                <div className="prose-product">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{remainder}</ReactMarkdown>
                </div>
              </section>
            )}

            {related && related.length > 0 && (
              <RelatedPeptides items={related as { slug: string; title: string; category: string | null; tags: string[] }[]} />
            )}

            <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
              <Link
                href="/protocols"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: 'var(--navy)' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                All protocols
              </Link>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-5">
              {meta.quick_start && <QuickStartSidebar items={meta.quick_start} />}
              {data.peptides.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(11,31,58,0.05)' }}>
                  <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--navy)' }}>Peptides in This Protocol</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {data.peptides.map((p) => (
                      <span
                        key={p}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)' }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

// ─── Patient view — simpler markdown layout (unchanged behavior) ─────────────
function PatientView({ data, hasClinician }: { data: ProtocolRow; hasClinician: boolean }) {
  const clinicianHref = `/protocols/${data.slug}`;
  return (
    <>
      <PageHero
        sectionLabel="For Patients"
        heading={data.title}
        subtitle={data.summary ?? undefined}
      />
      <section className="py-16">
        <div className="container-xl max-w-3xl">
          {hasClinician && (
            <div
              className="mb-8 inline-flex p-1 rounded-xl"
              style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}
            >
              <Link href={clinicianHref} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: 'transparent', color: 'var(--text-mid)' }}>
                For Clinicians
              </Link>
              <span className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: 'white', color: 'var(--navy)', boxShadow: '0 1px 3px rgba(11,31,58,0.08)' }}>
                For Patients
              </span>
            </div>
          )}

          {(data.patient_md ?? '').trim().length > 0 ? (
            <div className="prose-product">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.patient_md}</ReactMarkdown>
            </div>
          ) : (
            <div
              className="rounded-xl p-6 text-sm leading-relaxed"
              style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-mid)' }}
            >
              A patient-friendly version of this protocol is being prepared. Ask your clinician for details.
            </div>
          )}

          <div className="mt-12 pt-8 flex flex-wrap items-center justify-between gap-4" style={{ borderTop: '1px solid var(--border)' }}>
            <Link
              href={clinicianHref}
              className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
              style={{ color: 'var(--navy)' }}
            >
              ← Clinician version
            </Link>
            <form action="javascript:void(window.print())" className="inline">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--gold)', color: 'var(--navy)' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print / Save as PDF
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
