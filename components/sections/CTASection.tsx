import Link from 'next/link';

interface CTAProps {
  heading: string;
  subtitle?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export default function CTASection({ heading, subtitle, primaryCta, secondaryCta }: CTAProps) {
  return (
    <section
      className="py-16 text-center"
      style={{ background: 'var(--gold-pale)', borderTop: '1px solid rgba(200,149,44,0.2)' }}
    >
      <div className="container-xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--navy)' }}>
          {heading}
        </h2>
        {subtitle && (
          <p className="text-sm mb-6" style={{ color: 'var(--text-mid)' }}>
            {subtitle}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={primaryCta.href} className="btn-primary px-8">
            {primaryCta.label}
          </Link>
          {secondaryCta && (
            <Link href={secondaryCta.href} className="btn-outline px-8">
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
