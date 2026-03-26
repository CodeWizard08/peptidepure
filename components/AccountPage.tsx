'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Dashboard from '@/components/account/Dashboard';
import LoginForm from '@/components/account/LoginForm';
import RegisterForm from '@/components/account/RegisterForm';

export default function AccountPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { setUser(user); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--off-white)' }}>
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }} />
      </div>
    );
  }

  if (user) return <Dashboard user={user} onSignOut={handleSignOut} />;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--off-white)' }}>
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,149,44,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(11,31,58,0.05) 0%, transparent 70%)' }} />
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0B1F3A" strokeWidth="1" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="text-center pt-12 pb-10 px-4">
          <span className="section-label">Clinician Access</span>
          <h1 className="text-3xl md:text-4xl font-black mt-2" style={{ color: 'var(--navy)', letterSpacing: '-0.02em' }}>
            My <span style={{ color: 'var(--gold)' }}>Account</span>
          </h1>
          <p className="text-sm mt-2 max-w-sm mx-auto" style={{ color: 'var(--text-light)' }}>
            Verified access for licensed clinicians, researchers, and wellness practitioners.
          </p>
        </div>

        <div className="flex-1 container-xl pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <LoginForm />
            <RegisterForm />
          </div>
        </div>

        <div className="text-center py-6 text-xs" style={{ color: 'var(--text-light)', borderTop: '1px solid rgba(11,31,58,0.07)' }}>
          PeptidePure™ &nbsp;·&nbsp; Clinician Use Only &nbsp;·&nbsp; All access is verified and logged &nbsp;·&nbsp;{' '}
          <Link href="/contact" className="underline" style={{ color: 'var(--gold)' }}>Need help?</Link>
        </div>
      </div>
    </div>
  );
}
