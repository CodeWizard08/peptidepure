import PageHero from '@/components/sections/PageHero';
import type { PeptideDosingContent as PeptideDosingPageContent } from '@/lib/content-types';

const CATEGORY_COLORS: Record<string, string> = {
  'Metabolic Optimization': '#C8952C',
  'Appetite & Glycemic Support': '#C8952C',
  'Metabolic Support': '#C8952C',
  'Tissue Recovery': '#2563EB',
  'Endocrine Signaling': '#7C3AED',
  'Longevity & Mitochondrial': '#059669',
  'Regenerative & Longevity': '#059669',
  'Immune & Inflammatory': '#DC2626',
  'Immune & Antimicrobial': '#DC2626',
  'Immune & Tissue Repair': '#DC2626',
  'Cognitive & Mood': '#0891B2',
};

type PeptideCard = PeptideDosingPageContent['peptides'][number];

export default function PeptideDosingContent({ content }: { content: PeptideDosingPageContent }) {
  const { hero, overview, safetyPrinciples, reconstitutionSteps, conversionRule, peptides, disclaimer } = content;

  return (
    <>
      <PageHero sectionLabel={hero.sectionLabel} heading={hero.heading} subtitle={hero.subtitle} />

      <section className="py-14" style={{ background: 'var(--surface)' }}>
        <div className="container-xl">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>{overview.heading}</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-mid)' }}>{overview.body}</p>
          </div>
        </div>
      </section>

      <section className="py-14" style={{ background: 'var(--off-white)' }}>
        <div className="container-xl">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FEF2F2' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>{safetyPrinciples.heading}</h2>
            </div>
            <div className="grid gap-4">
              {safetyPrinciples.items.map((item: string, i: number) => (
                <div key={i} className="flex gap-4 p-5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626' }}>{i + 1}</span>
                  <p className="leading-relaxed" style={{ color: 'var(--text-mid)' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: 'var(--navy)' }}>
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="section-label text-yellow-300">{reconstitutionSteps.heading}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {reconstitutionSteps.steps.map((step: { num: string; title: string; desc: string }) => (
              <div key={step.num} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-4xl font-bold mb-3" style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', opacity: 0.6 }}>{step.num}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14" style={{ background: 'var(--gold-pale)' }}>
        <div className="container-xl">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>{conversionRule.heading}</h2>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--text-mid)' }}>{conversionRule.body}</p>
            <div className="inline-block px-8 py-4 rounded-2xl font-mono text-lg font-semibold" style={{ background: 'white', color: 'var(--navy)', border: '2px solid var(--gold)', boxShadow: 'var(--shadow-gold)' }}>
              {conversionRule.formula}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: 'var(--surface)' }}>
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="section-label" style={{ color: 'var(--gold)' }}>Reference Protocols</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: 'var(--text-dark)' }}>Peptide Dosing Reference</h2>
            <p className="mt-3 max-w-xl mx-auto" style={{ color: 'var(--text-mid)' }}>Example reconstitution and dosing parameters. Always confirm with your clinical protocol.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {peptides.map((peptide: PeptideCard) => {
              const color = peptide.categoryColor ?? CATEGORY_COLORS[peptide.category] ?? '#6B7280';
              return (
                <div key={peptide.name} className="rounded-2xl overflow-hidden flex flex-col" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="px-5 py-4" style={{ background: color, borderBottom: `3px solid ${color}` }}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-white leading-tight">{peptide.name}</h3>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{peptide.category}</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl" style={{ background: 'var(--off-white)' }}>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-light)' }}>Vial Size</div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-dark)' }}>{peptide.vial}</div>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: 'var(--off-white)' }}>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-light)' }}>Concentration</div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-dark)' }}>{peptide.concentration}</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'var(--off-white)' }}>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-light)' }}>Diluent</div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-dark)' }}>{peptide.diluent}</div>
                    </div>
                    <div className="p-3 rounded-xl flex items-center justify-between" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color }}>Starting Dose</div>
                        <div className="font-bold" style={{ color: 'var(--text-dark)' }}>{peptide.startingDose}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color }}>Units (U-100)</div>
                        <div className="font-bold" style={{ color: 'var(--text-dark)' }}>{peptide.startingUnits}</div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{peptide.notes}</p>
                    <div className="mt-auto pt-3 flex items-center gap-2 text-xs" style={{ color: 'var(--text-light)', borderTop: '1px solid var(--border)' }}>
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM12 12h.01" />
                      </svg>
                      {peptide.storage}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14" style={{ background: 'var(--navy)' }}>
        <div className="container-xl">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(200,149,44,0.15)' }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#C8952C" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{disclaimer.heading}</h2>
            <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{disclaimer.body}</p>
          </div>
        </div>
      </section>
    </>
  );
}
