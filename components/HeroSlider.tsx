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
        style={{ background: 'linear-gradient(110deg, rgba(11,31,58,0.92) 0%, rgba(11,31,58,0.7) 25%, rgba(11,31,58,0.2) 50%)', zIndex: 1 }}
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
                {/* Eyebrow / kicker — surfaces the slide tag as a clinical-grade context label */}
                <div
                  key={`tag-${textKey}`}
                  className="slide-text-enter inline-flex items-center gap-2 mb-4 self-start px-3 py-1.5 rounded-full"
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

                {/* Heading — gold italic display, with shadow for legibility over the video */}
                <h1
                  key={`h1-${textKey}`}
                  className="slide-text-enter font-black leading-[1.02] mb-5"
                  style={{
                    fontSize: 'clamp(2.75rem, 6vw, 5.25rem)',
                    animationDelay: '40ms',
                    letterSpacing: '-0.03em',
                    fontStyle: 'italic',
                    color: 'var(--gold)',
                    textShadow: '0 2px 24px rgba(0,0,0,0.45)',
                  }}
                >
                  {slide.heading}
                </h1>

                {/* Subtitle — clean white, no italic, more contrast for readability */}
                <p
                  key={`sub-${textKey}`}
                  className="slide-text-enter font-semibold leading-snug mb-4"
                  style={{
                    fontSize: 'clamp(1.05rem, 1.9vw, 1.35rem)',
                    animationDelay: '90ms',
                    color: 'rgba(255,255,255,0.95)',
                    textShadow: '0 1px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  {slide.subtitle}
                </p>

                {/* Separator */}
                <div
                  key={`sep-${textKey}`}
                  className="slide-text-enter mb-5 h-px w-14 rounded-full"
                  style={{ background: 'rgba(200,149,44,0.55)', animationDelay: '130ms' }}
                />

                {/* Description — readable supporting copy */}
                <p
                  key={`desc-${textKey}`}
                  className="slide-text-enter text-[15px] leading-relaxed mb-8 max-w-md"
                  style={{
                    animationDelay: '160ms',
                    color: 'rgba(255,255,255,0.78)',
                    textShadow: '0 1px 8px rgba(0,0,0,0.35)',
                  }}
                >
                  {slide.description}
                </p>

                {/* CTAs — primary + secondary */}
                <div
                  key={`cta-${textKey}`}
                  className="slide-text-enter flex flex-wrap items-center gap-3 mb-7"
                  style={{ animationDelay: '210ms' }}
                >
                  {isSignedIn ? (
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
                  ) : (
                    <Link
                      href="/account"
                      className="btn-primary inline-flex items-center gap-2"
                      style={{ padding: '0.95rem 2.2rem', fontSize: '0.95rem' }}
                    >
                      Create Clinician Account
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  )}
                  <Link
                    href="/how-it-works"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide px-1 py-2 transition-colors hover:opacity-80"
                    style={{ color: 'rgba(255,255,255,0.9)' }}
                  >
                    How It Works
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {/* Trust strip — credentialing signals that match the brand voice */}
                <div
                  key={`trust-${textKey}`}
                  className="slide-text-enter flex flex-wrap items-center gap-x-5 gap-y-2"
                  style={{ animationDelay: '260ms' }}
                >
                  {[
                    'cGMP / ISO 9001',
                    '503A · 503B Sourced',
                    'IRB-Aligned',
                    'Clinician Only™',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-1.5">
                      <svg width="11" height="11" fill="none" stroke="var(--gold)" strokeWidth="2.6" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[11px] font-semibold tracking-wide" style={{ color: 'rgba(255,255,255,0.72)' }}>
                        {item}
                      </span>
                    </div>
                  ))}
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
