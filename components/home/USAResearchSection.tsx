import Link from 'next/link';
import Image from 'next/image';

interface USAResearchContent {
  sectionLabel: string;
  heading: string;
  tagline: string;
  description: string;
  bulletPoints: string[];
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
  compoundPills: string[];
  badgeStat: string;
  badgeLabel: string;
}

export default function USAResearchSection({ content }: { content: USAResearchContent }) {
  return (
    <section className="py-24 bg-white">
      <div className="container-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          <div>
            <span className="section-label">{content.sectionLabel}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-2" style={{ color: 'var(--navy)' }}>
              {content.heading}
            </h2>
            <p className="text-lg font-semibold mb-5" style={{ color: 'var(--gold)' }}>
              {content.tagline}
            </p>
            <p className="text-base mb-7 leading-relaxed" style={{ color: 'var(--text-mid)' }}>
              {content.description}
            </p>

            <ul className="space-y-3.5 mb-8">
              {content.bulletPoints.map((item, i) => (
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
            <Link href={content.ctaHref} className="btn-primary">{content.ctaLabel}</Link>
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/3' }}>
              <Image
                src={content.image}
                alt={content.imageAlt}
                fill
                className="object-cover object-center rounded-2xl"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
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
                  {content.compoundPills.map((name) => (
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

            <div
              className="absolute -top-4 -right-4 rounded-2xl px-5 py-4 text-center shadow-xl hidden lg:block"
              style={{ background: 'var(--navy)', border: '1px solid rgba(200,149,44,0.3)' }}
            >
              <div className="text-2xl font-black" style={{ color: 'var(--gold)' }}>{content.badgeStat}</div>
              <div className="text-xs text-gray-300 font-medium">{content.badgeLabel}</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
