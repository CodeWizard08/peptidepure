'use client';

import { useState, useEffect, useCallback } from 'react';

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

function humanize(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function updateAtPath(obj: any, path: string[], value: unknown): any {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(obj)) {
    const idx = parseInt(head, 10);
    const newArr = [...obj];
    newArr[idx] = updateAtPath(obj[idx], rest, value);
    return newArr;
  }
  return { ...obj, [head]: updateAtPath(obj?.[head], rest, value) };
}

function removeAtIndex(obj: any, path: string[], index: number): any {
  if (path.length === 0 && Array.isArray(obj)) {
    return obj.filter((_: any, i: number) => i !== index);
  }
  const [head, ...rest] = path;
  if (Array.isArray(obj)) {
    const idx = parseInt(head, 10);
    const newArr = [...obj];
    newArr[idx] = removeAtIndex(obj[idx], rest, index);
    return newArr;
  }
  return { ...obj, [head]: removeAtIndex(obj?.[head], rest, index) };
}

function addToArray(obj: any, path: string[], template: unknown): any {
  if (path.length === 0 && Array.isArray(obj)) {
    return [...obj, template];
  }
  const [head, ...rest] = path;
  if (Array.isArray(obj)) {
    const idx = parseInt(head, 10);
    const newArr = [...obj];
    newArr[idx] = addToArray(obj[idx], rest, template);
    return newArr;
  }
  return { ...obj, [head]: addToArray(obj?.[head], rest, template) };
}

// ─── Field Renderer ───────────────────────────────────────────
function ContentField({
  label,
  path,
  value,
  onChange,
  depth = 0,
}: {
  label: string;
  path: string[];
  value: unknown;
  onChange: (path: string[], value: unknown) => void;
  depth?: number;
}) {
  if (value === null || value === undefined) return null;

  // String
  if (typeof value === 'string') {
    const isLong = value.length > 80;
    return (
      <div className="mb-3">
        <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-mid)' }}>
          {label}
        </label>
        {isLong ? (
          <textarea
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
            rows={Math.min(6, Math.ceil(value.length / 80))}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-y"
            style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
          />
        )}
      </div>
    );
  }

  // Number
  if (typeof value === 'number') {
    return (
      <div className="mb-3">
        <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-mid)' }}>
          {label}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(path, Number(e.target.value))}
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)', maxWidth: '200px' }}
        />
      </div>
    );
  }

  // Boolean
  if (typeof value === 'boolean') {
    return (
      <div className="mb-3 flex items-center gap-2">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(path, e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-mid)' }}>
          {label}
        </label>
      </div>
    );
  }

  // Array of strings
  if (Array.isArray(value) && (value.length === 0 || typeof value[0] === 'string')) {
    return (
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-mid)' }}>
          {label} ({value.length} items)
        </label>
        <div className="space-y-1.5">
          {value.map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => onChange([...path, String(i)], e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-sm focus:outline-none"
                style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
              />
              <button
                onClick={() => onChange(path, value.filter((_: any, j: number) => j !== i))}
                className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => onChange(path, [...value, ''])}
          className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)', background: 'var(--gold-pale)' }}
        >
          + Add Item
        </button>
      </div>
    );
  }

  // Array of objects
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
    return (
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-mid)' }}>
          {label} ({value.length} items)
        </label>
        <div className="space-y-3">
          {value.map((item: any, i: number) => (
            <div
              key={i}
              className="rounded-xl p-4 relative"
              style={{ background: depth % 2 === 0 ? 'rgba(255,255,255,0.6)' : 'var(--off-white)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: 'var(--navy)' }}>
                  #{i + 1}
                </span>
                <button
                  onClick={() => onChange(path, value.filter((_: any, j: number) => j !== i))}
                  className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded"
                  title="Remove"
                >
                  ✕ Remove
                </button>
              </div>
              {Object.entries(item).map(([k, v]) => (
                <ContentField
                  key={k}
                  label={humanize(k)}
                  path={[...path, String(i), k]}
                  value={v}
                  onChange={onChange}
                  depth={depth + 1}
                />
              ))}
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            // Clone first item as template with empty strings
            const template = Object.fromEntries(
              Object.entries(value[0]).map(([k, v]) => [
                k,
                typeof v === 'string' ? '' : typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : Array.isArray(v) ? [] : v,
              ])
            );
            onChange(path, [...value, template]);
          }}
          className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)', background: 'var(--gold-pale)' }}
        >
          + Add Entry
        </button>
      </div>
    );
  }

  // Nested object
  if (typeof value === 'object' && !Array.isArray(value)) {
    return (
      <details className="mb-4" open={depth < 2}>
        <summary
          className="cursor-pointer text-sm font-bold mb-3 select-none flex items-center gap-2"
          style={{ color: 'var(--navy)' }}
        >
          <span className="text-xs" style={{ color: 'var(--gold)' }}>▸</span>
          {label}
        </summary>
        <div
          className="pl-4 ml-2 rounded-lg"
          style={{ borderLeft: '2px solid rgba(200,149,44,0.2)' }}
        >
          {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
            <ContentField
              key={k}
              label={humanize(k)}
              path={[...path, k]}
              value={v}
              onChange={onChange}
              depth={depth + 1}
            />
          ))}
        </div>
      </details>
    );
  }

  return null;
}

