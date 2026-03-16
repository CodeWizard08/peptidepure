'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatDate } from '@/lib/format';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false });
const PDFThumbnail = dynamic(() => import('./PDFThumbnail'), { ssr: false });

interface COARecord {
  compound: string;
  peptide: string;
  lab: string;
  purity: string;
  batch: string;
  date: string;
  pdf: string;
}

interface SummaryEntry {
  compound: string;
  lab?: string;
  date: string;
  purity: number;
}

interface COAContent {
  hero: { sectionLabel: string; heading: string; subtitle: string };
  qualityBadges: { label: string; value: string }[];
  gridHeading: string;
  filterLabel: string;
  sortLabel: string;
  records: COARecord[];
  summaryChart?: SummaryEntry[];
  footerText: string;
}

export default function COAGallery({ content }: { content: COAContent }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortNewest, setSortNewest] = useState(true);
  const [lightbox, setLightbox] = useState<COARecord | null>(null);

  // Derive unique peptide categories
  const categories = useMemo(() => {
    const unique = Array.from(new Set(content.records.map((r) => r.peptide)));
    unique.sort();
    return ['All', ...unique];
  }, [content.records]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = content.records;
    if (activeFilter !== 'All') {
      list = list.filter((r) => r.peptide === activeFilter);
    }
    return [...list].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortNewest ? db - da : da - db;
    });
  }, [content.records, activeFilter, sortNewest]);

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      // Block Ctrl+S (save) and Ctrl+P (print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [lightbox]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);


  return (
    <>
      {/* Hero */}
      <section className="py-20" style={{ background: 'var(--navy)' }}>
        <div className="container-xl text-center">
          <span className="section-label text-yellow-300">{content.hero.sectionLabel}</span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4">
            {content.hero.heading}
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            {content.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Quality badges */}
      <section
        className="py-8"
        style={{ background: 'var(--gold-pale)', borderBottom: '1px solid rgba(200,149,44,0.2)' }}
      >
        <div className="container-xl">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {content.qualityBadges.map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>{item.value}</div>
                <div className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-mid)' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Purity Summation Chart */}
      {content.summaryChart && content.summaryChart.length > 0 && (
        <section className="py-16" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="container-xl">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--navy)' }}>
              Purity Summary
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--text-light)' }}>
              Independent lab results across all tested compounds
            </p>

            <div className="overflow-auto rounded-xl" style={{ border: '1px solid var(--border)', maxHeight: 480 }}>
              <table className="w-full text-sm" style={{ minWidth: 540 }}>
                <thead className="sticky top-0 z-10">
                  <tr style={{ background: 'var(--navy)' }}>
                    <th className="text-left px-4 py-3 font-semibold text-white">Compound</th>
                    <th className="text-left px-4 py-3 font-semibold text-white">Date Tested</th>
                    <th className="text-right px-4 py-3 font-semibold" style={{ color: 'var(--gold-light)' }}>Purity</th>
                  </tr>
                </thead>
                <tbody>
                  {content.summaryChart.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        background: i % 2 === 0 ? 'white' : 'var(--off-white)',
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--navy)' }}>
                        {row.compound}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-mid)' }}>
                        {formatDate(row.date)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div
                            className="hidden sm:block h-2 rounded-full"
                            style={{
                              width: `${Math.max((row.purity - 99) * 100, 8)}px`,
                              background: row.purity > 99 ? '#16a34a' : row.purity >= 99 ? 'var(--gold)' : '#f59e0b',
                              maxWidth: 100,
                            }}
                          />
                          <span className="font-bold tabular-nums" style={{ color: 'var(--navy)' }}>
                            {row.purity.toFixed(3)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Filter bar + Grid */}
      <section className="py-16">
        <div className="container-xl">
          {/* Header row */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
                {content.gridHeading}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
                {filtered.length} certificate{filtered.length !== 1 ? 's' : ''} shown
              </p>
            </div>
            {/* Date sort toggle */}
            <button
              onClick={() => setSortNewest((p) => !p)}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              style={{
                background: 'var(--off-white)',
                color: 'var(--navy)',
                border: '1px solid var(--border)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1v12M7 1L3 5M7 1l4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transform: sortNewest ? 'none' : 'rotate(180deg)', transformOrigin: 'center' }}
                />
              </svg>
              {sortNewest ? 'Newest First' : 'Oldest First'}
            </button>
          </div>

          {/* Filter pills */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: activeFilter === cat ? 'var(--navy)' : 'white',
                  color: activeFilter === cat ? 'var(--gold-light)' : 'var(--text-mid)',
                  border: activeFilter === cat
                    ? '1px solid var(--navy)'
                    : '1px solid var(--border)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* COA Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                No certificates match this filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((coa, i) => (
                <button
                  key={coa.batch + i}
                  onClick={() => setLightbox(coa)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm card-hover text-left transition-shadow hover:shadow-md"
                  style={{ border: '1px solid var(--border)' }}
                >
                  {/* PDF thumbnail preview */}
                  <div
                    className="relative aspect-4/3 overflow-hidden"
                    style={{ background: '#f5f0eb' }}
                  >
                    <PDFThumbnail src={coa.pdf} />
                    {/* Purity badge */}
                    <span
                      className="absolute top-3 right-3 text-xs px-2 py-1 rounded-md font-semibold"
                      style={{ background: 'rgba(11,31,58,0.85)', color: 'var(--gold)' }}
                    >
                      {coa.purity}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3
                      className="text-sm font-bold mb-1 leading-snug"
                      style={{ color: 'var(--navy)' }}
                    >
                      {coa.compound}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                        {coa.lab}
                      </span>
                      <span className="text-xs font-mono" style={{ color: 'var(--text-light)' }}>
                        {coa.batch}
                      </span>
                    </div>
                    <div
                      className="mt-2 text-xs font-medium"
                      style={{ color: 'var(--text-mid)' }}
                    >
                      {formatDate(coa.date)}
                    </div>
                    <span
                      className="mt-3 block w-full py-2 rounded-lg text-xs font-semibold text-center"
                      style={{
                        background: 'var(--off-white)',
                        color: 'var(--navy)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      View COA
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>
              {content.footerText}{' '}
              <a href="/contact" className="underline" style={{ color: 'var(--gold)' }}>
                Contact us
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Full-screen PDF Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: 'rgba(11,31,58,0.95)' }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Top bar */}
          <div
            className="shrink-0 flex items-center justify-between px-5 py-3"
            style={{ background: 'var(--navy)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-4 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">
                {lightbox.compound}
              </h3>
              <span className="hidden sm:inline text-xs text-gray-400 truncate">
                {lightbox.lab} · {lightbox.batch} · {formatDate(lightbox.date)}
              </span>
              <span
                className="hidden sm:inline text-xs px-2.5 py-1 rounded-full font-semibold shrink-0"
                style={{ background: 'rgba(200,149,44,0.15)', color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)' }}
              >
                {lightbox.purity}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setLightbox(null)}
                className="w-9 h-9 cursor-pointer flex items-center justify-center rounded-lg text-sm font-bold transition-colors text-white"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* PDF viewer — renders as canvas images, no native PDF controls */}
          <div className="flex-1 min-h-0">
            <PDFViewer src={lightbox.pdf} />
          </div>
        </div>
      )}
    </>
  );
}
