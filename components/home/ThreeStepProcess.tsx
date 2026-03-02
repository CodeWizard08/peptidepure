import Link from 'next/link';

const stepIcons = [
  <svg key="s0" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>,
  <svg key="s1" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>,
  <svg key="s2" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>,
];

interface Step {
  step: string;
  title: string;
  desc: string;
  ctaLabel: string;
  ctaHref: string;
}

interface ThreeStepContent {
  sectionLabel: string;
  heading: string;
  subtitle: string;
  steps: Step[];
}

export default function ThreeStepProcess({ content }: { content: ThreeStepContent }) {
  return (
    <section className="py-24" style={{ background: 'var(--off-white)' }}>
      <div className="container-xl">
        <div className="text-center mb-16">
          <span className="section-label">{content.sectionLabel}</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: 'var(--navy)' }}>
            {content.heading}
          </h2>
          <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: 'var(--text-light)' }}>
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.steps.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 flex flex-col card-hover"
              style={{ border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1.5px solid rgba(200,149,44,0.3)' }}
                >
                  {stepIcons[i]}
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
                href={item.ctaHref}
                className="text-sm font-semibold flex items-center gap-1.5 transition-colors"
                style={{ color: 'var(--gold)' }}
              >
                {item.ctaLabel}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
