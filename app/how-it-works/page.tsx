import { getContent } from '@/lib/content';
import PageHero from '@/components/sections/PageHero';
import CTASection from '@/components/sections/CTASection';

/* SVG icons for solutionFeatures — kept inline because JSON can't hold JSX */
const solutionIcons = [
  // 0 — 3RD Party COAs (flask / beaker)
  <svg key={0} className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H8.875m5.925 0a3 3 0 01-5.8 0" />
  </svg>,
  // 1 — > 99% Purity (atom)
  <svg key={1} className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    <ellipse cx="12" cy="12" rx="9" ry="3.5" />
    <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
  </svg>,
  // 2 — Fast Shipping (rocket)
  <svg key={2} className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>,
];

export default function HowItWorksPage() {
  const content = getContent<any>('how-it-works');

  return (
    <>
      <PageHero
        sectionLabel={content.hero.sectionLabel}
        heading={content.hero.heading}
        subtitle={content.hero.subtitle}
      />

      {/* Intro + Video */}
      <section className="py-20">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="section-label">{content.intro.sectionLabel}</span>
              <h2 className="text-3xl font-bold mt-2 mb-6" style={{ color: 'var(--navy)' }}>
                {content.intro.heading}
              </h2>
              {content.intro.paragraphs.map((p: string, i: number) => (
                <p
                  key={i}
                  className={`text-base leading-relaxed${i < content.intro.paragraphs.length - 1 ? ' mb-4' : ''}`}
                  style={{ color: 'var(--text-mid)' }}
                >
                  {p}
                </p>
              ))}
            </div>
            {/* Vimeo embed */}
            <div className="rounded-2xl overflow-hidden shadow-xl aspect-video">
              <iframe
                src={content.intro.videoUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                allowFullScreen
                title={content.intro.videoTitle}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Educational & Clinical Focus + Create Account */}
      <section className="py-16" style={{ background: 'var(--off-white)' }}>
        <div className="container-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Educational */}
            <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--gold-pale)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--navy)' }}>{content.educationalFocus.heading}</h3>
              <ul className="space-y-2.5">
                {content.educationalFocus.items.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm" style={{ color: 'var(--text-mid)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              {/* Create Account */}
              <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--gold-pale)' }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--navy)' }}>{content.createAccount.heading}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                  {content.createAccount.description}
                </p>
              </div>
              {/* After Verification */}
              <div className="rounded-2xl p-8" style={{ background: 'var(--navy)' }}>
                <h3 className="text-lg font-bold mb-4 text-white">{content.afterVerification.heading}</h3>
                <ul className="space-y-2">
                  {content.afterVerification.items.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          THE SOLUTION PROVIDERS NEED
          Features (3-col) + Pricing table + Market stats
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ background: '#F5EFE6' }}>

        {/* Chemical formula watermark */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <span
            className="absolute font-black leading-none"
            style={{ opacity: 0.045, fontSize: '21rem', top: '-2rem', left: '-1.5rem', color: 'var(--navy)' }}
          >C</span>
          <span
            className="absolute font-black leading-none"
            style={{ opacity: 0.035, fontSize: '16rem', top: '3rem', left: '21%', color: 'var(--navy)' }}
          >H</span>
          <span
            className="absolute font-black leading-none"
            style={{ opacity: 0.03, fontSize: '13rem', top: '1rem', right: '24%', color: 'var(--navy)' }}
          >Cl</span>
          <span
            className="absolute font-black leading-none"
            style={{ opacity: 0.035, fontSize: '10rem', top: '6rem', right: '-1rem', color: 'var(--navy)' }}
          >+ H₂O</span>
        </div>

        <div className="container-xl relative">

          {/* Section heading */}
          <h2 className="text-3xl md:text-4xl font-bold mb-14" style={{ color: 'var(--navy)' }}>
            The Solution Providers Need:
          </h2>

          {/* ── 3 feature columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            {content.solutionFeatures.map((item: { title: string; desc: string }, i: number) => (
              <div key={i} className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{
                    background: 'rgba(200,149,44,0.10)',
                    border: '1.5px solid rgba(200,149,44,0.28)',
                    color: 'var(--gold)',
                  }}
                >
                  {solutionIcons[i]}
                </div>
                <h3 className="font-bold text-lg mb-3" style={{ color: 'var(--navy)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* ── Pricing table (left) + Market stats (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* Pricing card */}
            <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: 'var(--navy)' }}>
              <div className="px-6 pt-6 pb-3">
                <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--gold)' }}>
                  {content.pricing.label}
                </span>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(200,149,44,0.12)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-300">{content.pricing.columns.protocol}</th>
                    <th className="px-3 py-3 text-xs font-semibold" style={{ color: 'var(--gold)' }}>{content.pricing.columns.pp}</th>
                    <th className="px-3 py-3 text-xs font-semibold text-gray-400">{content.pricing.columns.gray}</th>
                    <th className="px-3 py-3 text-xs font-semibold text-gray-400">{content.pricing.columns.retail}</th>
                  </tr>
                </thead>
                <tbody>
                  {content.pricing.rows.map((row: { protocol: string; pp: string; gray: string; retail: string }, i: number) => (
                    <tr
                      key={i}
                      style={{
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                      }}
                    >
                      <td className="px-5 py-3.5 text-xs text-gray-300">{row.protocol}</td>
                      <td className="px-3 py-3.5 text-xs text-center font-bold" style={{ color: 'var(--gold)' }}>{row.pp}</td>
                      <td className="px-3 py-3.5 text-xs text-center text-gray-500">{row.gray}</td>
                      <td className="px-3 py-3.5 text-xs text-center text-gray-500">{row.retail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Market stats */}
            <div>
              <span className="section-label block mb-8">{content.relevanceStats.sectionLabel}</span>
              <div className="space-y-8">
                {content.relevanceStats.items.map((item: { stat: string; label: string; desc: string }, i: number) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="shrink-0 min-w-25">
                      <div
                        className="font-black leading-none"
                        style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: 'var(--navy)', letterSpacing: '-0.02em' }}
                      >
                        {item.stat}
                      </div>
                      <div className="text-sm font-semibold mt-1" style={{ color: 'var(--navy)' }}>
                        {item.label}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed pt-1" style={{ color: 'var(--text-mid)' }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Review. Register. Implement. */}
      <section className="py-20">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--navy)' }}>
              {content.steps.heading}
            </h2>
            <p className="text-sm mt-3" style={{ color: 'var(--text-light)' }}>
              {content.steps.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.steps.items.map((item: { step: string; icon: string; title: string; desc: string }, i: number) => (
              <div
                key={i}
                className="p-8 rounded-2xl text-center"
                style={{ background: 'var(--navy)', border: '1px solid rgba(200,149,44,0.2)' }}
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>
                  Step {item.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-300">{item.desc}</p>
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
