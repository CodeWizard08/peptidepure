'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const slides = [
  {
    video: '/images/videos/1.mp4',
    image: '/images/pepti.jpg',
    badge: 'Clinician Use Only · 99% Purity',
    tag: 'Injectables',
    heading: ['Research-Grade', 'Injectable Peptides'],
    compounds: ['BPC-157', 'TB-500', 'Epithalon', 'Tirzepatide'],
  },
  {
    video: '/images/videos/2.mp4',
    image: '/images/oral-peptides.png',
    badge: 'Multiple Delivery Formats',
    tag: 'Oral & Topical',
    heading: ['Not All Peptides', 'Require Injection'],
    compounds: ['Capsules', 'Patches', 'Nasal Sprays', 'Topicals'],
  },
  {
    video: '/images/videos/3.mp4',
    image: '/images/product-line-up.webp',
    badge: '25–100 Tablets Per Bottle',
    tag: 'Capsules',
    heading: ['Peptide Capsules', 'Simple Dosing'],
    compounds: ['Tirzepatide', 'BPC-157', 'SLU-PP-332', '5-Amino-1MQ'],
  },
  {
    video: '/images/videos/4.mp4',
    image: '/images/HERO-BANNER-1.webp',
    badge: '20 Count · No Caffeine · No Nicotine',
    tag: 'Nootropics',
    heading: ['Peptide Buzz™', 'Nootropic Pouches'],
    compounds: ['BPC-157', 'NAD+', 'Semax', 'Selank'],
  },
];

// Match slide duration to video clip length
const DURATION = 8000;

