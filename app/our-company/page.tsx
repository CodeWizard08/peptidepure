import Link from 'next/link';
import Image from 'next/image';

export default function OurCompanyPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20" style={{ background: 'var(--navy)' }}>
        <div className="container-xl text-center">
          <span className="section-label text-yellow-300">Who We Are</span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4">
            About Peptide Pure™
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            A dual-entity model that supports clinicians, protects licenses, and restores integrity to peptide-based care.
          </p>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-24">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            {/* Left */}
            <div>
              <span className="section-label">The Solution</span>
              <h2 className="text-3xl font-bold mt-2 mb-6" style={{ color: 'var(--navy)' }}>
                Modern Peptide Medicine Requires More Than Access
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-mid)' }}>
                Modern peptide medicine requires more than access to compounds. It requires structure, documentation, and a defensible clinical framework. Peptide Pure™ was built to solve this problem through a dual-entity model that supports clinicians, protects licenses, and restores integrity to peptide-based care.
              </p>

              {/* Mortensen Medical */}
              <div className="rounded-2xl p-6 mb-5" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-8 rounded-full" style={{ background: 'var(--gold)' }}></div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--navy)' }}>Mortensen Medical — 501(c)(3)</h3>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-mid)' }}>
                  Mortensen Medical operates structured, observational clinical studies designed to advance regenerative and peptide-based medicine within an established ethical framework.
                </p>
                <ul className="space-y-2">
                  {[
                    'Conducts structured observational clinical studies',
                    'Provides a legal research framework under 45 CFR 46',
                    'Allows participating clinics to operate within an organized, study-aligned environment',
                    'Supports standardized data collection, follow-up, and outcome tracking',
                    'Enables clinicians to practice responsibly while contributing to the advancement of modern medicine',
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

              {/* Peptide Pure LLC */}
              <div className="rounded-2xl p-6" style={{ background: 'var(--navy)', border: '1px solid rgba(200,149,44,0.2)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-8 rounded-full" style={{ background: 'var(--gold)' }}></div>
                  <h3 className="font-bold text-lg text-white">Peptide Pure — LLC</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-300 mb-4">
                  Peptide Pure™ is the operational and sourcing platform supporting clinicians and research partners with verified peptides and streamlined logistics.
                </p>
                <ul className="space-y-2">
                  {[
                    'MD-owned sourcing and operations platform',
                    'Peptides manufactured under ISO 9001 and cGMP-compliant systems',
                    'Verified purity standards (>99%) with batch-level documentation',
                    'Multi-lab verification, COAs, and traceability',
                    'Secure logistics, fulfillment, and inventory management',
                    'Seamless clinic onboarding with popular protocols and optional branded bundles',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right */}
            <div className="space-y-8">
              {/* Image placeholder */}
              <div className="rounded-2xl overflow-hidden shadow-2xl w-full relative" style={{ height: '460px' }}>
                <Image
                  src="/images/peptide-pure-1.webp"
                  alt="PeptidePure™ clinical research facility"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 580px"
                />
                {/* Logo overlay */}
                <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                  <svg width="20" height="24" viewBox="0 0 32 36" fill="none">
                    <path d="M16 1L30 9V27L16 35L2 27V9L16 1Z" stroke="#C8952C" strokeWidth="2" fill="none" />
                    <text x="11" y="21" fill="#C8952C" fontSize="11" fontWeight="bold" fontFamily="system-ui">P</text>
                  </svg>
                  <span className="text-white text-sm font-bold">PEPTIDE PURE™</span>
                </div>
              </div>

              {/* Why This Matters */}
              <div className="rounded-2xl p-8" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--navy)' }}>Why This Matters</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-mid)' }}>
                  Most clinicians interested in peptides are forced to choose between:
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    'Inconsistent gray-market sourcing, or',
                    'Walking away from peptide medicine entirely',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'white', border: '1px solid var(--border)' }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#DC2626' }}>✗</span>
                      <span className="text-sm" style={{ color: 'var(--text-mid)' }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 rounded-xl mb-4" style={{ background: 'rgba(200,149,44,0.1)', border: '1px solid rgba(200,149,44,0.3)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>
                    This platform eliminates that false choice.
                  </p>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                  Together, Mortensen Medical and Peptide Pure™ provide a compliant, efficient pathway for clinicians who want to practice modern regenerative medicine with clarity, confidence, and accountability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20" style={{ background: 'var(--navy)' }}>
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="section-label text-yellow-300">Our Values</span>
            <h2 className="text-3xl font-bold text-white mt-2">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '🎯', title: 'Precision', desc: 'Right milligram strengths, right compounds, right protocols for each clinical context.' },
              { icon: '🔒', title: 'Integrity', desc: 'No gray market. No hype. Honest documentation and defensible clinical workflows.' },
              { icon: '⚖️', title: 'Compliance', desc: 'Aligned with 45 CFR 46, FDA guidance, and state medical practice standards.' },
              { icon: '🤝', title: 'Partnership', desc: 'MD-owned and operated — built by clinicians, for clinicians, with a shared commitment to outcomes.' },
            ].map((item, i) => (
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

      {/* CTA */}
      <section className="py-16 text-center" style={{ background: 'var(--gold-pale)' }}>
        <div className="container-xl">
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--navy)' }}>
            Ready to Join the PeptidePure™ Network?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-mid)' }}>
            Verified clinicians gain access to the full catalog, protocol resources, and clinical study enrollment.
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
