'use client';

import { useEffect, useRef, useState } from 'react';

export default function IntroVideo({ content }: { content: any }) {
  const iframeRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible]);

  // Append autoplay param when visible
  const baseUrl = content.intro.videoUrl as string;
  const separator = baseUrl.includes('?') ? '&' : '?';
  const videoSrc = isVisible ? `${baseUrl}${separator}autoplay=1&muted=1` : baseUrl;

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
          {/* Vimeo embed — autoplay when scrolled into view */}
          <div ref={iframeRef} className="rounded-2xl overflow-hidden shadow-xl aspect-video">
            <iframe
              src={videoSrc}
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
