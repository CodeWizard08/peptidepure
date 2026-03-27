'use client';

import { useState, useEffect } from 'react';

type UserMetadata = {
  full_name: string;
  clinic: string;
  npi_number: string;
  credential: string;
  phone: string;
};

type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: UserMetadata;
};

const fmtDate = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/users')
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8" style={{ background: 'var(--off-white)', minHeight: '100%' }}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
          Registered Clinicians
        </h2>
        {!loading && !error && (
          <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
            {total} registered clinician{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm"
          style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}
        >
          Failed to load users. Check your Supabase service role key.
        </div>
      )}

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'white', border: '1px solid var(--border)' }}
      >
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 rounded-full animate-spin"
              style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>
              Loading clinicians…
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--navy)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-mid)' }}>
              No users found
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
              No clinicians have registered yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--off-white)' }}>
                  {['Name', 'Email', 'Credential', 'NPI', 'Clinic / Practice', 'Joined'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-light)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => {
                  const meta = user.user_metadata;
                  return (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-gray-50"
                      style={{
                        borderBottom: idx < users.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>
                            {meta.full_name || '—'}
                          </p>
                          {meta.phone && (
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
                              {meta.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm" style={{ color: 'var(--text-dark)' }}>
                          {user.email || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {meta.credential ? (
                          <span
                            className="text-xs font-bold px-2 py-1 rounded-full uppercase"
                            style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}
                          >
                            {meta.credential}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-mono" style={{ color: 'var(--text-dark)' }}>
                          {meta.npi_number || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm" style={{ color: 'var(--text-dark)' }}>
                          {meta.clinic || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                          {fmtDate(user.created_at)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
