'use client';

import { useState } from 'react';
import Link from 'next/link';

export const FIELD_COLOR = 'var(--navy)';
export const LABEL_COLOR = 'var(--text-mid)';
export const REQUIRED = <span style={{ color: 'var(--gold)' }}>*</span>;

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold mb-1.5" style={{ color: FIELD_COLOR }}>
      {children}{required && <> {REQUIRED}</>}
    </label>
  );
}

export function RadioGroup({ name, options, required }: { name: string; options: string[]; required?: boolean }) {
  return (
    <div className="space-y-2.5 mt-1">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
          <input type="radio" name={name} value={opt} required={required} />
          <span className="text-sm" style={{ color: LABEL_COLOR }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

export function CheckboxGroup({ name, options }: { name: string; options: string[] }) {
  return (
    <div className="space-y-2.5 mt-1">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" name={name} value={opt} />
          <span className="text-sm" style={{ color: LABEL_COLOR }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

export function Divider() {
  return <hr style={{ borderColor: 'var(--border)', margin: '0.5rem 0' }} />;
}

export function ScaleSelector({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="flex gap-2 mt-1.5 flex-wrap">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <label key={n} className="cursor-pointer">
            <input type="radio" name={name} value={n} required={required} className="sr-only peer" />
            <span
              className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border peer-checked:text-white transition-colors"
              style={{
                borderColor: 'var(--border)',
                color: LABEL_COLOR,
              }}
            >
              {n}
            </span>
            <style>{`
              input[name="${name}"]:checked + span {
                background: var(--navy) !important;
                border-color: var(--navy) !important;
                color: white !important;
              }
            `}</style>
          </label>
        ))}
      </div>
      <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-light)' }}>
        <span>None</span>
        <span>Worst possible</span>
      </div>
    </div>
  );
}

export function FormSuccessScreen({
  title,
  message,
  resetHref,
  onReset,
}: {
  title: string;
  message: string;
  resetHref: string;
  onReset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--off-white)' }}>
      <div className="text-center max-w-md px-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(200,149,44,0.1)', border: '2px solid var(--gold)' }}
        >
          <svg className="w-8 h-8" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--navy)' }}>{title}</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-mid)' }}>{message}</p>
        <Link href={resetHref} onClick={onReset} className="btn-primary">
          Submit Another
        </Link>
      </div>
    </div>
  );
}

export function FormHeader({
  breadcrumb,
  title,
  subtitle,
}: {
  breadcrumb: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="py-12" style={{ background: 'var(--navy)' }}>
      <div className="container-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
            {breadcrumb}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>{subtitle}</p>
      </div>
    </div>
  );
}

export function useFormSubmit(formType: string) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    fd.forEach((value, key) => {
      if (data[key]) {
        const existing = data[key];
        data[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
      } else {
        data[key] = value;
      }
    });

    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType, data }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Submission failed');
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return { submitted, submitting, error, setSubmitted, handleSubmit };
}
