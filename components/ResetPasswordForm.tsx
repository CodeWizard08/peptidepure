'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordForm() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); setTimeout(() => router.push('/account'), 2000); }
  };

  const inputStyle = { background: 'rgba(11,31,58,0.04)', border: '1px solid rgba(11,31,58,0.1)' };
  const lockIcon = (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--off-white)' }}>
      <div className="w-full max-w-md rounded-3xl p-8 md:p-10" style={{ background: 'white', border: '1px solid rgba(11,31,58,0.08)', boxShadow: '0 8px 40px rgba(11,31,58,0.07)' }}>
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex mb-6"><img src="/logo.webp" alt="PeptidePure™" style={{ height: '32px', width: 'auto' }} /></Link>
          <h1 className="text-2xl font-black" style={{ color: 'var(--navy)', letterSpacing: '-0.02em' }}>Reset Password</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>Enter your new password below.</p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <svg className="w-8 h-8" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--navy)' }}>Password Updated</h3>
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>Redirecting to your account...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div className="relative flex items-center rounded-xl transition-all duration-200" style={inputStyle}>
              <span className="absolute left-4" style={{ color: 'var(--text-light)' }}>{lockIcon}</span>
              <input type={showPassword ? 'text' : 'password'} placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="New Password" className="w-full py-3.5 text-sm bg-transparent focus:outline-none" style={{ paddingLeft: '2.75rem', paddingRight: '3rem', color: 'var(--text-dark)' }} />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 p-1 rounded" style={{ color: showPassword ? 'var(--gold)' : 'var(--text-light)' }} tabIndex={-1}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />}
                </svg>
              </button>
            </div>
            {/* Confirm password */}
            <div className="relative flex items-center rounded-xl transition-all duration-200" style={inputStyle}>
              <span className="absolute left-4" style={{ color: 'var(--text-light)' }}>{lockIcon}</span>
              <input type={showPassword ? 'text' : 'password'} placeholder="Confirm New Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-label="Confirm New Password" className="w-full py-3.5 text-sm bg-transparent focus:outline-none" style={{ paddingLeft: '2.75rem', paddingRight: '1rem', color: 'var(--text-dark)' }} />
            </div>
            {error && <div className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', color: '#DC2626' }}>{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]" style={{ background: loading ? 'var(--text-light)' : 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)', boxShadow: loading ? 'none' : '0 4px 20px rgba(200,149,44,0.35)', letterSpacing: '0.02em', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