const trustPoints = ['cGMP Compliant', '>99% Purity', 'Batch COA Included'];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [textKey, setTextKey] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const animating = useRef(false);
  // One ref per video element
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const goTo = useCallback((index: number) => {
    if (animating.current) return;
    animating.current = true;
    const next = (index + slides.length) % slides.length;
    setCurrent(next);
    setTextKey((k) => k + 1);
    setProgressKey((k) => k + 1);
    setTimeout(() => { animating.current = false; }, 700);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance — always running, unaffected by hover
  useEffect(() => {
    const id = setInterval(next, DURATION);
    return () => clearInterval(id);
  }, [next]);

  // Mount: start ALL videos looping silently so they're decoded and ready to cross-fade
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) video.play().catch(() => {});
    });
  }, []);

  const slide = slides[current];

  return (
    <section
      className="relative overflow-hidden select-none"
      style={{
        height: '100vh',
        minHeight: '640px',
        marginTop: '-4rem',
      }}
    >
      {/* ── Per-slide videos — cross-fade via opacity */}
      {slides.map((s, i) => (
        <video
          key={i}
          ref={(el) => { videoRefs.current[i] = el; }}
          src={s.video}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
        />
      ))}

      {/* ── Directional gradient overlay — heavier left for text */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(110deg, rgba(11,31,58,0.95) 0%, rgba(11,31,58,0.78) 45%, rgba(11,31,58,0.28) 100%)',
          zIndex: 1,
        }}
      />

      {/* ── Bottom vignette for nav bar legibility */}
      <div
        className="absolute inset-x-0 bottom-0 h-48"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.70), transparent)', zIndex: 2 }}
      />

      {/* ══════════════════════════════════════════
          MAIN CONTENT — 2-col: text left / image right
      ══════════════════════════════════════════ */}
      <div className="relative h-full flex items-center" style={{ zIndex: 10 }}>
        <div className="container-xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* ─────────────────── LEFT: text block ─────────────────── */}
            <div className="flex gap-5 items-stretch">

              {/* Gold accent line */}
              <div
                key={`line-${textKey}`}
                className="slide-text-enter hidden sm:block w-px shrink-0 self-stretch rounded-full"
                style={{
                  background: 'linear-gradient(to bottom, transparent 0%, var(--gold) 30%, var(--gold) 70%, transparent 100%)',
                  minHeight: '220px',
                  animationDelay: '0ms',
                }}
              />

              <div className="flex flex-col min-w-0">

                {/* ── Badge with pulsing dot */}
                <div
                  key={`tag-${textKey}`}
                  className="slide-text-enter inline-flex items-center gap-2.5 mb-6 w-fit px-4 py-2 rounded-full"
                  style={{
                    background: 'rgba(200,149,44,0.12)',
                    border: '1px solid rgba(200,149,44,0.38)',
                    animationDelay: '0ms',
                  }}
                >
                  <span className="relative flex w-2 h-2 shrink-0">
                    <span
                      className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                      style={{ background: 'var(--gold)', animationDuration: '1.8s' }}
                    />
                    <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} />
                  </span>
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gold-light)' }}>
                    {slide.badge}
                  </span>
                </div>

                {/* ── Main heading */}
                <h1
                  key={`h1-${textKey}`}
                  className="slide-text-enter font-black text-white leading-[1.04] mb-4"
                  style={{
                    fontSize: 'clamp(2.5rem, 5.5vw, 4.8rem)',
                    animationDelay: '60ms',
                    letterSpacing: '-0.025em',
                  }}
                >
                  {slide.heading[0]}
                  <br />
                  <span style={{ color: 'var(--gold)' }}>{slide.heading[1]}</span>
                </h1>

                {/* ── Gold separator */}
                <div
                  key={`sep-${textKey}`}
                  className="slide-text-enter mb-5 h-px w-14 rounded-full"
                  style={{ background: 'rgba(200,149,44,0.45)', animationDelay: '100ms' }}
                />

                {/* ── Compound pills */}
                <div
                  key={`pills-${textKey}`}
                  className="slide-text-enter flex flex-wrap gap-2 mb-8"
                  style={{ animationDelay: '130ms' }}
                >
                  {slide.compounds.map((c) => (
                    <span
                      key={c}
                      className="text-xs px-3 py-1.5 rounded-full font-semibold tracking-wide"
                      style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        color: 'rgba(255,255,255,0.72)',
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {/* ── CTAs */}
                <div
                  key={`cta-${textKey}`}
                  className="slide-text-enter flex flex-wrap gap-3 mb-7"
                  style={{ animationDelay: '180ms' }}
                >
                  <Link
                    href="/peptides"
                    className="btn-primary"
                    style={{ padding: '0.9rem 2.2rem', fontSize: '0.95rem' }}
                  >
                    Create Account →
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="btn-outline-gold"
                    style={{ padding: '0.9rem 2.2rem', fontSize: '0.95rem' }}
                  >
                    How It Works
                  </Link>
                </div>

                {/* ── Trust mini-strip */}
                <div
                  key={`trust-${textKey}`}
                  className="slide-text-enter flex items-center gap-4 flex-wrap"
                  style={{ animationDelay: '240ms' }}
                >
                  {trustPoints.map((t, i) => (
                    <span key={t} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.48)' }}>
                      {i > 0 && <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>}
                      <svg className="w-3 h-3 shrink-0" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {t}
                    </span>
                  ))}
                </div>

              </div>
            </div>

            {/* ─────────────────── RIGHT: product image ─────────────────── */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-full" style={{ maxWidth: '480px' }}>

                {/* Ambient gold glow behind the card */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    inset: '-20px',
                    background: 'radial-gradient(ellipse at 50% 50%, rgba(200,149,44,0.14) 0%, transparent 70%)',
                    borderRadius: '50%',
                  }}
                />

                {/* ── Consistent card frame */}
                <div
                  className="relative overflow-hidden rounded-2xl"
                  style={{
                    height: '380px',
                    background: 'rgba(11,31,58,0.55)',
                    border: '1px solid rgba(200,149,44,0.22)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  {slides.map((s, i) => (
                    <div
                      key={i}
                      className="absolute transition-opacity duration-700"
                      style={{ inset: '28px', opacity: i === current ? 1 : 0 }}
                    >
                      <Image
                        src={s.image}
                        alt={s.tag}
                        fill
                        className="object-contain object-center"
                        sizes="424px"
                        priority={i === 0}
                      />
                    </div>
                  ))}

                  {/* Top gold shine */}
                  <div
                    className="absolute inset-x-0 top-0 h-px pointer-events-none"
                    style={{ background: 'linear-gradient(to right, transparent, rgba(200,149,44,0.4), transparent)' }}
                  />

                  {/* Floating category badge */}
                  <div
                    key={`ftag-${textKey}`}
                    className="slide-text-enter absolute top-3.5 right-3.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                    style={{
                      background: 'rgba(11,31,58,0.90)',
                      border: '1px solid rgba(200,149,44,0.45)',
                      color: 'var(--gold-light)',
                      backdropFilter: 'blur(8px)',
                      animationDelay: '280ms',
                      zIndex: 5,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
                    {slide.tag}
                  </div>

                  {/* Bottom inner vignette */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(11,31,58,0.5), transparent)' }}
                  />
                </div>

                {/* Gold corner accents */}
                <div className="absolute top-0 left-0 w-6 h-6 pointer-events-none"
                  style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)', borderRadius: '14px 0 0 0', opacity: 0.5 }} />
                <div className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none"
                  style={{ borderBottom: '2px solid var(--gold)', borderRight: '2px solid var(--gold)', borderRadius: '0 0 14px 0', opacity: 0.5 }} />

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Arrow buttons */}
      {[
        { label: 'Previous', action: prev, side: 'left-5', icon: 'M15 19l-7-7 7-7' },
        { label: 'Next', action: next, side: 'right-5', icon: 'M9 5l7 7-7 7' },
      ].map(({ label, action, side, icon }) => (
        <button
          key={label}
          onClick={action}
          aria-label={label}
          className={`absolute ${side} top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105`}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.16)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </button>
      ))}

      {/* ── Bottom navigation bar */}
      <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }}>
        <div className="container-xl pb-8 flex items-end justify-between gap-4">

          {/* Slide tabs */}
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-300"
                style={{
                  background: i === current ? 'rgba(200,149,44,0.2)' : 'rgba(255,255,255,0.07)',
                  border: i === current ? '1px solid rgba(200,149,44,0.5)' : '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full transition-colors"
                  style={{ background: i === current ? 'var(--gold)' : 'rgba(255,255,255,0.38)' }}
                />
                <span
                  className="text-xs font-semibold tracking-wide hidden sm:block transition-colors"
                  style={{ color: i === current ? 'var(--gold-light)' : 'rgba(255,255,255,0.45)' }}
                >
                  {s.tag}
                </span>
              </button>
            ))}
          </div>

          {/* Slide counter */}
          <div className="text-xs font-mono tracking-widest pb-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <span style={{ color: 'rgba(255,255,255,0.80)' }}>{String(current + 1).padStart(2, '0')}</span>
            {' / '}
            {String(slides.length).padStart(2, '0')}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.10)' }}>
          <div
            key={progressKey}
            className="slide-progress-bar h-full"
            style={{
              background: 'var(--gold)',
              animationDuration: `${DURATION}ms`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
