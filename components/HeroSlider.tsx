'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroSlide {
  video: string;
  image: string;
  tag: string;
  heading: string;
  subtitle: string;
  description: string;
}

interface HeroSliderContent {
  duration: number;
  slides: HeroSlide[];
}

export default function HeroSlider({ content }: { content: HeroSliderContent }) {
  const { slides, duration: DURATION } = content;

  const [current, setCurrent] = useState(0);
  const [textKey, setTextKey] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const animating = useRef(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const goTo = useCallback((index: number) => {
    if (animating.current) return;
    animating.current = true;
    const next = (index + slides.length) % slides.length;
    setCurrent(next);
    setTextKey((k) => k + 1);
    setProgressKey((k) => k + 1);
    setTimeout(() => { animating.current = false; }, 700);
  }, [slides.length]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const id = setInterval(next, DURATION);
    return () => clearInterval(id);
  }, [next, DURATION]);

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) video.play().catch(() => {});
    });
  }, []);

  const slide = slides[current];

  return (
    <section
      className="relative overflow-hidden select-none"
      style={{ height: '100vh', minHeight: '640px', marginTop: 'calc(-1 * var(--nav-h))' }}
    >
      {/* Background videos */}
      {slides.map((s, i) => (
        <video
          key={i}
          ref={(el) => { videoRefs.current[i] = el; }}
          src={s.video}
          muted
          loop
          playsInline
          preload={i === 0 ? 'auto' : 'none'}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
        />
      ))}

      {/* Gradient overlays */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(110deg, rgba(11,31,58,0.92) 0%, rgba(11,31,58,0.7) 45%, rgba(11,31,58,0.2) 100%)', zIndex: 1 }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-48"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.70), transparent)', zIndex: 2 }}
      />

      {/* Content */}
      <div className="relative h-full flex items-center" style={{ zIndex: 10 }}>
        <div className="container-xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* ── Left: Text ── */}
            <div className="flex gap-5 items-stretch">
              <div
                key={`line-${textKey}`}
                className="slide-text-enter hidden sm:block w-px shrink-0 self-stretch rounded-full"
                style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--gold) 30%, var(--gold) 70%, transparent 100%)', minHeight: '220px', animationDelay: '0ms' }}
              />

              <div className="flex flex-col min-w-0">
                {/* Heading */}
                <h1
                  key={`h1-${textKey}`}
                  className="slide-text-enter font-black text-white leading-[1.04] mb-5"
                  style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.8rem)', animationDelay: '0ms', letterSpacing: '-0.025em', fontStyle: 'italic' }}
                >
                  <span style={{ color: 'var(--gold)' }}>{slide.heading}</span>
                </h1>

                {/* Subtitle */}
                <p
                  key={`sub-${textKey}`}
                  className="slide-text-enter font-bold leading-snug mb-4"
                  style={{ fontSize: 'clamp(1rem, 1.8vw, 1.25rem)', animationDelay: '60ms', color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' }}
                >
                  {slide.subtitle}
                </p>

                {/* Separator */}
                <div
                  key={`sep-${textKey}`}
                  className="slide-text-enter mb-5 h-px w-14 rounded-full"
                  style={{ background: 'rgba(200,149,44,0.45)', animationDelay: '100ms' }}
                />

                {/* Description */}
                <p
                  key={`desc-${textKey}`}
                  className="slide-text-enter text-sm leading-relaxed mb-8 max-w-md"
                  style={{ animationDelay: '130ms', color: 'rgba(255,255,255,0.55)' }}
                >
                  {slide.description}
                </p>

                {/* CTA */}
                <div
                  key={`cta-${textKey}`}
                  className="slide-text-enter"
                  style={{ animationDelay: '180ms' }}
                >
                  <Link
                    href="/account"
                    className="btn-primary inline-flex items-center gap-2"
                    style={{ padding: '0.9rem 2.2rem', fontSize: '0.95rem' }}
                  >
                    Create Account
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs">+</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Right: Product image ── */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-full" style={{ maxWidth: '520px', height: '450px' }}>
                {/* Decorative border ring */}
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    border: '2px solid rgba(200,149,44,0.35)',
                    boxShadow: 'inset 0 0 30px rgba(200,149,44,0.08), 0 0 40px rgba(200,149,44,0.06)',
                  }}
                />
                {/* Corner accents */}
                <div className="absolute -top-1 -left-1 w-8 h-8 pointer-events-none" style={{ borderTop: '3px solid var(--gold)', borderLeft: '3px solid var(--gold)', borderRadius: '16px 0 0 0' }} />
                <div className="absolute -top-1 -right-1 w-8 h-8 pointer-events-none" style={{ borderTop: '3px solid var(--gold)', borderRight: '3px solid var(--gold)', borderRadius: '0 16px 0 0' }} />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 pointer-events-none" style={{ borderBottom: '3px solid var(--gold)', borderLeft: '3px solid var(--gold)', borderRadius: '0 0 0 16px' }} />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 pointer-events-none" style={{ borderBottom: '3px solid var(--gold)', borderRight: '3px solid var(--gold)', borderRadius: '0 0 16px 0' }} />
                {/* Inner glow background */}
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(200,149,44,0.06) 0%, transparent 70%)' }}
                />
                {/* Product images */}
                {slides.map((s, i) => (
                  <div key={i} className="absolute inset-4 transition-opacity duration-700 rounded-2xl overflow-hidden" style={{ opacity: i === current ? 1 : 0 }}>
                    <Image src={s.image} alt={s.tag} fill className="object-contain object-center drop-shadow-2xl" sizes="480px" priority={i === 0} />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      {[
        { label: 'Previous', action: prev, side: 'left-5', icon: 'M15 19l-7-7 7-7' },
        { label: 'Next', action: next, side: 'right-5', icon: 'M9 5l7 7-7 7' },
      ].map(({ label, action, side, icon }) => (
        <button
          key={label}
          onClick={action}
          aria-label={label}
          className={`absolute ${side} top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105`}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(10px)' }}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </button>
      ))}

      {/* ── Bottom navigation ── */}
      <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }}>
        <div className="container-xl pb-8 flex items-end justify-between gap-4">
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-300"
                style={{ background: i === current ? 'rgba(200,149,44,0.2)' : 'rgba(255,255,255,0.07)', border: i === current ? '1px solid rgba(200,149,44,0.5)' : '1px solid rgba(255,255,255,0.10)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full transition-colors" style={{ background: i === current ? 'var(--gold)' : 'rgba(255,255,255,0.38)' }} />
                <span className="text-xs font-semibold tracking-wide hidden sm:block transition-colors" style={{ color: i === current ? 'var(--gold-light)' : 'rgba(255,255,255,0.45)' }}>
                  {s.tag}
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs font-mono tracking-widest pb-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <span style={{ color: 'rgba(255,255,255,0.80)' }}>{String(current + 1).padStart(2, '0')}</span>
            {' / '}
            {String(slides.length).padStart(2, '0')}
          </div>
        </div>

        <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.10)' }}>
          <div
            key={progressKey}
            className="slide-progress-bar h-full"
            style={{ background: 'var(--gold)', animationDuration: `${DURATION}ms` }}
          />
        </div>
      </div>
    </section>
  );
}