// ─── Admin Page ───────────────────────────────────────────────
export default function AdminPage() {
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
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        setPasswordError(false);
      } else {
        setPasswordError(true);
      }
    } catch {
      setPasswordError(true);
    }
  };

  // Check if already authenticated (session cookie persists across reloads)
  useEffect(() => {
    fetch('/api/admin/login')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setAuthenticated(true);
      })
      .catch(() => {});
  }, []);

  const fetchContent = useCallback(async (page: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/content?page=${page}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setContent(data);
    } catch {
      setToast({ type: 'error', message: 'Failed to load content' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent(activePage);
  }, [activePage, fetchContent]);

  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(id);
    }
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/content?page=${activePage}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (!res.ok) throw new Error('Save failed');
      setToast({ type: 'success', message: 'Saved! Refresh your page to see changes.' });
    } catch {
      setToast({ type: 'error', message: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (path: string[], value: unknown) => {
    setContent((prev) => {
      if (!prev) return prev;
      if (path.length === 0) return value as Record<string, unknown>;
      return updateAtPath(prev, path, value);
    });
  };

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
            <svg width="24" height="26" viewBox="0 0 32 36" fill="none">
              <path d="M16 1L30 9V27L16 35L2 27V9L16 1Z" stroke="#C8952C" strokeWidth="2" fill="none" />
              <text x="11" y="21" fill="#C8952C" fontSize="11" fontWeight="bold" fontFamily="system-ui">P</text>
            </svg>
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
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ background: 'var(--gold)' }}
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Sidebar */}
      <aside
        className="w-60 shrink-0 flex flex-col"
        style={{ background: 'var(--navy)', borderRight: '1px solid rgba(200,149,44,0.15)' }}
      >
        <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-1">
            <svg width="20" height="22" viewBox="0 0 32 36" fill="none">
              <path d="M16 1L30 9V27L16 35L2 27V9L16 1Z" stroke="#C8952C" strokeWidth="2" fill="none" />
              <text x="11" y="21" fill="#C8952C" fontSize="11" fontWeight="bold" fontFamily="system-ui">P</text>
            </svg>
            <span className="font-bold text-white text-sm">Content Editor</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-gray-500">Development Mode</span>
          </div>
        </div>

        <nav className="flex-1 py-3">
          {PAGES.map((page) => (
            <button
              key={page.key}
              onClick={() => setActivePage(page.key)}
              className="w-full text-left px-5 py-2.5 text-sm transition-colors"
              style={{
                color: activePage === page.key ? 'var(--gold-light)' : 'rgba(255,255,255,0.5)',
                background: activePage === page.key ? 'rgba(200,149,44,0.1)' : 'transparent',
                borderLeft: activePage === page.key ? '3px solid var(--gold)' : '3px solid transparent',
                fontWeight: activePage === page.key ? 600 : 400,
              }}
            >
              {page.label}
            </button>
          ))}
        </nav>

        <div className="p-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs text-gray-600 leading-relaxed">
            Edit text content here. Changes save to JSON files in the <code className="text-gray-500">/content</code> directory.
          </p>
        </div>
      </aside>

      {/* ── Main panel */}
      <main className="flex-1 min-w-0" style={{ background: 'var(--off-white)' }}>
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-8 py-4"
          style={{ background: 'white', borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>
              {PAGES.find((p) => p.key === activePage)?.label}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-light)' }}>
              {activePage}.json
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{
              background: saving ? 'var(--text-light)' : 'var(--gold)',
              opacity: saving || loading ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Page'}
          </button>
        </div>

        {/* Content area */}
        <div className="p-8 max-w-3xl">
          {loading ? (
            <div className="text-center py-20">
              <div className="text-sm" style={{ color: 'var(--text-light)' }}>Loading...</div>
            </div>
          ) : content ? (
            Object.entries(content).map(([key, value]) => (
              <ContentField
                key={key}
                label={humanize(key)}
                path={[key]}
                value={value}
                onChange={handleChange}
                depth={0}
              />
            ))
          ) : (
            <div className="text-center py-20">
              <div className="text-sm" style={{ color: 'var(--text-light)' }}>No content loaded</div>
            </div>
          )}
        </div>
      </main>

      {/* ── Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{
            background: toast.type === 'success' ? '#059669' : '#DC2626',
            color: 'white',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
