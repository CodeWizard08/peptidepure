'use client';

import { useState } from 'react';
import { EyeIcon } from './AccountIcons';

export function Field({
  label,
  type = 'text',
  placeholder,
  icon,
  value,
  onChange,
  rightSlot,
  required,
}: {
  label: string;
  type?: string;
  placeholder: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  rightSlot?: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="group">
      <div
        className="relative flex items-center rounded-xl transition-all duration-200"
        style={{ background: 'rgba(11,31,58,0.04)', border: '1px solid rgba(11,31,58,0.1)' }}
      >
        {icon && <span className="absolute left-4 transition-colors duration-200" style={{ color: 'var(--text-light)' }}>{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          required={required}
          className="w-full py-3.5 text-sm bg-transparent focus:outline-none transition-colors"
          style={{ paddingLeft: icon ? '2.75rem' : '1rem', paddingRight: rightSlot ? '3rem' : '1rem', color: 'var(--text-dark)' }}
          onFocus={(e) => {
            const parent = e.currentTarget.closest('.group > div') as HTMLElement | null;
            if (parent) { parent.style.border = '1px solid var(--gold)'; parent.style.background = 'rgba(200,149,44,0.03)'; parent.style.boxShadow = '0 0 0 3px rgba(200,149,44,0.08)'; }
          }}
          onBlur={(e) => {
            const parent = e.currentTarget.closest('.group > div') as HTMLElement | null;
            if (parent) { parent.style.border = '1px solid rgba(11,31,58,0.1)'; parent.style.background = 'rgba(11,31,58,0.04)'; parent.style.boxShadow = 'none'; }
          }}
        />
        {rightSlot && <span className="absolute right-3">{rightSlot}</span>}
      </div>
    </div>
  );
}

export function PasswordField({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <Field
      label={label}
      type={show ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      icon={
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      }
      rightSlot={
        <button type="button" onClick={() => setShow((s) => !s)} className="p-1 rounded transition-colors" style={{ color: show ? 'var(--gold)' : 'var(--text-light)' }} tabIndex={-1}>
          <EyeIcon open={show} />
        </button>
      }
    />
  );
}
