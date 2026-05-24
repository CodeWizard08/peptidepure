'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

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
  const [videosReady, setVideosReady] = useState<Set<number>>(new Set());
  const [isSignedIn, setIsSignedIn] = useState(false);
  const animating = useRef(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setIsSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setIsSignedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

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
      style={{ height: '100vh', minHeight: '640px', marginTop: 'calc(-1 * var(--nav-h))', background: 'var(--navy)' }}
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
          autoPlay={i === 0}
          preload={i === 0 ? 'auto' : 'none'}
          onCanPlayThrough={() => setVideosReady((prev) => new Set(prev).add(i))}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: i === current && videosReady.has(i) ? 1 : 0, zIndex: i === current ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
        />
      ))}

      {/* Gradient overlays */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(110deg, rgba(11,31,58,0.92) 0%, rgba(11,31,58,0.7) 25%, rgba(11,31,58,0.2) 80%)', zIndex: 1 }}
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
                {/* Eyebrow / kicker — clinical context label */}
                <div
                  key={`tag-${textKey}`}
                  className="slide-text-enter inline-flex items-center gap-2 mb-5 self-start px-3 py-1.5 rounded-full"
                  style={{
                    animationDelay: '0ms',
                    background: 'rgba(200,149,44,0.12)',
                    border: '1px solid rgba(200,149,44,0.35)',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--gold)' }}>
                    {slide.tag}
                  </span>
                </div>

                {/* Heading — brand display serif, white for highest legibility, no italic */}
                <h1
                  key={`h1-${textKey}`}
                  className="slide-text-enter text-white leading-[1.05] mb-5"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: 'clamp(2rem, 4.2vw, 3.5rem)',
                    animationDelay: '40ms',
                    letterSpacing: '-0.02em',
                    textShadow: '0 2px 28px rgba(0,0,0,0.5)',
                  }}
                >
                  {slide.heading}
                </h1>

                {/* Subtitle — gold accent for visual separation, body sans, semibold */}
                <p
                  key={`sub-${textKey}`}
                  className="slide-text-enter font-semibold leading-snug mb-5"
                  style={{
                    fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)',
                    animationDelay: '90ms',
                    color: 'var(--gold-light)',
                    textShadow: '0 1px 14px rgba(0,0,0,0.45)',
                  }}
                >
                  {slide.subtitle}
                </p>

                {/* Description — readable supporting copy */}
                <p
                  key={`desc-${textKey}`}
                  className="slide-text-enter text-[15px] leading-relaxed mb-7 max-w-md"
                  style={{
                    animationDelay: '140ms',
                    color: 'rgba(255,255,255,0.82)',
                    textShadow: '0 1px 8px rgba(0,0,0,0.35)',
                  }}
                >
                  {slide.description}
                </p>

                {/* CTAs — Browse Peptides primary (lower-friction), account creation secondary */}
                <div
                  key={`cta-${textKey}`}
                  className="slide-text-enter flex flex-wrap items-center gap-x-5 gap-y-3 mb-7"
                  style={{ animationDelay: '190ms' }}
                >
                  <Link
                    href="/peptides"
                    className="btn-primary inline-flex items-center gap-2"
                    style={{ padding: '0.95rem 2.2rem', fontSize: '0.95rem' }}
                  >
                    Browse Peptides
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Right: Product image — floating, no decorative frame, soft halo ── */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-full" style={{ maxWidth: '560px', height: '480px' }}>
                {/* Soft radial halo behind the product — pulls focus without a hard frame */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(200,149,44,0.18) 0%, rgba(200,149,44,0.04) 45%, transparent 70%)',
                    filter: 'blur(8px)',
                  }}
                />
                {/* Product images — full-bleed contain, deeper drop shadow for "floating" feel */}
                {slides.map((s, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 transition-opacity rounded-lg duration-700"
                    style={{ opacity: i === current ? 1 : 0 }}
                  >
                    <Image
                      src={s.image}
                      alt={s.tag}
                      fill
                      className="object-contain object-center"
                      style={{ filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.45)) drop-shadow(0 0 40px rgba(200,149,44,0.15))' }}
                      sizes="560px"
                      priority={i === 0}
                    />
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

      {/* ── Bottom navigation — promoted to card-style selectors ──
          Mobile: single-row horizontal scroll (cards were wrapping into
          two rows on ~360px viewports and eating enough vertical space
          to overlap the "Browse Peptides" CTA in the slide content).
          sm+: keep the flex-wrap layout so wide screens use the space. */}
      <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }}>
        <div className="container-xl pb-8 flex items-end justify-between gap-4">
          <div
            className="flex items-stretch gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible sm:flex-wrap hero-slider-nav"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
          >
            {slides.map((s, i) => {
              const active = i === current;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="group flex flex-col items-start gap-1.5 px-4 py-2.5 rounded-xl transition-all duration-300 text-left shrink-0 sm:shrink"
                  style={{
                    background: active ? 'rgba(200,149,44,0.18)' : 'rgba(255,255,255,0.06)',
                    border: active ? '1px solid rgba(200,149,44,0.55)' : '1px solid rgba(255,255,255,0.10)',
                    backdropFilter: 'blur(8px)',
                    minWidth: '120px',
                    scrollSnapAlign: 'start',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full transition-colors shrink-0"
                      style={{ background: active ? 'var(--gold)' : 'rgba(255,255,255,0.4)' }}
                    />
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.14em] transition-colors"
                      style={{ color: active ? 'var(--gold)' : 'rgba(255,255,255,0.55)' }}
                    >
                      0{i + 1}
                    </span>
                  </div>
                  <span
                    className="text-xs sm:text-sm font-semibold transition-colors truncate w-full"
                    style={{ color: active ? 'white' : 'rgba(255,255,255,0.7)' }}
                  >
                    {s.tag}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono tracking-widest pb-2 hidden sm:block" style={{ color: 'rgba(255,255,255,0.45)' }}>
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

      {/* Hide the scrollbar on the slide-nav row so the horizontal scroll
          feels native-app (touch swipe) rather than desktop-scrollbar. */}
      <style jsx>{`
        .hero-slider-nav::-webkit-scrollbar { display: none; }
        .hero-slider-nav { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </section>
  );
}
