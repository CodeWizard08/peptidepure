import Link from 'next/link';

const icons = [
  <svg key="w0" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>,
  <svg key="w1" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>,
  <svg key="w2" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>,
];

interface Feature {
  stat: string;
  title: string;
  desc: string;
}

interface WhyDifferentContent {
  sectionLabel: string;
  heading: string;
  subtitle: string;
  features: Feature[];
}

export default function WhyDifferentSection({ content }: { content: WhyDifferentContent }) {
  return (
    <section className="py-24" style={{ background: 'var(--off-white)' }}>
      <div className="container-xl">
        <div className="text-center mb-14">
          <span className="section-label">{content.sectionLabel}</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: 'var(--navy)' }}>
            {content.heading}
          </h2>
          <p className="text-sm mt-3 max-w-xl mx-auto" style={{ color: 'var(--text-light)' }}>
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {content.features.map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 card-hover flex flex-col"
              style={{ border: '1px solid var(--border)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1.5px solid rgba(200,149,44,0.3)' }}
              >
                {icons[i]}
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
          <Link href="/account" className="btn-primary">Create Account</Link>
        </div>
      </div>
    </section>
  );
}
