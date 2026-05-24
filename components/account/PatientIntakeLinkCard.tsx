'use client';

import { useState, useEffect } from 'react';

interface Props {
  userId: string;
  displayName: string;
}

export default function PatientIntakeLinkCard({ userId, displayName }: Props) {
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const link = origin ? `${origin}/p/intake?ref=${userId}` : `/p/intake?ref=${userId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable on iOS Safari over http or in
      // sandboxed iframes — fall back to a select-all on the input.
      const input = document.getElementById('intake-share-link') as HTMLInputElement | null;
      input?.select();
      document.execCommand?.('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const emailSubject = `Patient intake for ${displayName} — PeptidePure`;
  const emailBody = `Hi,\n\n${displayName} has asked me to share this short intake form. It takes about 3 minutes and lets our clinical team review your goals before your consult.\n\n${link}\n\nThanks,\nPeptidePure`;
  const mailto = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <div
      className="rounded-2xl p-6 md:p-7"
      style={{
        background: 'linear-gradient(135deg, rgba(11,31,58,0.97) 0%, rgba(6,17,46,0.97) 100%)',
        border: '1px solid rgba(200,149,44,0.35)',
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: 'var(--gold)' }}>
            Send to your patients
          </p>
          <h3 className="text-lg font-bold text-white">Your personal intake link</h3>
          <p className="text-xs mt-1.5 max-w-md" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Share this link with a patient before their first consult. Submissions show up under <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Patient Intakes</strong> in the admin panel, attributed to you.
          </p>
        </div>
      </div>

      <div
        className="flex items-stretch rounded-xl overflow-hidden mt-4"
        style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <input
          id="intake-share-link"
          type="text"
          value={link}
          readOnly
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 px-4 py-2.5 text-xs font-mono bg-transparent focus:outline-none truncate min-w-0"
          style={{ color: 'rgba(255,255,255,0.95)' }}
          aria-label="Patient intake share link"
        />
        <button
          onClick={copy}
          className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors whitespace-nowrap"
          style={{
            background: copied ? '#10B981' : 'var(--gold)',
            color: copied ? 'white' : 'var(--navy)',
          }}
        >
          {copied ? '✓ Copied' : 'Copy link'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <a
          href={mailto}
          className="text-xs font-semibold px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email a patient
        </a>
        <a
          href={`/p/intake?ref=${userId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          Preview as patient
        </a>
      </div>
    </div>
  );
}
