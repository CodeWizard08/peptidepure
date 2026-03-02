import Link from 'next/link';
import Image from 'next/image';

const featureIcons = [
  <svg key="f0" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z" />
  </svg>,
  <svg key="f1" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>,
  <svg key="f2" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>,
  <svg key="f3" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>,
];

interface Metric { value: string; label: string; sub: string }
interface FeatureCard { title: string; sub: string }
interface ComplianceCard { title: string; desc: string }

interface FreeShippingContent {
  badgeLabel: string;
  heading: string;
  headingHighlight: string;
  description: string;
  metrics: Metric[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  featureCards: FeatureCard[];
  complianceCard: ComplianceCard;
}

export default function FreeShippingSection({ content }: { content: FreeShippingContent }) {
  return (
    <section className="relative py-28 overflow-hidden">
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
      <div className="absolute pointer-events-none" style={{ top: '-80px', right: '-80px', width: '380px', height: '380px', borderRadius: '50%', border: '1px solid rgba(200,149,44,0.08)' }} />
      <div className="absolute pointer-events-none" style={{ top: '-40px', right: '-40px', width: '260px', height: '260px', borderRadius: '50%', border: '1px solid rgba(200,149,44,0.12)' }} />

      <div className="container-xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7"
              style={{ background: 'rgba(200,149,44,0.12)', border: '1px solid rgba(200,149,44,0.28)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gold-light)' }}>
                {content.badgeLabel}
              </span>
            </div>

            <h2
              className="font-black text-white leading-[1.05] mb-5"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', letterSpacing: '-0.025em' }}
            >
              {content.heading}<br />
              <span style={{ color: 'var(--gold)' }}>{content.headingHighlight}</span>
            </h2>

            <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.62)', maxWidth: '420px' }}>
              {content.description}
            </p>

            <div
              className="flex items-center gap-6 rounded-2xl px-6 py-5 mb-8"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              {content.metrics.map((metric, i) => (
                <div key={i} className="contents">
                  {i > 0 && <div className="h-12 w-px" style={{ background: 'rgba(255,255,255,0.10)' }} />}
                  <div className="text-center">
                    <div
                      className="text-3xl font-black"
                      style={{ color: i === 0 ? 'var(--gold)' : 'white', letterSpacing: '-0.03em' }}
                    >
                      {metric.value}
                    </div>
                    <div className="text-xs text-white font-semibold mt-0.5">{metric.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{metric.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={content.primaryCtaHref} className="btn-primary" style={{ padding: '0.85rem 2rem' }}>
                {content.primaryCtaLabel}
              </Link>
              <Link href={content.secondaryCtaHref} className="btn-outline-gold" style={{ padding: '0.85rem 2rem' }}>
                {content.secondaryCtaLabel}
              </Link>
            </div>
          </div>

          {/* Right: 2×2 feature cards + compliance */}
          <div className="grid grid-cols-2 gap-4">
            {content.featureCards.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(200,149,44,0.12)', border: '1px solid rgba(200,149,44,0.25)', color: 'var(--gold)' }}
                >
                  {featureIcons[i]}
                </div>
                <div className="text-sm font-bold text-white mb-1.5">{item.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.sub}</div>
              </div>
            ))}

            <div
              className="col-span-2 rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{ background: 'rgba(200,149,44,0.08)', border: '1px solid rgba(200,149,44,0.22)' }}
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
                <div className="text-sm font-bold" style={{ color: 'var(--gold-light)' }}>{content.complianceCard.title}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{content.complianceCard.desc}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
