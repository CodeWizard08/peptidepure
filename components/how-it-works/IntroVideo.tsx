export default function IntroVideo({ content }: { content: any }) {
  return (
    <section className="py-20">
      <div className="container-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="section-label">{content.intro.sectionLabel}</span>
            <h2 className="text-3xl font-bold mt-2 mb-6" style={{ color: 'var(--navy)' }}>
              {content.intro.heading}
            </h2>
            {content.intro.paragraphs.map((p: string, i: number) => (
              <p
                key={i}
                className={`text-base leading-relaxed${i < content.intro.paragraphs.length - 1 ? ' mb-4' : ''}`}
                style={{ color: 'var(--text-mid)' }}
              >
                {p}
              </p>
            ))}
          </div>
          {/* Vimeo embed */}
          <div className="rounded-2xl overflow-hidden shadow-xl aspect-video">
            <iframe
              src={content.intro.videoUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
              allowFullScreen
              title={content.intro.videoTitle}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
