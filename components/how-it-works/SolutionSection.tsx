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

export default function SolutionSection({ content }: { content: any }) {
  return (
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

        {/* 3 feature columns */}
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

        {/* Market stats — full width */}
        <div>
          <span className="section-label block mb-8">{content.relevanceStats.sectionLabel}</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
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
          </div>
          <div style={{ borderTop: '1px solid rgba(11,31,58,0.1)' }} />
        </div>
      </div>
    </section>
  );
}
