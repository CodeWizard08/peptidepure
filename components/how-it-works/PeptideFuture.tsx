const features = [
  {
    title: 'Hormonal Regulation',
    desc: 'Peptides precisely modulate endocrine pathways, supporting natural hormone balance without disrupting the entire system.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.71.71m14.14 14.14.71.71M3 12H4m16 0h1M4.22 19.78l.71-.71M19.07 4.93l.71-.71" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    title: 'Neurotransmission',
    desc: 'Neuropeptides optimize synaptic signaling, influencing mood, cognition, and neurological resilience at the cellular level.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Immune Defense',
    desc: 'Immunomodulatory peptides calibrate the innate and adaptive immune responses, reducing chronic inflammation at its source.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Cellular Signaling',
    desc: 'Growth factor peptides activate regenerative cascades — stimulating tissue repair, collagen synthesis, and mitochondrial efficiency.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        <ellipse cx="12" cy="12" rx="8" ry="3" />
        <ellipse cx="12" cy="12" rx="8" ry="3" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="8" ry="3" transform="rotate(120 12 12)" />
      </svg>
    ),
  },
];

export default function PeptideFuture() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/images/pepti.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(248,240,225,0.88)' }}
      />

      <div className="relative container-xl py-20 md:py-28">
        {/* Heading */}
        <div className="text-center mb-14 md:mb-16">
          <span className="section-label">The Science</span>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-black mt-3 leading-tight max-w-3xl mx-auto"
            style={{ color: 'var(--navy)', letterSpacing: '-0.02em' }}
          >
            Why Peptides are the Future of<br />
            <span style={{ color: 'var(--gold)' }}>Medicine 3.0</span>
          </h2>
          <p
            className="mt-4 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-mid)' }}
          >
            Peptides act as precise biological messengers — signaling specific cellular pathways
            without the systemic side effects of traditional therapies.
          </p>
        </div>

        {/* 2x2 Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((item) => (
            <div
              key={item.title}
              className="flex gap-5 p-6 rounded-2xl transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(200,149,44,0.18)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(200,149,44,0.12)',
                  border: '1px solid rgba(200,149,44,0.22)',
                  color: 'var(--gold)',
                }}
              >
                {item.icon}
              </div>
              <div>
                <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--gold)' }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
