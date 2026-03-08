'use client';

import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Use local worker from public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerProps {
  src: string;
}

export default function PDFViewer({ src }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function renderPDF() {
      if (!containerRef.current) return;
      setLoading(true);

      const container = containerRef.current;
      // Clear previous renders
      container.innerHTML = '';

      try {
        const pdf = await pdfjsLib.getDocument(src).promise;
        if (cancelled) return;

        setPageCount(pdf.numPages);

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;

          const page = await pdf.getPage(i);
          const scale = 2; // High-res rendering
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
          canvas.style.display = 'block';
          // Prevent drag-to-save
          canvas.draggable = false;
          canvas.style.userSelect = 'none';
          canvas.style.pointerEvents = 'none';

          container.appendChild(canvas);

          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, canvas, viewport } as any).promise;
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to render PDF:', err);
          container.innerHTML = '<p style="color:#999;text-align:center;padding:2rem;">Failed to load PDF</p>';
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    renderPDF();
    return () => { cancelled = true; };
  }, [src]);

  return (
    <div
      className="w-full h-full overflow-auto"
      style={{ background: '#525659' }}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        // Block Ctrl+S, Ctrl+P
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
          e.preventDefault();
        }
      }}
      tabIndex={0}
    >
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-gray-400">Loading PDF...</div>
        </div>
      )}
      <div
        ref={containerRef}
        className="max-w-4xl mx-auto"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      />
      {!loading && pageCount > 0 && (
        <div className="text-center py-3 text-xs text-gray-500">
          {pageCount} page{pageCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
