import Link from 'next/link';

interface FinalCTAContent {
  badgeLabel: string;
  heading: string;
  headingHighlight: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export default function FinalCTA({ content }: { content: FinalCTAContent }) {
  return (
    <section className="py-20" style={{ background: 'var(--navy)' }}>
      <div className="container-xl text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
          style={{ background: 'rgba(200,149,44,0.12)', border: '1px solid rgba(200,149,44,0.3)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--gold)' }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gold-light)' }}>
            {content.badgeLabel}
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {content.heading}<br />
          <span style={{ color: 'var(--gold)' }}>{content.headingHighlight}</span>
        </h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
          {content.description}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={content.primaryCtaHref} className="btn-primary" style={{ padding: '0.9rem 2.5rem' }}>
            {content.primaryCtaLabel}
          </Link>
          <Link href={content.secondaryCtaHref} className="btn-outline-gold" style={{ padding: '0.9rem 2.5rem' }}>
            {content.secondaryCtaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
