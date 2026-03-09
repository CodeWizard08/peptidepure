'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCents, formatOrderNumber, formatDate } from '@/lib/format';
import type { User } from '@supabase/supabase-js';
import type { Order } from '@/lib/types/order';

// ── Icons ──────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function IdIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
    </svg>
  );
}

function ClinicIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

// ── Form Input ─────────────────────────────────────────────────
function Field({
  label,
  type = 'text',
  placeholder,
  icon,
  value,
  onChange,
  rightSlot,
}: {
  label: string;
  type?: string;
  placeholder: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="group">
      <div
        className="relative flex items-center rounded-xl transition-all duration-200"
        style={{ background: 'rgba(11,31,58,0.04)', border: '1px solid rgba(11,31,58,0.1)' }}
      >
        {icon && (
          <span
            className="absolute left-4 transition-colors duration-200"
            style={{ color: 'var(--text-light)' }}
          >
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="w-full py-3.5 text-sm bg-transparent focus:outline-none transition-colors"
          style={{
            paddingLeft: icon ? '2.75rem' : '1rem',
            paddingRight: rightSlot ? '3rem' : '1rem',
            color: 'var(--text-dark)',
          }}
          onFocus={(e) => {
            const parent = e.currentTarget.closest('.group > div') as HTMLElement | null;
            if (parent) {
              parent.style.border = '1px solid var(--gold)';
              parent.style.background = 'rgba(200,149,44,0.03)';
              parent.style.boxShadow = '0 0 0 3px rgba(200,149,44,0.08)';
            }
          }}
          onBlur={(e) => {
            const parent = e.currentTarget.closest('.group > div') as HTMLElement | null;
            if (parent) {
              parent.style.border = '1px solid rgba(11,31,58,0.1)';
              parent.style.background = 'rgba(11,31,58,0.04)';
              parent.style.boxShadow = 'none';
            }
          }}
        />
        {rightSlot && (
          <span className="absolute right-3">{rightSlot}</span>
        )}
      </div>
    </div>
  );
}

// ── Password Field ─────────────────────────────────────────────
function PasswordField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
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
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="p-1 rounded transition-colors"
          style={{ color: show ? 'var(--gold)' : 'var(--text-light)' }}
          tabIndex={-1}
        >
          <EyeIcon open={show} />
        </button>
      }
    />
  );
}

