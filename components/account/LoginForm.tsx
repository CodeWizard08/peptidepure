'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Field, PasswordField } from './AccountPrimitives';
import { MailIcon } from './AccountIcons';

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else if (data.user?.app_metadata?.role === 'admin') { router.push('/admin'); }
    else { router.refresh(); }
  };

  const handleResetPassword = async () => {
    if (!email) { setError('Enter your email address first, then click "Lost your password?"'); return; }
    setError(''); setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/auth/callback?next=/account/reset-password`,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to send reset email');
      }
      setEmail(''); setPassword('');
      setSuccessMsg('Password reset email sent — check your inbox (and spam folder).');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="rounded-3xl p-8 md:p-10 relative overflow-hidden" style={{ background: 'white', border: '1px solid rgba(11,31,58,0.08)', boxShadow: '0 8px 40px rgba(11,31,58,0.07)' }}>
      <div className="absolute left-0 right-0 top-0 h-1 rounded-t-3xl" style={{ background: 'linear-gradient(to right, var(--gold), var(--gold-light), var(--gold))' }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: 'var(--gold-pale)', border: '1px solid rgba(200,149,44,0.3)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gold)' }}>Returning Clinician</span>
        </div>
        <h2 className="text-2xl font-black" style={{ color: 'var(--navy)', letterSpacing: '-0.02em' }}>Sign In</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>Access your verified clinician account</p>
        <div className="mt-3 flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-xs leading-relaxed" style={{ background: 'rgba(200,149,44,0.08)', border: '1px solid rgba(200,149,44,0.2)', color: 'var(--text-mid)' }}>
          <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong style={{ color: 'var(--navy)' }}>Previous WordPress customers:</strong>{' '}
            Please register a new account using the same email address. Your order history will be linked automatically.
          </span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Field label="Email" type="email" placeholder="Email address" icon={<MailIcon />} value={email} onChange={setEmail} required />
        <PasswordField label="Password" placeholder="Password" value={password} onChange={setPassword} />

        {successMsg && (
          <div className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)', color: '#065F46' }}>{successMsg}</div>
        )}
        {error && (
          <div className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', color: '#DC2626' }}>{error}</div>
        )}

        <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{ background: loading ? 'var(--text-light)' : 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)', boxShadow: loading ? 'none' : '0 4px 20px rgba(200,149,44,0.35)', letterSpacing: '0.02em', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Signing in…' : 'Log In'}
        </button>

        <p className="text-center text-xs" style={{ color: 'var(--text-light)' }}>
          <button type="button" onClick={handleResetPassword} className="underline transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>
            Lost your password?
          </button>
        </p>
      </form>

      <div className="flex items-center gap-3 my-7">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs" style={{ color: 'var(--text-light)' }}>New to PeptidePure?</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>
      <button type="button" className="w-full text-center text-xs underline underline-offset-2 transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}
        onClick={() => document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth' })}>
        Create an account using the registration form →
      </button>

      <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {['cGMP Compliant', 'Clinician Only', 'IRB Aligned'].map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <svg className="w-3 h-3 shrink-0" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium" style={{ color: 'var(--text-mid)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
