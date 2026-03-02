interface StatItem {
  stat: string;
  label: string;
  sub: string;
}

interface FunctionCard {
  icon: string;
  title: string;
  desc: string;
}

interface StatsSectionContent {
  sectionLabel: string;
  heading: string;
  items: StatItem[];
  functionCards: FunctionCard[];
}

export default function StatsSection({ content }: { content: StatsSectionContent }) {
  return (
    <section style={{ background: 'var(--navy)' }} className="py-20">
      <div className="container-xl">
        <div className="text-center mb-14">
          <span className="section-label text-yellow-300">{content.sectionLabel}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            {content.heading}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {content.items.map((item, i) => (
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {content.functionCards.map((item, i) => (
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
  );
}