// ── Logo ───────────────────────────────────────────────────────
function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <img src="/logo.webp" alt="PeptidePure™" style={{ height: '32px', width: 'auto' }} />
    </Link>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function AccountPage() {
  const supabase = createClient();
  const router = useRouter();

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regClinic, setRegClinic] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regNpi, setRegNpi] = useState('');
  const [regFile, setRegFile] = useState<File | null>(null);
  const [regDragging, setRegDragging] = useState(false);
  const [regAgree1, setRegAgree1] = useState(false);
  const [regAgree2, setRegAgree2] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Check session on mount + subscribe to auth changes
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError(error.message);
      setLoginLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: {
        data: {
          full_name: regName,
          clinic: regClinic,
          phone: regPhone,
          npi_number: regNpi,
        },
      },
    });

    if (error) {
      setRegError(error.message);
      setRegLoading(false);
      return;
    }

    // Upload license file if provided
    if (regFile && data.user) {
      const fileExt = regFile.name.split('.').pop();
      const filePath = `${data.user.id}/license.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('licenses')
        .upload(filePath, regFile, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        console.error('License upload failed:', uploadError.message);
      }
    }

    setRegLoading(false);
    setRegSuccess(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  const handleResetPassword = async () => {
    if (!loginEmail) {
      setLoginError('Enter your email address first, then click "Lost your password?"');
      return;
    }
    setLoginError('');
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account/reset-password`,
    });
    if (error) {
      setLoginError(error.message);
    } else {
      setLoginError('');
      setLoginEmail('');
      setLoginPassword('');
      alert('Password reset email sent. Check your inbox.');
    }
  };

  // ── Loading state ──
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--off-white)' }}>
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }}
        />
      </div>
    );
  }

  // ── Logged-in dashboard ──
  if (user) {
    return <Dashboard user={user} onSignOut={handleSignOut} />;
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'var(--off-white)', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Decorative background ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,149,44,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(11,31,58,0.05) 0%, transparent 70%)' }} />
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0B1F3A" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ── Page heading ── */}
        <div className="text-center pt-12 pb-10 px-4">
          <span className="section-label">Clinician Access</span>
          <h1 className="text-3xl md:text-4xl font-black mt-2" style={{ color: 'var(--navy)', letterSpacing: '-0.02em' }}>
            My <span style={{ color: 'var(--gold)' }}>Account</span>
          </h1>
          <p className="text-sm mt-2 max-w-sm mx-auto" style={{ color: 'var(--text-light)' }}>
            Verified access for licensed clinicians, researchers, and wellness practitioners.
          </p>
        </div>

        {/* ── Two-column form layout ── */}
        <div className="flex-1 container-xl pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* ══ LOGIN ══════════════════════════════════════════ */}
            <div
              className="rounded-3xl p-8 md:p-10"
              style={{ background: 'white', border: '1px solid rgba(11,31,58,0.08)', boxShadow: '0 8px 40px rgba(11,31,58,0.07)' }}
            >
              {/* Card header */}
              <div className="mb-8">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                  style={{ background: 'var(--gold-pale)', border: '1px solid rgba(200,149,44,0.3)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
                    Returning Clinician
                  </span>
                </div>
                <h2 className="text-2xl font-black" style={{ color: 'var(--navy)', letterSpacing: '-0.02em' }}>
                  Sign In
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
                  Access your verified clinician account
                </p>
              </div>

              {/* Gold top accent */}
              <div className="absolute left-0 right-0 top-0 h-1 rounded-t-3xl" style={{ background: 'linear-gradient(to right, var(--gold), var(--gold-light), var(--gold))' }} />

              <form onSubmit={handleLogin} className="space-y-4">
                <Field
                  label="Email"
                  type="email"
                  placeholder="Username or Email"
                  icon={<UserIcon />}
                  value={loginEmail}
                  onChange={setLoginEmail}
                />
                <PasswordField
                  label="Password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={setLoginPassword}
                />

                {loginError && (
                  <div
                    className="text-sm px-4 py-3 rounded-xl"
                    style={{
                      background: 'rgba(220,38,38,0.06)',
                      border: '1px solid rgba(220,38,38,0.15)',
                      color: '#DC2626',
                    }}
                  >
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: loginLoading
                      ? 'var(--text-light)'
                      : 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)',
                    boxShadow: loginLoading ? 'none' : '0 4px 20px rgba(200,149,44,0.35)',
                    letterSpacing: '0.02em',
                    opacity: loginLoading ? 0.7 : 1,
                  }}
                >
                  {loginLoading ? 'Signing in…' : 'Log In'}
                </button>

                <p className="text-center text-xs" style={{ color: 'var(--text-light)' }}>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="underline transition-colors hover:opacity-80"
                    style={{ color: 'var(--gold)' }}
                  >
                    Lost your password?
                  </button>
                </p>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-7">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--text-light)' }}>New to PeptidePure?</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <p className="text-center text-xs" style={{ color: 'var(--text-mid)' }}>
                Create an account using the registration form →
              </p>

              {/* Trust indicators */}
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

            {/* ══ REGISTER ═══════════════════════════════════════ */}
            <div
              className="rounded-3xl p-8 md:p-10 relative"
              style={{ background: 'white', border: '1px solid rgba(11,31,58,0.08)', boxShadow: '0 8px 40px rgba(11,31,58,0.07)' }}
            >
              {/* Card header */}
              <div className="mb-8">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                  style={{ background: 'rgba(11,31,58,0.06)', border: '1px solid rgba(11,31,58,0.12)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--navy)' }} />
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--navy)' }}>
                    New Clinician
                  </span>
                </div>
                <h2 className="text-2xl font-black" style={{ color: 'var(--navy)', letterSpacing: '-0.02em' }}>
                  Register
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
                  Apply for verified clinician access
                </p>
              </div>

              {regSuccess ? (
                <div className="text-center py-12">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(16,185,129,0.1)' }}
                  >
                    <svg className="w-8 h-8" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--navy)' }}>
                    Registration Successful
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                    Please check your email to verify your account.
                  </p>
                </div>
              ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name" placeholder="Full Name" icon={<UserIcon />} value={regName} onChange={setRegName} />
                  <Field label="Email" type="email" placeholder="Email" icon={<MailIcon />} value={regEmail} onChange={setRegEmail} />
                </div>

                <PasswordField label="Password" placeholder="Password" value={regPassword} onChange={setRegPassword} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Clinic / Practice" placeholder="Clinic / Practice Details" icon={<ClinicIcon />} value={regClinic} onChange={setRegClinic} />
                  <Field label="Phone" type="tel" placeholder="Phone Number" icon={<PhoneIcon />} value={regPhone} onChange={setRegPhone} />
                </div>

                <Field label="NPI Number" placeholder="NPI Number" icon={<IdIcon />} value={regNpi} onChange={setRegNpi} />

                {regError && (
                  <div
                    className="text-sm px-4 py-3 rounded-xl"
                    style={{
                      background: 'rgba(220,38,38,0.06)',
                      border: '1px solid rgba(220,38,38,0.15)',
                      color: '#DC2626',
                    }}
                  >
                    {regError}
                  </div>
                )}

                {/* File upload */}
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    className="sr-only"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setRegFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setRegDragging(true); }}
                    onDragLeave={() => setRegDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setRegDragging(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) setRegFile(f);
                    }}
                    className="w-full flex flex-col items-center justify-center gap-2 py-5 rounded-xl text-sm transition-all duration-200"
                    style={{
                      background: regDragging ? 'rgba(200,149,44,0.06)' : 'rgba(11,31,58,0.03)',
                      border: regDragging ? '1.5px dashed var(--gold)' : '1.5px dashed rgba(11,31,58,0.18)',
                      color: regFile ? 'var(--gold)' : 'var(--text-light)',
                    }}
                  >
                    <UploadIcon />
                    <span className="font-medium">
                      {regFile ? regFile.name : 'Upload license documents'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                      {regFile ? 'Click to change file' : 'PDF, PNG, JPG — drag & drop or click'}
                    </span>
                  </button>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 pt-1">
                  {[
                    {
                      id: 'agree1',
                      value: regAgree1,
                      setter: setRegAgree1,
                      text: 'I agree to the Peptide Pure LLC Provider Terms & Conditions (including Clinician Use Only and IRB restrictions).',
                    },
                    {
                      id: 'agree2',
                      value: regAgree2,
                      setter: setRegAgree2,
                      text: 'The undersigned physician/provider agrees to participate as a site participant in the IRB-approved observational registry Mortensen Medical Research Network.',
                    },
                  ].map(({ id, value, setter, text }) => (
                    <label key={id} className="flex gap-3 cursor-pointer group/cb">
                      <div
                        className="mt-0.5 w-5 h-5 shrink-0 rounded-md flex items-center justify-center transition-all duration-200"
                        style={{
                          background: value ? 'var(--navy)' : 'white',
                          border: value ? '1.5px solid var(--navy)' : '1.5px solid rgba(11,31,58,0.2)',
                          boxShadow: value ? '0 2px 8px rgba(11,31,58,0.2)' : 'none',
                        }}
                        onClick={() => setter((v) => !v)}
                      >
                        {value && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span
                        className="text-xs leading-relaxed transition-colors"
                        style={{ color: value ? 'var(--text-dark)' : 'var(--text-mid)' }}
                        onClick={() => setter((v) => !v)}
                      >
                        {text}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={regLoading || !regAgree1 || !regAgree2}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background:
                      regLoading || !regAgree1 || !regAgree2
                        ? 'var(--text-light)'
                        : 'linear-gradient(135deg, var(--navy) 0%, #1e4080 100%)',
                    boxShadow:
                      !regLoading && regAgree1 && regAgree2
                        ? '0 4px 20px rgba(11,31,58,0.3)'
                        : 'none',
                    letterSpacing: '0.02em',
                    cursor: !regAgree1 || !regAgree2 ? 'not-allowed' : 'pointer',
                    opacity: regLoading ? 0.7 : 1,
                  }}
                >
                  {regLoading ? 'Submitting…' : 'Register'}
                </button>
              </form>
              )}
            </div>

          </div>
        </div>

        {/* ── Footer strip ── */}
        <div
          className="text-center py-6 text-xs"
          style={{ color: 'var(--text-light)', borderTop: '1px solid rgba(11,31,58,0.07)' }}
        >
          PeptidePure™ &nbsp;·&nbsp; Clinician Use Only &nbsp;·&nbsp; All access is verified and logged &nbsp;·&nbsp;{' '}
          <Link href="/contact" className="underline" style={{ color: 'var(--gold)' }}>
            Need help?
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard (logged-in view) ────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'var(--gold-pale)', color: 'var(--gold)' },
  confirmed: { bg: '#DBEAFE', color: '#1E40AF' },
  processing: { bg: '#E0E7FF', color: '#3730A3' },
  shipped: { bg: '#D1FAE5', color: '#065F46' },
  delivered: { bg: '#D1FAE5', color: '#065F46' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B' },
};

