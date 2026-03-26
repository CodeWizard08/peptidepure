'use client';

import { useState, useEffect, useCallback } from 'react';
import ContentField, { humanize, updateAtPath } from './ContentField';

const PAGES = [
  { key: 'home', label: 'Home' },
  { key: 'hero-slider', label: 'Hero Slider' },
  { key: 'peptides', label: 'Peptides' },
  { key: 'how-it-works', label: 'How It Works' },
  { key: 'our-company', label: 'Our Company' },
  { key: 'coa', label: 'COA' },
  { key: 'contact', label: 'Contact' },
  { key: 'footer', label: 'Footer' },
];

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (res.ok) { setAuthenticated(true); setPasswordError(false); } else { setPasswordError(true); }
    } catch { setPasswordError(true); }
  };

  useEffect(() => {
    fetch('/api/admin/login').then((res) => res.json()).then((data) => { if (data.authenticated) setAuthenticated(true); }).catch(() => {});
  }, []);

  const fetchContent = useCallback(async (page: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/content?page=${page}`);
      if (!res.ok) throw new Error('Failed to load');
      setContent(await res.json());
    } catch { setToast({ type: 'error', message: 'Failed to load content' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authenticated) fetchContent(activePage); }, [activePage, authenticated, fetchContent]);
  useEffect(() => { if (toast) { const id = setTimeout(() => setToast(null), 3000); return () => clearTimeout(id); } }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/content?page=${activePage}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) });
      if (!res.ok) throw new Error();
      setToast({ type: 'success', message: 'Saved! Refresh your page to see changes.' });
    } catch { setToast({ type: 'error', message: 'Failed to save' }); }
    finally { setSaving(false); }
  };

  const handleChange = (path: string[], value: unknown) => {
    setContent((prev) => { if (!prev) return prev; if (path.length === 0) return value as Record<string, unknown>; return updateAtPath(prev, path, value); });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--navy)', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl p-8" style={{ background: 'white' }}>
          <div className="flex items-center gap-2 mb-1 justify-center">
            <svg width="24" height="26" viewBox="0 0 32 36" fill="none"><path d="M16 1L30 9V27L16 35L2 27V9L16 1Z" stroke="#C8952C" strokeWidth="2" fill="none" /><text x="11" y="21" fill="#C8952C" fontSize="11" fontWeight="bold" fontFamily="system-ui">P</text></svg>
            <span className="font-bold text-lg" style={{ color: 'var(--navy)' }}>PeptidePure Admin</span>
          </div>
          <p className="text-center text-xs mb-6" style={{ color: 'var(--text-light)' }}>Enter password to continue</p>
          <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }} placeholder="Password" autoFocus className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none mb-3" style={{ border: passwordError ? '1px solid #DC2626' : '1px solid var(--border)', color: 'var(--text-dark)' }} />
          {passwordError && <p className="text-xs mb-3" style={{ color: '#DC2626' }}>Incorrect password. Please try again.</p>}
          <button type="submit" className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all" style={{ background: 'var(--gold)' }}>Sign In</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <aside className="w-60 shrink-0 flex flex-col" style={{ background: 'var(--navy)', borderRight: '1px solid rgba(200,149,44,0.15)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-1">
            <svg width="20" height="22" viewBox="0 0 32 36" fill="none"><path d="M16 1L30 9V27L16 35L2 27V9L16 1Z" stroke="#C8952C" strokeWidth="2" fill="none" /><text x="11" y="21" fill="#C8952C" fontSize="11" fontWeight="bold" fontFamily="system-ui">P</text></svg>
            <span className="font-bold text-white text-sm">Content Editor</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-xs text-gray-500">Development Mode</span></div>
        </div>
        <nav className="flex-1 py-3">
          {PAGES.map((page) => (
            <button key={page.key} onClick={() => setActivePage(page.key)} className="w-full text-left px-5 py-2.5 text-sm transition-colors" style={{ color: activePage === page.key ? 'var(--gold-light)' : 'rgba(255,255,255,0.5)', background: activePage === page.key ? 'rgba(200,149,44,0.1)' : 'transparent', borderLeft: activePage === page.key ? '3px solid var(--gold)' : '3px solid transparent', fontWeight: activePage === page.key ? 600 : 400 }}>
              {page.label}
            </button>
          ))}
        </nav>
        <div className="p-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs text-gray-600 leading-relaxed">Edit text content here. Changes save to JSON files in the <code className="text-gray-500">/content</code> directory.</p>
        </div>
      </aside>
      <main className="flex-1 min-w-0" style={{ background: 'var(--off-white)' }}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4" style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>{PAGES.find((p) => p.key === activePage)?.label}</h1>
            <p className="text-xs" style={{ color: 'var(--text-light)' }}>{activePage}.json</p>
          </div>
          <button onClick={handleSave} disabled={saving || loading} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all" style={{ background: saving ? 'var(--text-light)' : 'var(--gold)', opacity: saving || loading ? 0.6 : 1 }}>
            {saving ? 'Saving...' : 'Save Page'}
          </button>
        </div>
        <div className="p-8 max-w-3xl">
          {loading ? (
            <div className="text-center py-20"><div className="text-sm" style={{ color: 'var(--text-light)' }}>Loading...</div></div>
          ) : content ? (
            Object.entries(content).map(([key, value]) => (
              <ContentField key={key} label={humanize(key)} path={[key]} value={value} onChange={handleChange} depth={0} />
            ))
          ) : (
            <div className="text-center py-20"><div className="text-sm" style={{ color: 'var(--text-light)' }}>No content loaded</div></div>
          )}
        </div>
      </main>
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg" style={{ background: toast.type === 'success' ? '#059669' : '#DC2626', color: 'white' }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
