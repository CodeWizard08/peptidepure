import Image from 'next/image';
import { getContent } from '@/lib/content';
import PageHero from '@/components/sections/PageHero';
import CTASection from '@/components/sections/CTASection';

export default function OurCompanyPage() {
  const content = getContent<any>('our-company');

  return (
    <>
      <PageHero
        sectionLabel={content.hero.sectionLabel}
        heading={content.hero.heading}
        subtitle={content.hero.subtitle}
      />

      {/* The Structure */}
      <section className="py-24">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            {/* Left */}
            <div>
              <span className="section-label">{content.structure.sectionLabel}</span>
              <h2 className="text-3xl font-bold mt-2 mb-6" style={{ color: 'var(--navy)' }}>
                {content.structure.heading}
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-mid)' }}>
                {content.structure.description}
              </p>

              {/* Research Entity */}
              <div className="rounded-2xl p-6 mb-5" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-8 rounded-full" style={{ background: 'var(--gold)' }}></div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--navy)' }}>{content.structure.researchEntity.title}</h3>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-mid)' }}>
                  {content.structure.researchEntity.description}
                </p>
                <ul className="space-y-2">
                  {content.structure.researchEntity.items.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: 'var(--text-mid)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Peptide Pure LLC */}
              <div className="rounded-2xl p-6" style={{ background: 'var(--navy)', border: '1px solid rgba(200,149,44,0.2)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-8 rounded-full" style={{ background: 'var(--gold)' }}></div>
                  <h3 className="font-bold text-lg text-white">{content.structure.peptidePure.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-300 mb-4">
                  {content.structure.peptidePure.description}
                </p>
                <ul className="space-y-2">
                  {content.structure.peptidePure.items.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right */}
            <div className="space-y-8">
              {/* Image */}
              <div className="rounded-2xl overflow-hidden shadow-2xl w-full relative" style={{ height: '460px' }}>
                <Image
                  src="/images/peptide-pure-1.webp"
                  alt="PeptidePure™ clinical research facility"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 580px"
                />
                <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                  <svg width="20" height="24" viewBox="0 0 32 36" fill="none">
                    <path d="M16 1L30 9V27L16 35L2 27V9L16 1Z" stroke="#C8952C" strokeWidth="2" fill="none" />
                    <text x="11" y="21" fill="#C8952C" fontSize="11" fontWeight="bold" fontFamily="system-ui">P</text>
                  </svg>
                  <span className="text-white text-sm font-bold">PEPTIDE PURE™</span>
                </div>
              </div>

              {/* Clinical Context */}
              <div className="rounded-2xl p-8" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--navy)' }}>{content.clinicalContext.heading}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-mid)' }}>
                  {content.clinicalContext.intro}
                </p>
                <div className="space-y-3 mb-6">
                  {content.clinicalContext.problems.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'white', border: '1px solid var(--border)' }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#DC2626' }}>✗</span>
                      <span className="text-sm" style={{ color: 'var(--text-mid)' }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 rounded-xl mb-4" style={{ background: 'rgba(200,149,44,0.1)', border: '1px solid rgba(200,149,44,0.3)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>
                    {content.clinicalContext.solution}
                  </p>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                  {content.clinicalContext.conclusion}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-20" style={{ background: 'var(--navy)' }}>
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="section-label text-yellow-300">{content.principles.sectionLabel}</span>
            <h2 className="text-3xl font-bold text-white mt-2">{content.principles.heading}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {content.principles.items.map((item: { icon: string; title: string; desc: string }, i: number) => (
              <div
                key={i}
                className="p-6 rounded-2xl text-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,149,44,0.2)' }}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        heading={content.cta.heading}
        subtitle={content.cta.subtitle}
        primaryCta={{ label: content.cta.primaryCtaLabel, href: content.cta.primaryCtaHref }}
        secondaryCta={{ label: content.cta.secondaryCtaLabel, href: content.cta.secondaryCtaHref }}
      />
    </>
  );
}
