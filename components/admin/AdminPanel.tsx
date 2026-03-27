'use client';

import { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import AdminOrdersPanel from './AdminOrdersPanel';
import AdminProductsPanel from './AdminProductsPanel';
import AdminUsersPanel from './AdminUsersPanel';
import AdminFormsPanel from './AdminFormsPanel';
import AdminContentPanel from './AdminContentPanel';

type Section = 'dashboard' | 'orders' | 'products' | 'users' | 'forms' | 'content';

const NAV: { key: Section; label: string; icon: React.ReactNode }[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    key: 'products',
    label: 'Products',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    key: 'users',
    label: 'Users',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: 'forms',
    label: 'Form Submissions',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    key: 'content',
    label: 'Content',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
];

function HexLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 1.08)} viewBox="0 0 32 36" fill="none">
      <path d="M16 1L30 9V27L16 35L2 27V9L16 1Z" stroke="#C8952C" strokeWidth="2" fill="none" />
      <text x="11" y="21" fill="#C8952C" fontSize="11" fontWeight="bold" fontFamily="system-ui">
        P
      </text>
    </svg>
  );
}

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null); // null = checking
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  // Check auth on mount
  useEffect(() => {
    fetch('/api/admin/login')
      .then((r) => r.json())
      .then((d) => setAuthenticated(d.authenticated === true))
      .catch(() => setAuthenticated(false));
  }, []);

  const handleLogin = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setLoginLoading(true);
    setPasswordError(false);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        setPassword('');
      } else {
        setPasswordError(true);
      }
    } catch {
      setPasswordError(true);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      setAuthenticated(false);
      setActiveSection('dashboard');
    }
  };

  // --- Loading spinner while checking auth ---
  if (authenticated === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--navy)', fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <div className="flex flex-col items-center gap-4">
          <HexLogo size={36} />
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{ border: '3px solid rgba(200,149,44,0.3)', borderTopColor: 'var(--gold)' }}
          />
        </div>
      </div>
    );
  }

  // --- Login form ---
  if (!authenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--navy)', fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl p-8"
          style={{ background: 'white' }}
        >
          <div className="flex items-center gap-2 mb-1 justify-center">
            <HexLogo size={28} />
            <span className="font-bold text-lg" style={{ color: 'var(--navy)' }}>
              PeptidePure Admin
            </span>
          </div>
          <p className="text-center text-xs mb-6" style={{ color: 'var(--text-light)' }}>
            Enter password to continue
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(false);
            }}
            placeholder="Password"
            autoFocus
            className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none mb-3"
            style={{
              border: passwordError ? '1px solid #DC2626' : '1px solid var(--border)',
              color: 'var(--text-dark)',
            }}
          />
          {passwordError && (
            <p className="text-xs mb-3" style={{ color: '#DC2626' }}>
              Incorrect password. Please try again.
            </p>
          )}
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ background: loginLoading ? 'var(--text-light)' : 'var(--gold)' }}
          >
            {loginLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  // --- Main authenticated layout ---
  return (
    <div
      className="flex min-h-screen"
      style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--off-white)' }}
    >
      {/* Sidebar */}
      <aside
        className="w-56 shrink-0 flex flex-col sticky top-0 h-screen overflow-y-auto"
        style={{
          background: 'var(--navy)',
          borderRight: '1px solid rgba(200,149,44,0.15)',
        }}
      >
        {/* Logo */}
        <div
          className="px-5 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2">
            <HexLogo size={22} />
            <div>
              <p className="text-sm font-bold text-white leading-tight">PeptidePure</p>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(200,149,44,0.8)' }}>
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3">
          {NAV.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className="w-full text-left flex items-center gap-3 px-5 py-3 text-sm transition-all"
                style={{
                  color: isActive ? '#C8952C' : 'rgba(255,255,255,0.55)',
                  background: isActive ? 'rgba(200,149,44,0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid #C8952C' : '3px solid transparent',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span
                  style={{ color: isActive ? '#C8952C' : 'rgba(255,255,255,0.4)', flexShrink: 0 }}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom: View Site + Logout */}
        <div
          className="px-4 py-4 space-y-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Site
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {activeSection === 'dashboard' && (
          <AdminDashboard onNavigate={(s) => setActiveSection(s as Section)} />
        )}
        {activeSection === 'orders' && <AdminOrdersPanel />}
        {activeSection === 'products' && <AdminProductsPanel />}
        {activeSection === 'users' && <AdminUsersPanel />}
        {activeSection === 'forms' && <AdminFormsPanel />}
        {activeSection === 'content' && <AdminContentPanel />}
      </main>
    </div>
  );
}
