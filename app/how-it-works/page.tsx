import Link from 'next/link';

const pricingData = [
  { protocol: 'BPC-157 10 mg', pp: '$44', gray: '$50 – $65', retail: '$150 – $225' },
  { protocol: 'BPC-157 10mg / TB500 10mg', pp: '$88', gray: '$200', retail: '$300' },
  { protocol: 'Retatrutide 30 mg (~3 month supply)', pp: '$196', gray: '$450 – $550', retail: '$900 – $1,200' },
  { protocol: 'Tirzepatide 30 mg (~1 month supply)', pp: '$180', gray: '$250 – $375', retail: '$600 – $1,000' },
  { protocol: 'CJC-1295 5mg / Ipamorelin 5mg', pp: '$75', gray: '$95 – $150', retail: '$350' },
];

const solutionFeatures = [
  {
    title: '3RD Party COAs',
    desc: 'Multi-lab verification on every lot (≥99% purity, sterility). Labeling with your logo and "Clinician Use Only". Never the red-flag "Not for Human or Animal Use".',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H8.875m5.925 0a3 3 0 01-5.8 0" />
      </svg>
    ),
  },
  {
    title: '> 99% Purity',
    desc: 'Sourcing from ISO 9001-certified, cGMP-compliant manufacturers with DMF- or CEP-backed API, or FDA-registered 503A/503B and research grade facilities.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
      </svg>
    ),
  },
  {
    title: 'Fast Shipping',
    desc: 'U.S.A.-based fulfillment with secure packaging and tracking. Designed to meet the operational needs of busy clinical practices.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
  },
];

const relevanceStats = [
  {
    stat: '7,000+',
    label: 'Natural Peptides',
    desc: 'Identified in biological systems, each with unique functions and potential therapeutic applications.',
  },
  {
    stat: '60+',
    label: 'FDA-Approved',
    desc: 'Peptide-based medications currently available, with hundreds more in clinical trials.',
  },
  {
    stat: '$150B',
    label: 'Market Value',
    desc: 'Projected global peptide therapeutics market by 2028, growing at over 8% annually.',
  },
  {
    stat: '10–100×',
    label: 'Targeting Precision',
    desc: 'Unprecedented specificity vs. conventional pharmaceuticals, with fewer systemic side effects.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20" style={{ background: 'var(--navy)' }}>
        <div className="container-xl text-center">
          <span className="section-label text-yellow-300">The Platform</span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4">
            How PeptidePure™ Works
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            A smarter, cleaner path to peptide medicine — without the risks, uncertainty, or gray market.
          </p>
        </div>
      </section>

      {/* Intro + Video */}
      <section className="py-20">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="section-label">The Solution</span>
              <h2 className="text-3xl font-bold mt-2 mb-6" style={{ color: 'var(--navy)' }}>
                PeptidePure™ Gives Licensed Clinicians a Smarter Path
              </h2>
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-mid)' }}>
                We provide the most in-demand, best-studied peptides and deliver them in the right milligram strengths with streamlined, clinician-friendly protocols. No confusion. No wasted time. No losing money chasing hype. Just better outcomes for patients and a better system for providers.
              </p>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                Stop chasing the gray market. Lead with precision. Practice medicine the right way.
              </p>
            </div>
            {/* Vimeo embed */}
            <div className="rounded-2xl overflow-hidden shadow-xl aspect-video">
              <iframe
                src="https://player.vimeo.com/video/1153253421?h=8cb1ecdf85&autopause=0&loop=0&title=0&portrait=0&byline=0"
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                allowFullScreen
                title="Dr. Scott Mortensen, MD — Founder Introduction"
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
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--navy)' }}>Educational & Clinical Focus</h3>
              <ul className="space-y-2.5">
                {[
                  'Order with confidence for use within approved observational research frameworks',
                  'Choose from our most-utilized protocol packages (GLP-based programs, GH secretagogues, mitochondrial support)',
                  'Optionally select individual compounds as needed for your clinic (MOOs may apply)',
                  'Reorder on a monthly cadence aligned with protocol design and participant demand',
                  'Access our education library for reconstitution guidance, dosing references, and peer-reviewed literature',
                  'Join our professional community for ongoing updates on emerging compounds and regulatory landscape',
                ].map((item, i) => (
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
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--navy)' }}>Create Account</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                  Create a secure account using your professional credentials. Access is limited to licensed healthcare professionals (MD, DO, PA-C, NP, ND, DC, and qualified researchers). Once registered, your account enters credential review.
                </p>
              </div>
              {/* After Verification */}
              <div className="rounded-2xl p-8" style={{ background: 'var(--navy)' }}>
                <h3 className="text-lg font-bold mb-4 text-white">After Verification</h3>
                <ul className="space-y-2">
                  {[
                    'Purchase peptides',
                    'Participate in observational protocols',
                    'Use compounds for professional education and research consistent with applicable regulations',
                  ].map((item, i) => (
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
            {solutionFeatures.map((item, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{
                    background: 'rgba(200,149,44,0.10)',
                    border: '1.5px solid rgba(200,149,44,0.28)',
                    color: 'var(--gold)',
                  }}
                >
                  {item.icon}
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
                  Real 2026 Market Pricing
                </span>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(200,149,44,0.12)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-300">Popular Peptide Protocols:</th>
                    <th className="px-3 py-3 text-xs font-semibold" style={{ color: 'var(--gold)' }}>Peptide Pure™</th>
                    <th className="px-3 py-3 text-xs font-semibold text-gray-400">Gray Market</th>
                    <th className="px-3 py-3 text-xs font-semibold text-gray-400">Clinic Retail</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingData.map((row, i) => (
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
              <span className="section-label block mb-8">Relevance in Medicine</span>
              <div className="space-y-8">
                {relevanceStats.map((item, i) => (
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
              Review. Register. Implement.
            </h2>
            <p className="text-sm mt-3" style={{ color: 'var(--text-light)' }}>
              A peptide supply platform designed for real clinical growth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Contact Peptide Pure',
                desc: 'Connect with our team to review access options and determine the right fit for your clinical site. Or simply sign up online; we will verify your NPI number.',
                icon: '💬',
              },
              {
                step: '2',
                title: 'Implement With Confidence',
                desc: 'Access reconstitution guidance, dosing references, patient education templates, and informed consent templates — designed to support consistent, defensible clinical workflows.',
                icon: '🔍',
              },
              {
                step: '3',
                title: 'Optimize Ongoing Ordering',
                desc: 'As your clinic and patient volume grow, refine your monthly ordering based on real demand. Once product needs are established, lead times are reduced and reordering becomes streamlined and automatic.',
                icon: '📈',
              },
            ].map((item, i) => (
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

      {/* CTA */}
      <section className="py-16 text-center" style={{ background: 'var(--gold-pale)', borderTop: '1px solid rgba(200,149,44,0.2)' }}>
        <div className="container-xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--navy)' }}>
            Ready to Practice Peptide Medicine the Right Way?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-mid)' }}>
            Join hundreds of licensed clinicians already using PeptidePure™.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/peptides" className="btn-primary px-8">Create Account</Link>
            <Link href="/contact" className="btn-outline px-8">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
