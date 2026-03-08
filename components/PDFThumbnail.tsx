'use client';

import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFThumbnailProps {
  src: string;
}

export default function PDFThumbnail({ src }: PDFThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const pdf = await pdfjsLib.getDocument(src).promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        // Render at a size that fits the card thumbnail area
        const desiredWidth = 400;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = desiredWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, canvas, viewport } as any).promise;

        if (!cancelled) setLoaded(true);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [src]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--navy)', opacity: 0.3 }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--navy)', borderTopColor: 'transparent' }} />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover object-top"
        style={{
          display: loaded ? 'block' : 'none',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        draggable={false}
      />
    </>
  );
}
