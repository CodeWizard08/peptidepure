import Link from 'next/link';
import Image from 'next/image';
import HeroSlider from '@/components/HeroSlider';

/* ─── Marquee trust bar items ───────────────────────────── */
const trustItems = [
  { icon: '✦', text: 'U.S.A. cGMP-Compliant Facilities' },
  { icon: '✦', text: 'ISO 9001-Certified' },
  { icon: '✦', text: '>99% Purity — Multi-Lab Verified' },
  { icon: '✦', text: 'FDA-Registered 503A / 503B Partners' },
  { icon: '✦', text: 'Batch-Level COA Traceability' },
  { icon: '✦', text: 'MD-Owned & Operated' },
  { icon: '✦', text: 'Clinician Use Only™' },
  { icon: '✦', text: 'Free Shipping Over $125' },
];

export default function HomePage() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          HERO SLIDER
      ═══════════════════════════════════════════════════════ */}
      <HeroSlider />

      {/* ═══════════════════════════════════════════════════════
          MARQUEE TRUST BAR
      ═══════════════════════════════════════════════════════ */}
      <div
        className="overflow-hidden py-4 border-y"
        style={{ background: 'var(--navy)', borderColor: 'rgba(200,149,44,0.2)' }}
      >
        {/* Double the list so it loops seamlessly */}
        <div className="flex animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
          {[...trustItems, ...trustItems].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2.5 mx-8 text-sm font-medium text-gray-300">
              <span style={{ color: 'var(--gold)', fontSize: '0.6rem' }}>{item.icon}</span>
              {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          STATS — bold dark section
      ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--navy)' }} className="py-20">
        <div className="container-xl">
          <div className="text-center mb-14">
            <span className="section-label text-yellow-300">Market Context</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
              Peptides Are the Future of Medicine 3.0
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {[
              { stat: '7,000+', label: 'Natural Peptides', sub: 'Identified in biological systems' },
              { stat: '60+', label: 'FDA-Approved', sub: 'Peptide-based medications on market' },
              { stat: '$150B', label: 'Global Market by 2028', sub: 'Growing at 8%+ annually' },
              { stat: '10–100×', label: 'Targeting Precision', sub: 'vs. conventional pharmaceuticals' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-10"
                style={{ background: 'var(--navy)' }}
              >
                <div
                  className="text-5xl md:text-6xl font-black mb-2 tabular-nums"
                  style={{ color: 'var(--gold)', letterSpacing: '-0.02em' }}
                >
                  {item.stat}
                </div>
                <div className="text-sm font-bold text-white mb-1">{item.label}</div>
                <div className="text-xs text-gray-500 max-w-[140px]">{item.sub}</div>
              </div>
            ))}
          </div>

          {/* Peptide function cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              { icon: '⚖️', title: 'Hormonal Regulation', desc: 'GLP-1s and growth hormone peptides coordinate metabolism, body composition, and homeostasis.' },
              { icon: '🛡️', title: 'Immune Defense', desc: 'Antimicrobial peptides provide natural defense and coordinate adaptive immune responses.' },
              { icon: '🧠', title: 'Neurotransmission', desc: 'Neuropeptides regulate mood, pain perception, appetite, and cognitive performance.' },
              { icon: '📡', title: 'Cellular Signaling', desc: 'Signaling peptides trigger cascades that allow cells to respond to environmental changes.' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl card-hover"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <h4 className="font-semibold text-white text-sm mb-2">{item.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3-STEP PROCESS
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ background: 'var(--off-white)' }}>
        <div className="container-xl">
          <div className="text-center mb-16">
            <span className="section-label">Getting Started</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: 'var(--navy)' }}>
              Three Steps to Clinical-Grade Peptides
            </h2>
            <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: 'var(--text-light)' }}>
              Designed exclusively for licensed clinicians and qualified research professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Create Account',
                desc: 'Register with your professional NPI number. Access is limited to licensed healthcare professionals — MD, DO, PA-C, NP, ND, DC, and qualified researchers.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                cta: { label: 'Create Account', href: '/peptides' },
              },
              {
                step: '02',
                title: 'Enroll in Clinical Study Framework',
                desc: 'Join our observational research framework under Mortensen Medical 501(c)(3) — giving your clinic legal, study-aligned access to protocols under 45 CFR 46.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                cta: { label: 'How It Works', href: '/how-it-works' },
              },
              {
                step: '03',
                title: 'Pick Your Protocol Package',
                desc: 'Select from curated starter bundles or individual compounds. Reorder monthly — aligned with your protocol cadence and participant demand.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
                cta: { label: 'Browse Peptides', href: '/peptides' },
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 flex flex-col card-hover"
                style={{ border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                {/* Step number */}
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1.5px solid rgba(200,149,44,0.3)' }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className="text-5xl font-black leading-none"
                    style={{ color: 'rgba(200,149,44,0.12)', letterSpacing: '-0.04em' }}
                  >
                    {item.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--navy)' }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: 'var(--text-mid)' }}>
                  {item.desc}
                </p>
                <Link
                  href={item.cta.href}
                  className="text-sm font-semibold flex items-center gap-1.5 transition-colors"
                  style={{ color: 'var(--gold)' }}
                >
                  {item.cta.label}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          USA PEPTIDE RESEARCH
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Text side */}
            <div>
              <span className="section-label">Our Approach</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-2" style={{ color: 'var(--navy)' }}>
                USA Peptide Research
              </h2>
              <p className="text-lg font-semibold mb-5" style={{ color: 'var(--gold)' }}>
                Simple dosing. Proven protocols.
              </p>
              <p className="text-base mb-7 leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                The most in-demand, best-studied peptides — delivered in the right milligram strengths with
                streamlined, clinician-friendly protocols. No confusion. No wasted time. No losing money
                chasing hype. Just better outcomes for patients and a better system for providers.
              </p>

              <ul className="space-y-3.5 mb-8">
                {[
                  'Protocol packages: GLP-based programs, GH secretagogues, mitochondrial support',
                  'Individual compounds available as needed for your clinic',
                  'Education library: reconstitution guides, dosing references, peer-reviewed literature',
                  'Professional community with regulatory updates and emerging compound coverage',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'var(--gold-pale)', border: '1px solid rgba(200,149,44,0.35)' }}
                    >
                      <svg className="w-3 h-3" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/how-it-works" className="btn-primary">Learn More</Link>
            </div>

            {/* Image side */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/3' }}>
                <Image
                  src="/images/research.png"
                  alt="PeptidePure vials — Retatrutide, BPC-157 TB500, CJC-1295 Ipamorelin, Tirzepatide, Epithalon"
                  fill
                  className="object-cover object-center rounded-2xl"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Bottom label strip */}
                <div
                  className="absolute rounded-2xl bottom-0 inset-x-0 px-5 py-3.5 flex items-center justify-between"
                  style={{ background: 'rgba(11,31,58,0.84)', backdropFilter: 'blur(8px)' }}
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <svg width="16" height="18" viewBox="0 0 32 36" fill="none">
                      <path d="M16 1L30 9V27L16 35L2 27V9L16 1Z" stroke="#C8952C" strokeWidth="2" fill="none" />
                      <text x="11" y="21" fill="#C8952C" fontSize="11" fontWeight="bold" fontFamily="system-ui">P</text>
                    </svg>
                    <span className="text-white text-xs font-bold tracking-wide">PEPTIDE PURE™</span>
                  </div>
                  <div className="hidden sm:flex gap-2.5 flex-wrap justify-end">
                    {['Retatrutide', 'BPC-157', 'Tirzepatide', 'Epithalon'].map((name) => (
                      <span
                        key={name}
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{ background: 'rgba(200,149,44,0.18)', color: 'var(--gold-light)' }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div
                className="absolute -top-4 -right-4 rounded-2xl px-5 py-4 text-center shadow-xl hidden lg:block"
                style={{ background: 'var(--navy)', border: '1px solid rgba(200,149,44,0.3)' }}
              >
                <div className="text-2xl font-black" style={{ color: 'var(--gold)' }}>99%+</div>
                <div className="text-xs text-gray-300 font-medium">Purity Verified</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          WHY WE'RE DIFFERENT
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ background: 'var(--off-white)' }}>
        <div className="container-xl">
          <div className="text-center mb-14">
            <span className="section-label">Why PeptidePure™</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: 'var(--navy)' }}>
              Built for Clinicians
            </h2>
            <p className="text-sm mt-3 max-w-xl mx-auto" style={{ color: 'var(--text-light)' }}>
              Stop chasing the gray market. Practice medicine the right way — with verified compounds,
              structured protocols, and institutional-grade documentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: '3rd Party COAs',
                desc: 'Multi-lab testing with batch-level documentation. Your label. Your logo. "Clinician Use Only™" — no gray-market red flags.',
                stat: 'Multi-Lab Verified',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                ),
                title: '>99% Purity',
                desc: 'Sourced exclusively from ISO 9001-certified, cGMP-compliant manufacturers with FDA-registered 503A/503B facilities.',
                stat: 'ISO 9001 · cGMP',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Fast Shipping',
                desc: 'U.S.A.-based fulfillment. Secure packaging with tracking. Free on orders over $125. Mon–Fri dispatch.',
                stat: 'Free Over $125',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 card-hover flex flex-col"
                style={{ border: '1px solid var(--border)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1.5px solid rgba(200,149,44,0.3)' }}
                >
                  {feature.icon}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
                  {feature.stat}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--navy)' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/peptides" className="btn-outline">All Peptides</Link>
            <Link href="/how-it-works" className="btn-outline">How It Works</Link>
            <Link href="/peptides" className="btn-primary">Create Account</Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FREE SHIPPING — split layout
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden">
        {/* Background image + directional gradient */}
        <div className="absolute inset-0">
          <Image
            src="/images/shipping-copy.webp"
            alt="Fast USA shipping for clinical peptide orders"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(105deg, rgba(11,31,58,0.97) 0%, rgba(11,31,58,0.90) 55%, rgba(11,31,58,0.65) 100%)' }}
          />
        </div>

        {/* Decorative rings */}
        <div
          className="absolute pointer-events-none"
          style={{ top: '-80px', right: '-80px', width: '380px', height: '380px', borderRadius: '50%', border: '1px solid rgba(200,149,44,0.08)' }}
        />
        <div
          className="absolute pointer-events-none"
          style={{ top: '-40px', right: '-40px', width: '260px', height: '260px', borderRadius: '50%', border: '1px solid rgba(200,149,44,0.12)' }}
        />

        <div className="container-xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* ── LEFT: Text + metrics ── */}
            <div>
              {/* Label badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7"
                style={{ background: 'rgba(200,149,44,0.12)', border: '1px solid rgba(200,149,44,0.28)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gold-light)' }}>
                  Fulfillment
                </span>
              </div>

              {/* Heading */}
              <h2
                className="font-black text-white leading-[1.05] mb-5"
                style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', letterSpacing: '-0.025em' }}
              >
                Free Shipping<br />
                <span style={{ color: 'var(--gold)' }}>On Orders $125+</span>
              </h2>

              {/* Description */}
              <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.62)', maxWidth: '420px' }}>
                U.S.A.-based fulfillment built for busy clinical practices — secure packaging, real-time tracking,
                and fast Mon–Fri dispatch so your protocols never miss a beat.
              </p>

              {/* Metric strip */}
              <div
                className="flex items-center gap-6 rounded-2xl px-6 py-5 mb-8"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <div className="text-center">
                  <div className="text-3xl font-black" style={{ color: 'var(--gold)', letterSpacing: '-0.03em' }}>$0</div>
                  <div className="text-xs text-white font-semibold mt-0.5">Shipping</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>over $125</div>
                </div>
                <div className="h-12 w-px" style={{ background: 'rgba(255,255,255,0.10)' }} />
                <div className="text-center">
                  <div className="text-3xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>2–3</div>
                  <div className="text-xs text-white font-semibold mt-0.5">Business Days</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>typical delivery</div>
                </div>
                <div className="h-12 w-px" style={{ background: 'rgba(255,255,255,0.10)' }} />
                <div className="text-center">
                  <div className="text-3xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>48h</div>
                  <div className="text-xs text-white font-semibold mt-0.5">Processing</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>weekday cutoff</div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link href="/peptides" className="btn-primary" style={{ padding: '0.85rem 2rem' }}>
                  Browse Peptides →
                </Link>
                <Link href="/how-it-works" className="btn-outline-gold" style={{ padding: '0.85rem 2rem' }}>
                  How It Works
                </Link>
              </div>
            </div>

            {/* ── RIGHT: Feature cards 2×2 grid ── */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  title: 'USA-Based',
                  sub: 'Domestic fulfillment only — no international delays',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z" />
                    </svg>
                  ),
                },
                {
                  title: 'Secure Packaging',
                  sub: 'Clinical-grade materials that protect compound integrity',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  ),
                },
                {
                  title: 'Full Tracking',
                  sub: 'Real-time updates from dispatch to your door',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                },
                {
                  title: 'Mon–Fri Dispatch',
                  sub: 'Orders placed by noon ship same business day',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-5"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(200,149,44,0.12)', border: '1px solid rgba(200,149,44,0.25)', color: 'var(--gold)' }}
                  >
                    {item.icon}
                  </div>
                  <div className="text-sm font-bold text-white mb-1.5">{item.title}</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.sub}</div>
                </div>
              ))}

              {/* Full-width bottom card — USA compliance */}
              <div
                className="col-span-2 rounded-2xl px-5 py-4 flex items-center gap-4"
                style={{
                  background: 'rgba(200,149,44,0.08)',
                  border: '1px solid rgba(200,149,44,0.22)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(200,149,44,0.15)', border: '1px solid rgba(200,149,44,0.3)', color: 'var(--gold)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--gold-light)' }}>Clinician-First Logistics</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Every shipment includes batch documentation — COA on file, discreet clinical labeling, cold-chain compliant where required.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ background: 'var(--navy)' }}>
        <div className="container-xl text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(200,149,44,0.12)', border: '1px solid rgba(200,149,44,0.3)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--gold)' }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gold-light)' }}>
              Verified Clinicians Only
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Practice Peptide Medicine<br />
            <span style={{ color: 'var(--gold)' }}>the Right Way?</span>
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
            Join hundreds of licensed clinicians using PeptidePure™ to source verified compounds,
            access structured protocols, and operate within a compliant clinical framework.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/peptides" className="btn-primary px-8" style={{ padding: '0.9rem 2.5rem' }}>
              Create Account →
            </Link>
            <Link href="/contact" className="btn-outline-gold px-8" style={{ padding: '0.9rem 2.5rem' }}>
              Talk to Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          COMPLIANCE NOTICE
      ═══════════════════════════════════════════════════════ */}
      <section className="py-10" style={{ background: 'var(--gold-pale)', borderTop: '1px solid rgba(200,149,44,0.2)' }}>
        <div className="container-xl">
          <h3 className="text-center text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
            Research, Education, and Compliance Notice
          </h3>
          <p className="text-xs text-center max-w-4xl mx-auto leading-relaxed" style={{ color: 'var(--text-mid)' }}>
            Peptide Pure is a clinician-facing platform focused on education, protocol development, and observational research support. Information presented on this site reflects emerging scientific literature, mechanistic hypotheses, and real-world observational data. It is not intended to promote, market, or recommend any drug, biologic, or therapeutic intervention. Peptide Pure does not manufacture, label, or market drugs and does not represent any investigational compound as safe, effective, or equivalent to FDA-approved products. References to compounds, mechanisms, or pathways are provided solely for professional education and research discussion.
          </p>
        </div>
      </section>
    </>
  );
}
