'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import HexLogo from '@/components/ui/HexLogo';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount] = useState(0);

  const pathname = usePathname();
  const isHome = pathname === '/';
  // Glass mode: transparent header overlaying the hero, switches to solid on scroll
  const glass = isHome && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'All Peptides', href: '/peptides' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Our Company', href: '/our-company' },
    { label: 'COA', href: '/coa' },
    { label: 'Contact Us', href: '/contact' },
  ];

  return (
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
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <HexLogo width={32} height={36} />
            <span
              className="font-bold text-xl tracking-tight transition-colors duration-300"
              style={{ color: glass ? 'white' : 'var(--navy)' }}
            >
              PEPTIDE<span style={{ color: 'var(--gold)' }}>PURE</span>
              <sup className="text-xs font-normal ml-0.5" style={{ color: glass ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }}>™</sup>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  glass ? 'hover:bg-white/10' : 'hover:bg-gray-50'
                }`}
                style={{ color: glass ? 'rgba(255,255,255,0.82)' : 'var(--text-dark)' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
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
              Sign In
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
              ${cartCount.toFixed(2)}
            </Link>
            <Link href="/peptides" className="btn-primary text-sm py-2 px-4">
              Get Started
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-md"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 space-y-1.5">
              <span className={`block h-0.5 transition-all duration-200 ${glass ? 'bg-white' : 'bg-gray-700'} ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 transition-all duration-200 ${glass ? 'bg-white' : 'bg-gray-700'} ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 transition-all duration-200 ${glass ? 'bg-white' : 'bg-gray-700'} ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu — always solid white */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="container-xl py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50"
                style={{ color: 'var(--text-dark)' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex gap-2">
              <Link href="/account" className="btn-outline text-sm flex-1 justify-center" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
              <Link href="/peptides" className="btn-primary text-sm flex-1 justify-center" onClick={() => setMobileOpen(false)}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

