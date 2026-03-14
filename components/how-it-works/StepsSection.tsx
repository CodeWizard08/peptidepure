export default function StepsSection({ content }: { content: any }) {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background: 'var(--off-white)' }}>
      <style>{`
        .how-step { position: relative; background: #ffffff; transition: background 0.4s ease; overflow: hidden; }
        .how-step::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--gold) 0%, rgba(200,149,44,0.3) 60%, transparent 100%); transform: scaleX(0); transform-origin: left; transition: transform 0.5s cubic-bezier(0.4,0,0.2,1); }
        .how-step:hover::before { transform: scaleX(1); }
        .how-step:hover { background: var(--gold-pale); }
        .how-step:hover .how-step-icon { border-color: rgba(200,149,44,0.55) !important; background: rgba(200,149,44,0.08) !important; }
        .how-step:hover .how-step-desc { color: var(--text-mid) !important; }
        .how-step:hover .how-step-ghost { color: rgba(200,149,44,0.07) !important; }
      `}</style>

      <div className="container-xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--navy)' }}>
            {content.steps.heading}
          </h2>
          <p className="text-sm mt-3" style={{ color: 'var(--text-light)' }}>
            {content.steps.subtitle}
          </p>
        </div>

        {/* Steps grid — 1px gap acts as hairline dividers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'rgba(11,31,58,0.1)',
          border: '1px solid rgba(11,31,58,0.1)',
          borderRadius: '1rem',
          overflow: 'hidden',
        }}>
          {content.steps.items.map((item: { step: string; icon: string; title: string; desc: string }, i: number) => (
            <div key={i} className="how-step" style={{ padding: '3rem 2.75rem 2.75rem' }}>

              {/* Step number + trailing line */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'var(--gold)', marginBottom: '2rem',
              }}>
                Step {String(i + 1).padStart(2, '0')}
                <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(200,149,44,0.3), transparent)' }} />
              </div>

              {/* Icon box */}
              <div
                className="how-step-icon"
                style={{
                  width: '52px', height: '52px',
                  border: '1px solid rgba(200,149,44,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '2.25rem',
                  transition: 'border-color 0.3s, background 0.3s',
                }}
              >
                {i === 0 && (
                  <svg viewBox="0 0 24 24" style={{ width: '24px', stroke: 'var(--gold)', fill: 'none', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                )}
                {i === 1 && (
                  <svg viewBox="0 0 24 24" style={{ width: '24px', stroke: 'var(--gold)', fill: 'none', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                    <path d="M9 12l2 2 4-4" /><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  </svg>
                )}
                {i === 2 && (
                  <svg viewBox="0 0 24 24" style={{ width: '24px', stroke: 'var(--gold)', fill: 'none', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                  </svg>
                )}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '1.65rem', fontWeight: 600,
                color: 'var(--navy)', marginBottom: '1.25rem', lineHeight: 1.2,
              }}>
                {item.title}
              </h3>

              {/* Description */}
              <p
                className="how-step-desc"
                style={{ fontSize: '0.875rem', lineHeight: 1.75, color: 'var(--text-light)', transition: 'color 0.3s' }}
              >
                {item.desc}
              </p>

              {/* Ghost number */}
              <div
                className="how-step-ghost"
                style={{
                  position: 'absolute', bottom: '1.25rem', right: '1.75rem',
                  fontSize: '6rem', fontWeight: 300,
                  color: 'rgba(11,31,58,0.04)', lineHeight: 1,
                  pointerEvents: 'none', userSelect: 'none',
                  transition: 'color 0.3s',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>

              {/* Connector dots (between cards only) */}
              {i < content.steps.items.length - 1 && (
                <div style={{ position: 'absolute', top: '50%', right: '-1px', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 2, pointerEvents: 'none' }}>
                  {[0, 1, 2].map(d => (
                    <span key={d} style={{ display: 'block', width: '3px', height: '3px', background: 'var(--gold)', borderRadius: '50%', opacity: 0.5 }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
