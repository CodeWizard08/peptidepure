import Link from 'next/link';
import type { ProtocolMeta } from '@/lib/protocols/types';

type Props = {
  category: string | null;
  title: string;
  subtitle: string | null;
  tags: string[];
  meta: ProtocolMeta;
};

const TAG_PALETTES: Record<string, { bg: string; color: string }> = {
  'FDA Approved': { bg: 'rgba(34,197,94,0.18)', color: '#16a34a' },
  Injectable:    { bg: 'rgba(255,255,255,0.18)', color: 'white' },
  Oral:          { bg: 'rgba(255,255,255,0.18)', color: 'white' },
  Topical:       { bg: 'rgba(255,255,255,0.18)', color: 'white' },
  Investigational: { bg: 'rgba(234,179,8,0.22)', color: '#facc15' },
};

function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div
      className="rounded-2xl px-5 py-4 backdrop-blur-sm"
      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
        {label}
      </p>
      <p className="text-lg font-bold leading-tight text-white">{value}</p>
      {detail && (
        <p className="text-xs mt-1 leading-snug" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {detail}
        </p>
      )}
    </div>
  );
}

export default function ProtocolHero({ category, title, subtitle, tags, meta }: Props) {
  const heroStats: Array<{ label: string; value: string; detail?: string }> = [];
  if (meta.typical_dose) heroStats.push({ label: 'Typical Dose', value: meta.typical_dose.value, detail: meta.typical_dose.detail });
  if (meta.route)        heroStats.push({ label: 'Route',         value: meta.route.value,        detail: meta.route.detail });
  if (meta.cycle)        heroStats.push({ label: 'Cycle',         value: meta.cycle.value,        detail: meta.cycle.detail });
  if (meta.storage)      heroStats.push({ label: 'Storage',       value: meta.storage.value,      detail: meta.storage.detail });

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1e3a6f 60%, #2563eb 100%)' }}
    >
      <div className="container-xl py-14 lg:py-16 relative">
        {/* Breadcrumb */}
        <p className="text-xs font-semibold mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>
          <Link href="/protocols" className="hover:underline">Protocols</Link>
          {category && <> · <span className="text-white/85">{category}</span></>}
        </p>

        <h1
          className="text-4xl md:text-5xl font-bold mb-3 text-white leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="text-base md:text-lg mb-4 max-w-3xl" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {subtitle}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag) => {
              const pal = TAG_PALETTES[tag] ?? { bg: 'rgba(255,255,255,0.14)', color: 'white' };
              return (
                <span
                  key={tag}
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: pal.bg, color: pal.color, border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {heroStats.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {heroStats.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} detail={s.detail} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
