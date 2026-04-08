'use client';

/**
 * StockNotificationForm
 *
 * Email capture form shown only on out-of-stock products.
 * POSTs to /api/inventory-notifications.
 *
 * States: idle → loading → success | error
 */

import { useState } from 'react';

export default function StockNotificationForm({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'loading' || !email.trim()) return;

    setState('loading');
    setMessage('');

    try {
      const res = await fetch('/api/inventory-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setState('success');
        setMessage(data.message || 'Subscribed.');
        setEmail('');
      } else {
        setState('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setState('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'linear-gradient(135deg, #FEF2F2 0%, #fff5f5 100%)',
        border: '1px solid #FECACA',
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)' }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-0.5" style={{ color: '#991B1B' }}>
            Out of Stock
          </p>
          <p className="text-sm font-bold leading-snug" style={{ color: 'var(--navy)' }}>
            Get notified when {productName} is back
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-mid)' }}>
            We'll send you a one-time email the moment this product is restocked.
          </p>
        </div>
      </div>

      {state === 'success' ? (
        <div
          className="rounded-lg px-4 py-3 text-xs font-medium"
          style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.3)',
            color: '#065F46',
          }}
        >
          ✓ {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@clinic.com"
            required
            disabled={state === 'loading'}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none transition-colors disabled:opacity-50"
            style={{
              background: 'white',
              border: '1px solid var(--border)',
              color: 'var(--navy)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--gold)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          <button
            type="submit"
            disabled={state === 'loading' || !email.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--navy)', color: 'white' }}
          >
            {state === 'loading' ? 'Sending…' : 'Notify Me'}
          </button>
        </form>
      )}

      {state === 'error' && (
        <p className="text-xs mt-2" style={{ color: '#DC2626' }}>
          {message}
        </p>
      )}
    </div>
  );
}
