'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/contexts/CartContext';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formsOpen, setFormsOpen] = useState(false);
  const formsCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mobileFormsOpen, setMobileFormsOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { cartCount, cartTotal } = useCart();

  const supabase = createClient();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAdminRoute = pathname.startsWith('/admin');
  const showBanner = !bannerDismissed && !isAdminRoute;
  const glass = isHome && !scrolled;

  // Restore banner dismissed state from sessionStorage and sync --nav-h immediately
  useEffect(() => {
    const dismissed = sessionStorage.getItem('pp_banner_dismissed') === '1';
    if (dismissed) {
      setBannerDismissed(true);
      document.documentElement.style.setProperty('--nav-h', '64px');
    }
    // if not dismissed, CSS default (100px) is already correct
  }, []);

  // Keep --nav-h in sync whenever banner is dismissed mid-session
  useEffect(() => {
    document.documentElement.style.setProperty('--nav-h', showBanner ? '100px' : '64px');
  }, [showBanner]);

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
    sessionStorage.setItem('pp_banner_dismissed', '1');
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMobileFormsOpen(false);
    setFormsOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setMobileFormsOpen(false);
  }, []);

  const navLinks = [
    { label: 'All Peptides', href: '/peptides', section: 'main' as const },
    { label: 'Our Company', href: '/our-company', section: 'main' as const },
    { label: 'COA', href: '/coa', section: 'main' as const },
    { label: 'How It Works', href: '/how-it-works', section: 'main' as const, requiresAuth: true },
    { label: 'Contact Us', href: '/contact', section: 'main' as const },
    { label: 'Inventory', href: '/inventory', section: 'more' as const, requiresAuth: true },
    { label: 'Getting Started', href: '/how-to-get-started', section: 'more' as const },
    { label: 'Legality', href: '/legality', section: 'more' as const },
  ];

  const visibleNavLinks = navLinks.filter((link) => !link.requiresAuth || user);
  const mainNavLinks = visibleNavLinks.filter((link) => link.section === 'main');
  const secondaryNavLinks = visibleNavLinks.filter((link) => link.section === 'more');

  const formLinks = [
    { label: 'SOAP Data Capture', href: '/forms/soap-capture' },
    { label: 'IRB — Baseline', href: '/forms/baseline' },
    { label: 'IRB — Treatment Log', href: '/forms/treatment-log' },
    { label: 'IRB — AE / SAE Report', href: '/forms/ae-sae-report' },
    { label: 'Patient Outcomes', href: '/forms/outcomes' },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={
          glass
            ? {
                background: 'rgba(11,31,58,0.18)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }
            : scrolled
            ? { background: 'white', boxShadow: '0 2px 20px rgba(0,0,0,0.08)', borderBottom: '1px solid transparent' }
            : { background: 'white', borderBottom: '1px solid #e5e7eb' }
        }
      >
        <div className="container-xl">
          <div className="flex items-center justify-between" style={{ height: '64px' }}>
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image src="/logo.webp" alt="PeptidePure™" width={140} height={36} priority style={{ height: '36px', width: 'auto' }} />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    pathname === link.href ? (glass ? 'bg-white/15' : 'bg-gray-100') : ''
                  } ${glass ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
                  style={{ color: glass ? 'rgba(255,255,255,0.82)' : 'var(--text-dark)' }}
                >
                  {link.label}
                </Link>
              ))}
              {secondaryNavLinks.length > 0 && (
                <div
                  className="relative"
                  onMouseEnter={() => {
                    if (moreCloseTimer.current) clearTimeout(moreCloseTimer.current);
                    setMoreOpen(true);
                  }}
                  onMouseLeave={() => {
                    moreCloseTimer.current = setTimeout(() => setMoreOpen(false), 150);
                  }}
                >
                  <button
                    className={`px-3.5 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1 ${
                      glass ? 'hover:bg-white/10' : 'hover:bg-gray-50'
                    }`}
                    style={{ color: glass ? 'rgba(255,255,255,0.82)' : 'var(--text-dark)' }}
                  >
                    More
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {moreOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl py-1.5 z-50"
                      style={{ border: '1px solid var(--border)', minWidth: '12rem' }}
                    >
                      {secondaryNavLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: pathname === item.href ? 'var(--gold)' : 'var(--text-dark)' }}
                          onClick={() => setMoreOpen(false)}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: 'var(--gold)' }}
                          />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {user && (
                <div
                  className="relative"
                  onMouseEnter={() => {
                    if (formsCloseTimer.current) clearTimeout(formsCloseTimer.current);
                    setFormsOpen(true);
                  }}
                  onMouseLeave={() => {
                    formsCloseTimer.current = setTimeout(() => setFormsOpen(false), 150);
                  }}
                >
                  <button
                    className={`px-3.5 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1 ${
                      glass ? 'hover:bg-white/10' : 'hover:bg-gray-50'
                    }`}
                    style={{ color: glass ? 'rgba(255,255,255,0.82)' : 'var(--text-dark)' }}
                  >
                    Data Capture
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${formsOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {formsOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl py-1.5 z-50"
                      style={{ border: '1px solid var(--border)', minWidth: '13rem' }}
                    >
                      <Link
                        href="/forms"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                        style={{ color: 'var(--gold)', borderBottom: '1px solid var(--border)' }}
                        onClick={() => setFormsOpen(false)}
                      >
                        All Data Capture Tools
                      </Link>
                      {formLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: 'var(--text-dark)' }}
                          onClick={() => setFormsOpen(false)}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: 'var(--gold)' }}
                          />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Right actions — desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/account"
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md transition-all duration-200 ${
                  glass ? 'hover:bg-white/10' : 'hover:bg-gray-50'
                }`}
                style={{ color: glass ? 'rgba(255,255,255,0.70)' : 'var(--text-mid)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {user ? (user.user_metadata?.full_name?.split(' ')[0] || 'Account') : 'Sign In'}
              </Link>
              <Link
                href="/cart"
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md transition-all duration-200 relative ${
                  glass ? 'hover:bg-white/10' : 'hover:bg-gray-50'
                }`}
                style={{ color: glass ? 'rgba(255,255,255,0.70)' : 'var(--text-mid)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: 'var(--gold)', minWidth: '18px', height: '18px' }}
                  >
                    {cartCount}
                  </span>
                )}
                ${(cartTotal / 100).toFixed(2)}
              </Link>
              {!user && (
                <Link href="/peptides" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              )}
            </div>

            {/* Mobile right actions (cart + burger) */}
            <div className="flex lg:hidden items-center gap-1">
              {/* Mobile cart icon */}
              <Link
                href="/cart"
                className="relative p-2 rounded-md"
                onClick={closeMobile}
              >
                <svg className="w-5 h-5" fill="none" stroke={glass && !mobileOpen ? 'white' : '#374151'} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span
                    className="absolute top-0.5 right-0.5 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: 'var(--gold)', minWidth: '16px', height: '16px' }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile burger */}
              <button
                className="p-2 rounded-md"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                <div className="w-5 flex flex-col justify-center" style={{ height: '14px' }}>
                  <span
                    className="block h-0.5 rounded-full transition-all duration-300 origin-center"
                    style={{
                      background: glass && !mobileOpen ? 'white' : '#374151',
                      transform: mobileOpen ? 'translateY(3px) rotate(45deg)' : 'none',
                    }}
                  />
                  <span
                    className="block h-0.5 rounded-full transition-all duration-300 my-0.75"
                    style={{
                      background: glass && !mobileOpen ? 'white' : '#374151',
                      opacity: mobileOpen ? 0 : 1,
                      transform: mobileOpen ? 'scaleX(0)' : 'none',
                    }}
                  />
                  <span
                    className="block h-0.5 rounded-full transition-all duration-300 origin-center"
                    style={{
                      background: glass && !mobileOpen ? 'white' : '#374151',
                      transform: mobileOpen ? 'translateY(-3px) rotate(-45deg)' : 'none',
                    }}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Announcement banner — below header */}
      {showBanner && (
        <div
          className="fixed left-0 right-0 z-49 transition-all duration-300"
          style={{ top: '64px', zIndex: 49 }}
        >
          <div
            style={{
              background: 'var(--navy)',
              borderBottom: '1px solid rgba(200,149,44,0.3)',
            }}
          >
            <div className="container-xl flex items-center justify-center gap-3 py-2 px-4 relative">
              <p className="text-xs sm:text-sm text-center" style={{ color: 'rgba(255,255,255,0.9)' }}>
                <span className="font-semibold" style={{ color: 'var(--gold)' }}>$1,000 minimum order</span>
                <span className="mx-1.5 hidden sm:inline" style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                <span className="hidden sm:inline">Orders under $1,000 require manual processing. Email </span>
                <a
                  href="mailto:info@peptidepure.com"
                  className="underline underline-offset-2 hover:no-underline"
                  style={{ color: 'var(--gold)' }}
                >
                  info@peptidepure.com
                </a>
              </p>
              <button
                onClick={dismissBanner}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 transition-colors"
                aria-label="Dismiss banner"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="rgba(255,255,255,0.6)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile backdrop overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-300"
        style={{
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
        }}
        onClick={closeMobile}
      />

      {/* Mobile slide-down menu */}
      <div
        className="fixed left-0 right-0 bg-white lg:hidden transition-all duration-300 overflow-hidden"
        style={{
          top: showBanner ? '100px' : '64px',
          maxHeight: mobileOpen ? '100vh' : '0',
          opacity: mobileOpen ? 1 : 0,
          boxShadow: mobileOpen ? '0 10px 40px rgba(0,0,0,0.12)' : 'none',
          zIndex: 45,
        }}
      >
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <div className="px-5 py-5 space-y-1">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] font-medium transition-colors"
                style={{
                  color: pathname === link.href ? 'var(--gold)' : 'var(--text-dark)',
                  background: pathname === link.href ? 'var(--gold-pale)' : 'transparent',
                }}
                onClick={closeMobile}
              >
                {pathname === link.href && (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--gold)' }} />
                )}
                {link.label}
              </Link>
            ))}

            {secondaryNavLinks.length > 0 && (
              <div className="pt-2">
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-light)' }}>
                  More
                </p>
                {secondaryNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      color: pathname === link.href ? 'var(--gold)' : 'var(--text-mid)',
                      background: pathname === link.href ? 'var(--gold-pale)' : 'transparent',
                    }}
                    onClick={closeMobile}
                  >
                    {pathname === link.href && (
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--gold)' }} />
                    )}
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Forms accordion — logged-in users only */}
            {user && (
              <div>
                <button
                  className="flex items-center justify-between w-full px-3 py-3 rounded-lg text-[15px] font-medium transition-colors"
                  style={{ color: 'var(--text-dark)' }}
                  onClick={() => setMobileFormsOpen(!mobileFormsOpen)}
                >
                  <span>Data Capture</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-200"
                    style={{
                      color: 'var(--gold)',
                      transform: mobileFormsOpen ? 'rotate(180deg)' : 'none',
                    }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: mobileFormsOpen ? '400px' : '0',
                    opacity: mobileFormsOpen ? 1 : 0,
                  }}
                >
                  <div className="pl-4 space-y-0.5 pb-1">
                    {formLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
                        style={{
                          color: pathname === item.href ? 'var(--gold)' : 'var(--text-mid)',
                        }}
                        onClick={closeMobile}
                      >
                        <span
                          className="w-1 h-1 rounded-full shrink-0"
                          style={{ background: 'var(--gold)' }}
                        />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="py-2">
              <div className="h-px bg-gray-100" />
            </div>

            {/* Account link */}
            <Link
              href="/account"
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] font-medium transition-colors hover:bg-gray-50"
              style={{ color: 'var(--text-dark)' }}
              onClick={closeMobile}
            >
              <svg className="w-5 h-5" style={{ color: 'var(--text-mid)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {user ? (user.user_metadata?.full_name?.split(' ')[0] || 'My Account') : 'Sign In'}
            </Link>

            {/* Cart summary (if items) */}
            {cartCount > 0 && (
              <Link
                href="/cart"
                className="flex items-center justify-between px-3 py-3 rounded-lg text-[15px] font-medium transition-colors hover:bg-gray-50"
                style={{ color: 'var(--text-dark)' }}
                onClick={closeMobile}
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" style={{ color: 'var(--text-mid)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Cart ({cartCount})
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>
                  ${(cartTotal / 100).toFixed(2)}
                </span>
              </Link>
            )}

            {/* CTA buttons */}
            <div className="pt-2 flex gap-3">
              {!user && (
                <Link
                  href="/account"
                  className="btn-outline text-sm flex-1 text-center py-2.5"
                  onClick={closeMobile}
                >
                  Sign In
                </Link>
              )}
              {!user && (
                <Link
                  href="/peptides"
                  className="btn-primary text-sm flex-1 text-center py-2.5"
                  onClick={closeMobile}
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for banner height so page content isn't hidden behind fixed banner */}
      
    </>
  );
}