type DashboardTab = 'dashboard' | 'orders' | 'addresses' | 'account';

const NAV_ITEMS: { key: DashboardTab; label: string; icon: React.ReactNode }[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: 'addresses',
    label: 'Addresses',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-2 0h2" />
      </svg>
    ),
  },
  {
    key: 'account',
    label: 'Account Details',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

function Dashboard({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [tab, setTab] = useState<DashboardTab>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFetched, setOrdersFetched] = useState(false);
  const supabase = createClient();

  // Fetch orders when switching to orders or dashboard tab
  useEffect(() => {
    if ((tab === 'orders' || tab === 'dashboard') && !ordersFetched) {
      setOrdersLoading(true);
      supabase
        .from('orders')
        .select('*')
        .eq('patient_id', user.id)
        .eq('order_type', 'supplement')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) console.error('Orders fetch error:', error);
          setOrders((data as Order[]) ?? []);
          setOrdersLoading(false);
          setOrdersFetched(true);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const meta = user.user_metadata ?? {};
  const displayName = meta.full_name || 'Clinician';

  return (
    <div style={{ background: 'var(--off-white)' }}>
      {/* Page header */}
      <div className="py-8" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container-xl">
          <span className="section-label">Clinician Portal</span>
          <h1 className="text-2xl md:text-3xl font-bold mt-1" style={{ color: 'var(--navy)' }}>
            My Account
          </h1>
        </div>
      </div>

      <div className="container-xl py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar ── */}
          <aside className="lg:w-64 shrink-0">
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = tab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setTab(item.key)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left"
                    style={{
                      background: active ? 'var(--gold)' : 'transparent',
                      color: active ? 'white' : 'var(--navy)',
                    }}
                  >
                    <span style={{ opacity: active ? 1 : 0.5 }}>{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
              <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left hover:bg-red-50"
                  style={{ color: '#DC2626' }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.7 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </button>
              </div>
            </nav>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            {tab === 'dashboard' && (
              <DashboardHome
                user={user}
                displayName={displayName}
                orders={orders}
                ordersLoading={ordersLoading}
                onViewOrders={() => setTab('orders')}
              />
            )}
            {tab === 'orders' && (
              <OrdersPanel orders={orders} loading={ordersLoading} />
            )}
            {tab === 'addresses' && (
              <AddressesPanel user={user} />
            )}
            {tab === 'account' && (
              <AccountDetailsPanel user={user} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard Home ── */
function DashboardHome({
  user,
  displayName,
  orders,
  ordersLoading,
  onViewOrders,
}: {
  user: User;
  displayName: string;
  orders: Order[];
  ordersLoading: boolean;
  onViewOrders: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{ background: 'white', border: '1px solid var(--border)' }}
      >
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>
          Hello <strong style={{ color: 'var(--navy)' }}>{displayName}</strong>{' '}
          <span style={{ color: 'var(--text-light)' }}>
            (not {displayName}?{' '}
            <button className="underline" style={{ color: 'var(--gold)' }}>Log out</button>)
          </span>
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-mid)' }}>
          From your account dashboard you can view your{' '}
          <button onClick={onViewOrders} className="underline" style={{ color: 'var(--gold)' }}>recent orders</button>,
          manage your shipping and billing addresses, and edit your password and account details.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Orders"
          value={ordersLoading ? '—' : String(orders.length)}
          icon={
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <StatCard
          label="Pending"
          value={ordersLoading ? '—' : String(orders.filter((o) => o.status === 'pending').length)}
          icon={
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="var(--gold)"
        />
        <StatCard
          label="Completed"
          value={ordersLoading ? '—' : String(orders.filter((o) => o.status === 'delivered').length)}
          icon={
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="#10B981"
        />
      </div>

      {/* Recent orders */}
      {!ordersLoading && orders.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'white', border: '1px solid var(--border)' }}
        >
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--navy)' }}>Recent Orders</h3>
            <button onClick={onViewOrders} className="text-xs font-medium hover:underline" style={{ color: 'var(--gold)' }}>
              View all →
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {orders.slice(0, 3).map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Orders Panel ── */
function OrdersPanel({ orders, loading }: { orders: Order[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-7 h-7 rounded-full animate-spin" style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: 'white', border: '1px solid var(--border)' }}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--off-white)' }}>
          <svg className="w-8 h-8" style={{ color: 'var(--text-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--navy)' }}>No orders yet</p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-light)' }}>
          Your order history will appear here after your first purchase.
        </p>
        <Link href="/peptides" className="btn-primary text-sm">Browse Peptides</Link>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'white', border: '1px solid var(--border)' }}
    >
      {/* Table header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-widest" style={{ background: 'var(--off-white)', color: 'var(--text-light)', borderBottom: '1px solid var(--border)' }}>
        <div className="col-span-3">Order</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Items</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1" />
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} detailed />
        ))}
      </div>
    </div>
  );
}

/* ── Addresses Panel ── */
function AddressesPanel({ user }: { user: User }) {
  const meta = user.user_metadata ?? {};
  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{ background: 'white', border: '1px solid var(--border)' }}
      >
        <p className="text-sm mb-6" style={{ color: 'var(--text-mid)' }}>
          The following addresses will be used on the checkout page by default.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl p-5" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-light)' }}>
              Shipping Address
            </h3>
            {meta.full_name ? (
              <div className="text-sm space-y-0.5" style={{ color: 'var(--text-mid)' }}>
                <p className="font-semibold" style={{ color: 'var(--navy)' }}>{meta.full_name}</p>
                {meta.clinic && <p>{meta.clinic}</p>}
                {meta.phone && <p>{meta.phone}</p>}
                <p>{user.email}</p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                No address saved yet. Your shipping address will be saved after your first order.
              </p>
            )}
          </div>
          <div className="rounded-xl p-5" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-light)' }}>
              Billing Address
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>
              Same as shipping address. Billing address will be used for invoicing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Account Details Panel ── */
function AccountDetailsPanel({ user }: { user: User }) {
  const meta = user.user_metadata ?? {};
  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{ background: 'white', border: '1px solid var(--border)' }}
      >
        <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--navy)' }}>
          Account Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <ProfileField label="Full Name" value={meta.full_name || '—'} />
          <ProfileField label="Email" value={user.email || '—'} />
          <ProfileField label="Clinic / Practice" value={meta.clinic || '—'} />
          <ProfileField label="Phone" value={meta.phone || '—'} />
          <ProfileField label="NPI Number" value={meta.npi_number || '—'} />
          <ProfileField label="Member Since" value={formatDate(user.created_at)} />
        </div>
      </div>
    </div>
  );
}

/* ── Shared components ── */
function OrderRow({ order, detailed = false }: { order: Order; detailed?: boolean }) {
  const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;
  const itemCount = (order.items ?? []).reduce((s, i) => s + i.quantity, 0);

  if (detailed) {
    return (
      <Link
        href={`/order-confirmation/${order.id}`}
        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors items-center"
      >
        <div className="md:col-span-3">
          <span className="text-sm font-bold font-mono" style={{ color: 'var(--navy)' }}>
            {formatOrderNumber(order.id)}
          </span>
        </div>
        <div className="md:col-span-2">
          <span className="text-xs" style={{ color: 'var(--text-light)' }}>
            {formatDate(order.created_at)}
          </span>
        </div>
        <div className="md:col-span-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            {order.status}
          </span>
        </div>
        <div className="md:col-span-2">
          <span className="text-xs" style={{ color: 'var(--text-mid)' }}>
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="md:col-span-2 md:text-right">
          <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>
            {formatCents(order.total_cents)}
          </span>
        </div>
        <div className="md:col-span-1 md:text-right">
          <span className="text-xs font-medium" style={{ color: 'var(--text-light)' }}>
            View →
          </span>
        </div>
      </Link>
    );
  }

  // Compact row for dashboard
  return (
    <Link
      href={`/order-confirmation/${order.id}`}
      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-sm font-bold font-mono" style={{ color: 'var(--navy)' }}>
          {formatOrderNumber(order.id)}
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: statusStyle.bg, color: statusStyle.color }}
        >
          {order.status}
        </span>
        <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-light)' }}>
          {formatDate(order.created_at)}
        </span>
      </div>
      <span className="text-sm font-bold shrink-0" style={{ color: 'var(--gold)' }}>
        {formatCents(order.total_cents)}
      </span>
    </Link>
  );
}

function StatCard({
  label,
  value,
  icon,
  color = 'var(--navy)',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: 'white', border: '1px solid var(--border)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}10`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color }}>{value}</p>
        <p className="text-xs" style={{ color: 'var(--text-light)' }}>{label}</p>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-light)' }}>
        {label}
      </span>
      <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-dark)' }}>
        {value}
      </p>
    </div>
  );
}
