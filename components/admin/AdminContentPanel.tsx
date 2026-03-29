'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ContentField, { humanize, updateAtPath } from './ContentField';

const PAGES = [
  { key: 'home', label: 'Home' },
  { key: 'hero-slider', label: 'Hero Slider' },
  { key: 'peptides', label: 'Peptides' },
  { key: 'how-it-works', label: 'How It Works' },
  { key: 'our-company', label: 'Our Company' },
  { key: 'coa', label: 'COA' },
  { key: 'contact', label: 'Contact' },
  { key: 'footer', label: 'Footer' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'terms', label: 'Terms & Conditions' },
  { key: 'shipping', label: 'Shipping & Payments' },
  { key: 'refunds', label: 'Refunds & Returns' },
  { key: 'accessibility', label: 'Accessibility' },
  { key: 'peptide-dosing-safety', label: 'Dosing & Safety' },
  { key: 'how-to-get-started', label: 'Getting Started' },
];

export default function AdminContentPanel() {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchContent = useCallback(async (page: string) => {
    setLoading(true);
    setContent(null);
    try {
      const res = await fetch(`/api/content?page=${page}`);
      if (!res.ok) throw new Error('Failed to load');
      setContent(await res.json());
    } catch {
      setToast({ type: 'error', message: 'Failed to load content' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent(activePage);
  }, [activePage, fetchContent]);

  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(id);
    }
  }, [toast]);

  const checkScroll = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = tabsRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scrollTabs = (dir: 'left' | 'right') => {
    tabsRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/content?page=${activePage}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (!res.ok) throw new Error();
      setToast({ type: 'success', message: 'Saved! Refresh your page to see changes.' });
    } catch {
      setToast({ type: 'error', message: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (path: string[], value: unknown) => {
    setContent((prev) => {
      if (!prev) return prev;
      if (path.length === 0) return value as Record<string, unknown>;
      return updateAtPath(prev, path, value);
    });
  };

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100%' }}>
      {/* Page sub-nav tabs */}
      <div
        className="sticky top-0 z-10"
        style={{ background: 'white', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>
              Content Editor
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-light)' }}>
              Edit page text content stored in JSON files
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading || !content}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{
              background: saving ? 'var(--text-light)' : 'var(--gold)',
              opacity: saving || loading || !content ? 0.6 : 1,
              cursor: saving || loading || !content ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save Page'}
          </button>
        </div>
        {/* Tab bar with scroll arrows */}
        <div className="relative flex items-end px-8">
          {canScrollLeft && (
            <button
              onClick={() => scrollTabs('left')}
              className="absolute left-0 z-10 flex items-center justify-center w-8 h-full top-0"
              style={{
                background: 'linear-gradient(to right, white 60%, transparent)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--navy)' }}>
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <div
            ref={tabsRef}
            className="flex overflow-x-auto gap-1 pb-0 w-full"
            style={{ scrollbarWidth: 'none' }}
          >
            {PAGES.map((page) => (
              <button
                key={page.key}
                onClick={() => setActivePage(page.key)}
                className="shrink-0 px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg"
                style={{
                  color: activePage === page.key ? 'var(--gold)' : 'var(--text-mid)',
                  background: activePage === page.key ? 'var(--gold-pale)' : 'transparent',
                  borderBottom: activePage === page.key ? '2px solid var(--gold)' : '2px solid transparent',
                  fontWeight: activePage === page.key ? 600 : 400,
                }}
              >
                {page.label}
              </button>
            ))}
          </div>
          {canScrollRight && (
            <button
              onClick={() => scrollTabs('right')}
              className="absolute right-0 z-10 flex items-center justify-center w-8 h-full top-0"
              style={{
                background: 'linear-gradient(to left, white 60%, transparent)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--navy)' }}>
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content editor area */}
      <div className="p-8 max-w-3xl">
        <div
          className="text-xs font-semibold uppercase tracking-widest mb-6 flex items-center gap-2"
          style={{ color: 'var(--text-light)' }}
        >
          <span style={{ color: 'var(--gold)' }}>■</span>
          {PAGES.find((p) => p.key === activePage)?.label} — {activePage}.json
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 rounded-full animate-spin"
              style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>
              Loading content…
            </p>
          </div>
        ) : content ? (
          Object.entries(content).map(([key, value]) => (
            <ContentField
              key={key}
              label={humanize(key)}
              path={[key]}
              value={value}
              onChange={handleChange}
              depth={0}
            />
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>
              No content loaded
            </p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{
            background: toast.type === 'success' ? '#059669' : '#DC2626',
            color: 'white',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
