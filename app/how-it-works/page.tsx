import type { Metadata } from 'next';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'How It Works — PeptidePure™',
  description: 'Learn how PeptidePure™ works for clinicians: verify credentials, browse peptide protocols, and order with confidence. Simple 3-step process.',
};
import PageHero from '@/components/sections/PageHero';

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

export default async function HowItWorksPage() {
  const content = await getContent<any>('how-it-works');

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
          <div className="mb-14">
            <span className="section-label block mb-3">Why Clinicians Choose Us</span>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight" style={{ color: 'var(--navy)' }}>
              The Solution{' '}
              <span style={{ color: 'var(--gold)' }}>Providers Need</span>
            </h2>
          </div>

          {/* ── 3 feature columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {content.solutionFeatures.map((item: { title: string; desc: string }, i: number) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-7 shadow-sm"
                style={{ border: '1px solid rgba(200,149,44,0.18)', borderTop: '3px solid var(--gold)' }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: 'rgba(200,149,44,0.08)',
                    border: '1.5px solid rgba(200,149,44,0.28)',
                    color: 'var(--gold)',
                  }}
                >
                  {solutionIcons[i]}
                </div>
                <h3 className="font-bold text-base mb-2.5" style={{ color: 'var(--navy)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* ── Pricing table (left) + Market stats (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* Pricing card */}
            <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: 'var(--navy)' }}>
              {/* Card header bar */}
              <div
                className="px-6 py-4 flex items-center gap-3"
                style={{ background: 'rgba(200,149,44,0.12)', borderBottom: '1px solid rgba(200,149,44,0.18)' }}
              >
                <div style={{ width: '0.3rem', height: '1.2rem', borderRadius: '9999px', background: 'var(--gold)', flexShrink: 0 }} />
                <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--gold)' }}>
                  {content.pricing.label}
                </span>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>{content.pricing.columns.protocol}</th>
                    <th className="px-3 py-3.5 text-xs font-bold" style={{ color: 'var(--gold)' }}>{content.pricing.columns.pp}</th>
                    <th className="px-3 py-3.5 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>{content.pricing.columns.gray}</th>
                    <th className="px-3 py-3.5 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>{content.pricing.columns.retail}</th>
                  </tr>
                </thead>
                <tbody>
                  {content.pricing.rows.map((row: { protocol: string; pp: string; gray: string; retail: string }, i: number) => (
                    <tr
                      key={i}
                      style={{
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        background: i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent',
                      }}
                    >
                      <td className="px-5 py-3.5 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{row.protocol}</td>
                      <td className="px-3 py-3.5 text-xs text-center font-bold" style={{ color: 'var(--gold)' }}>{row.pp}</td>
                      <td className="px-3 py-3.5 text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>{row.gray}</td>
                      <td className="px-3 py-3.5 text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>{row.retail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Market stats */}
            <div>
              <span className="section-label block mb-8">{content.relevanceStats.sectionLabel}</span>
              <div>
                {content.relevanceStats.items.map((item: { stat: string; label: string; desc: string }, i: number) => (
                  <div
                    key={i}
                    className="flex gap-5 items-start py-6"
                    style={{ borderTop: '1px solid rgba(11,31,58,0.1)' }}
                  >
                    <div className="shrink-0" style={{ minWidth: '6rem' }}>
                      <div
                        className="font-black leading-none"
                        style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)', color: 'var(--navy)', letterSpacing: '-0.03em' }}
                      >
                        {item.stat}
                      </div>
                      <div className="text-xs font-semibold mt-1 uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
                        {item.label}
                      </div>
                    </div>
                    {/* Vertical divider */}
                    <div
                      className="shrink-0 self-stretch"
                      style={{ width: '1px', background: 'rgba(200,149,44,0.35)', borderRadius: '9999px' }}
                    />
                    <p className="text-sm leading-relaxed pt-0.5" style={{ color: 'var(--text-mid)' }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(11,31,58,0.1)' }} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Review. Register. Implement. */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'var(--off-white)' }}>
        <style>{`
          .how-step { position: relative; background: #ffffff; transition: background 0.4s ease; overflow: hidden; }
          .how-step::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--gold) 0%, rgba(200,149,44,0.3) 60%, transparent 100%); transform: scaleX(0); transform-origin: left; transition: transform 0.5s cubic-bezier(0.4,0,0.2,1); }
          .how-step:hover::before { transform: scaleX(1); }
          .how-step:hover { background: var(--gold-pale); }
          .how-step:hover .how-step-icon { border-color: rgba(200,149,44,0.55) !important; background: rgba(200,149,44,0.08) !important; }
          .how-step:hover .how-step-desc { color: var(--text-mid) !important; }
          .how-step:hover .how-step-ghost { color: rgba(200,149,44,0.07) !important; }
        `}</style>

        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--navy)' }}>
              {content.steps.heading}
            </h2>
            <p className="text-sm mt-3" style={{ color: 'var(--text-light)' }}>
              {content.steps.subtitle}
            </p>
            </div>

            {/* Steps grid — 1px gap acts as hairline dividers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1px',
              background: 'rgba(11,31,58,0.1)',
              border: '1px solid rgba(11,31,58,0.1)',
              borderRadius: '1rem',
              overflow: 'hidden',
            }}>
              {content.steps.items.map((item: { step: string; icon: string; title: string; desc: string }, i: number) => (
                <div key={i} className="how-step" style={{ padding: '3rem 2.75rem 2.75rem' }}>

                  {/* Step number + trailing line */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                    color: 'var(--gold)', marginBottom: '2rem',
                  }}>
                    Step {String(i + 1).padStart(2, '0')}
                    <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(200,149,44,0.3), transparent)' }} />
                  </div>

                  {/* Icon box */}
                  <div
                    className="how-step-icon"
                    style={{
                      width: '52px', height: '52px',
                      border: '1px solid rgba(200,149,44,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '2.25rem',
                      transition: 'border-color 0.3s, background 0.3s',
                    }}
                  >
                    {i === 0 && (
                      <svg viewBox="0 0 24 24" style={{ width: '24px', stroke: 'var(--gold)', fill: 'none', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                    {i === 1 && (
                      <svg viewBox="0 0 24 24" style={{ width: '24px', stroke: 'var(--gold)', fill: 'none', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                        <path d="M9 12l2 2 4-4" /><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      </svg>
                    )}
                    {i === 2 && (
                      <svg viewBox="0 0 24 24" style={{ width: '24px', stroke: 'var(--gold)', fill: 'none', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                      </svg>
                    )}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '1.65rem', fontWeight: 600,
                    color: 'var(--navy)', marginBottom: '1.25rem', lineHeight: 1.2,
                  }}>
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="how-step-desc"
                    style={{ fontSize: '0.875rem', lineHeight: 1.75, color: 'var(--text-light)', transition: 'color 0.3s' }}
                  >
                    {item.desc}
                  </p>

                  {/* Ghost number */}
                  <div
                    className="how-step-ghost"
                    style={{
                      position: 'absolute', bottom: '1.25rem', right: '1.75rem',
                      fontSize: '6rem', fontWeight: 300,
                      color: 'rgba(11,31,58,0.04)', lineHeight: 1,
                      pointerEvents: 'none', userSelect: 'none',
                      transition: 'color 0.3s',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Connector dots (between cards only) */}
                  {i < content.steps.items.length - 1 && (
                    <div style={{ position: 'absolute', top: '50%', right: '-1px', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 2, pointerEvents: 'none' }}>
                      {[0, 1, 2].map(d => (
                        <span key={d} style={{ display: 'block', width: '3px', height: '3px', background: 'var(--gold)', borderRadius: '50%', opacity: 0.5 }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
      </section>

      {/* Why Peptides are the Future of Medicine 3.0 */}
      <section className="relative overflow-hidden">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/images/pepti.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(248,240,225,0.88)' }}
        />

        <div className="relative container-xl py-20 md:py-28">
          {/* Heading */}
          <div className="text-center mb-14 md:mb-16">
            <span className="section-label">The Science</span>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-black mt-3 leading-tight max-w-3xl mx-auto"
              style={{ color: 'var(--navy)', letterSpacing: '-0.02em' }}
            >
              Why Peptides are the Future of<br />
              <span style={{ color: 'var(--gold)' }}>Medicine 3.0</span>
            </h2>
            <p
              className="mt-4 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: 'var(--text-mid)' }}
            >
              Peptides act as precise biological messengers — signaling specific cellular pathways
              without the systemic side effects of traditional therapies.
            </p>
          </div>

          {/* 2×2 Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: 'Hormonal Regulation',
                desc: 'Peptides precisely modulate endocrine pathways, supporting natural hormone balance without disrupting the entire system.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.71.71m14.14 14.14.71.71M3 12H4m16 0h1M4.22 19.78l.71-.71M19.07 4.93l.71-.71" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                ),
              },
              {
                title: 'Neurotransmission',
                desc: 'Neuropeptides optimize synaptic signaling, influencing mood, cognition, and neurological resilience at the cellular level.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
              },
              {
                title: 'Immune Defense',
                desc: 'Immunomodulatory peptides calibrate the innate and adaptive immune responses, reducing chronic inflammation at its source.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
              {
                title: 'Cellular Signaling',
                desc: 'Growth factor peptides activate regenerative cascades — stimulating tissue repair, collagen synthesis, and mitochondrial efficiency.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
                    <ellipse cx="12" cy="12" rx="8" ry="3" />
                    <ellipse cx="12" cy="12" rx="8" ry="3" transform="rotate(60 12 12)" />
                    <ellipse cx="12" cy="12" rx="8" ry="3" transform="rotate(120 12 12)" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-5 p-6 rounded-2xl transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.72)',
                  border: '1px solid rgba(200,149,44,0.18)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: 'rgba(200,149,44,0.12)',
                    border: '1px solid rgba(200,149,44,0.22)',
                    color: 'var(--gold)',
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--gold)' }}>
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
