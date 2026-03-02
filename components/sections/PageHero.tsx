interface PageHeroProps {
  sectionLabel: string;
  heading: string;
  subtitle?: string;
  centered?: boolean;
  compact?: boolean;
}

export default function PageHero({
  sectionLabel,
  heading,
  subtitle,
  centered = true,
  compact = false,
}: PageHeroProps) {
  return (
    <section className={compact ? 'py-14' : 'py-20'} style={{ background: 'var(--navy)' }}>
      <div className={`container-xl${centered ? ' text-center' : ''}`}>
        <span className="section-label text-yellow-300">{sectionLabel}</span>
        <h1 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4">
          {heading}
        </h1>
        {subtitle && (
          <p className={`text-gray-300${centered ? ' max-w-2xl mx-auto' : ' max-w-xl'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
