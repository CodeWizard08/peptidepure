'use client';

import { Fragment, useState, useEffect } from 'react';

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

// Drilldown shape — orders for a single clinician. Audit #16.
type OrderRow = {
  id: string;
  status: string;
  total_cents: number;
  tracking_number?: string | null;
  created_at: string;
  items?: { product_name: string; quantity: number }[];
};

const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const fmtDate = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [credentialFilter, setCredentialFilter] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  // Audit #16 — per-user order drilldown
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = () => {
    setLoading(true);
    setError(false);
    fetch('/api/admin/users')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setUsers(data.users || []); setTotal(data.total || 0); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleViewOrders = async (userId: string) => {
    // Toggle off if clicking the already-expanded user.
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      setUserOrders([]);
      return;
    }
    setExpandedUserId(userId);
    setLoadingOrders(true);
    setUserOrders([]);
    try {
      const res = await fetch(`/api/admin/orders?patient_id=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setUserOrders((data.orders ?? []) as OrderRow[]);
    } catch {
      showToast('error', 'Failed to load orders for this user');
      setExpandedUserId(null);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('success', 'User deleted');
      setConfirmDeleteId(null);
      fetchUsers();
    } catch {
      showToast('error', 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const credentials = ['all', ...Array.from(new Set(users.map((u) => u.user_metadata?.credential).filter(Boolean)))];

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const meta = u.user_metadata;
    if (q) {
      const matchName = meta?.full_name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchClinic = meta?.clinic?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchClinic) return false;
    }
    if (credentialFilter !== 'all' && meta?.credential !== credentialFilter) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-8" style={{ background: 'var(--off-white)', minHeight: '100%' }}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>Registered Clinicians</h2>
        {!loading && !error && (
          <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
            {total} registered clinician{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
          Failed to load users. Check your Supabase service role key.
        </div>
      )}

      {/* Search + filter */}
      {!loading && users.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            type="text"
            placeholder="Search by name, email, or clinic…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-45 px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
          />
          <select
            value={credentialFilter}
            onChange={(e) => setCredentialFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
          >
            {credentials.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Credentials' : c}</option>
            ))}
          </select>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }} />
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>Loading clinicians…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-mid)' }}>No users found</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>No clinicians have registered yet</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>No users match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--off-white)' }}>
                  {['Name', 'Email', 'Credential', 'NPI', 'Clinic / Practice', 'Joined', 'Actions'].map((h) => {
                    const hideMobile = ['Email', 'Credential', 'NPI', 'Clinic / Practice', 'Joined'].includes(h);
                    return (
                      <th key={h} className={`px-3 sm:px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${hideMobile ? 'hidden md:table-cell' : ''}`} style={{ color: 'var(--text-light)' }}>
                        {h}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => {
                  const meta = user.user_metadata;
                  const isConfirming = confirmDeleteId === user.id;
                  const isExpanded = expandedUserId === user.id;
                  return (
                    <Fragment key={user.id}>
                    <tr
                      className="transition-colors hover:bg-gray-50"
                      style={{ borderBottom: isExpanded ? 'none' : (idx < filteredUsers.length - 1 ? '1px solid var(--border)' : 'none'), background: isExpanded ? 'var(--gold-pale)' : undefined }}
                    >
                      <td className="px-3 sm:px-5 py-4">
                        <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>{meta.full_name || '—'}</p>
                        <p className="text-xs mt-0.5 md:hidden truncate" style={{ color: 'var(--text-light)' }}>{user.email || ''}</p>
                        {meta.phone && <p className="text-xs mt-0.5 hidden md:block" style={{ color: 'var(--text-light)' }}>{meta.phone}</p>}
                      </td>
                      <td className="px-3 sm:px-5 py-4 hidden md:table-cell">
                        <span className="text-sm truncate max-w-40 block" style={{ color: 'var(--text-dark)' }}>{user.email || '—'}</span>
                      </td>
                      <td className="px-3 sm:px-5 py-4 hidden md:table-cell">
                        {meta.credential ? (
                          <span className="text-xs font-bold px-2 py-1 rounded-full uppercase" style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}>
                            {meta.credential}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-light)' }}>—</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-5 py-4 hidden md:table-cell">
                        <span className="text-sm font-mono" style={{ color: 'var(--text-dark)' }}>{meta.npi_number || '—'}</span>
                      </td>
                      <td className="px-3 sm:px-5 py-4 hidden md:table-cell">
                        <span className="text-sm truncate max-w-32 block" style={{ color: 'var(--text-dark)' }}>{meta.clinic || '—'}</span>
                      </td>
                      <td className="px-3 sm:px-5 py-4 hidden md:table-cell">
                        <span className="text-xs" style={{ color: 'var(--text-light)' }}>{fmtDate(user.created_at)}</span>
                      </td>
                      <td className="px-3 sm:px-5 py-4">
                        {isConfirming ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: '#991B1B' }}>Delete user?</span>
                            <button onClick={() => handleDelete(user.id)} disabled={deleting} className="text-xs px-2 py-1 rounded-lg font-bold text-white" style={{ background: '#DC2626' }}>
                              {deleting ? '…' : 'Yes'}
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ color: 'var(--text-mid)', border: '1px solid var(--border)' }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleViewOrders(user.id)}
                              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                              style={{ color: 'var(--navy)', background: isExpanded ? 'var(--gold)' : 'var(--off-white)', border: '1px solid var(--border)' }}
                              title="View this clinician's order history"
                            >
                              {isExpanded ? 'Hide orders' : 'Orders'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(user.id)}
                              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                              style={{ color: '#991B1B', background: '#FEE2E2', border: '1px solid #FCA5A5' }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ borderBottom: idx < filteredUsers.length - 1 ? '1px solid var(--border)' : 'none', background: 'var(--gold-pale)' }}>
                        <td colSpan={7} className="px-3 sm:px-5 py-4">
                          <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid rgba(200,149,44,0.3)' }}>
                            <div className="flex items-baseline justify-between mb-3">
                              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
                                Order History · {user.email}
                              </p>
                              {!loadingOrders && (
                                <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                                  {userOrders.length} order{userOrders.length === 1 ? '' : 's'}
                                </span>
                              )}
                            </div>
                            {loadingOrders ? (
                              <p className="text-xs italic" style={{ color: 'var(--text-light)' }}>Loading orders…</p>
                            ) : userOrders.length === 0 ? (
                              <p className="text-xs italic" style={{ color: 'var(--text-light)' }}>No orders found for this clinician.</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                      <th className="text-left px-2 py-1.5 font-semibold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Order ID</th>
                                      <th className="text-left px-2 py-1.5 font-semibold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Date</th>
                                      <th className="text-left px-2 py-1.5 font-semibold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Status</th>
                                      <th className="text-left px-2 py-1.5 font-semibold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Items</th>
                                      <th className="text-left px-2 py-1.5 font-semibold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Tracking</th>
                                      <th className="text-right px-2 py-1.5 font-semibold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {userOrders.map((o) => (
                                      <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td className="px-2 py-2 font-mono" style={{ color: 'var(--navy)' }}>{o.id.slice(0, 8).toUpperCase()}</td>
                                        <td className="px-2 py-2" style={{ color: 'var(--text-mid)' }}>{fmtDate(o.created_at)}</td>
                                        <td className="px-2 py-2">
                                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'var(--off-white)', color: 'var(--navy)' }}>
                                            {o.status}
                                          </span>
                                        </td>
                                        <td className="px-2 py-2" style={{ color: 'var(--text-mid)' }}>
                                          {(o.items ?? []).map((it) => `${it.product_name} x${it.quantity}`).join(', ') || '—'}
                                        </td>
                                        <td className="px-2 py-2 font-mono" style={{ color: 'var(--text-mid)' }}>{o.tracking_number || '—'}</td>
                                        <td className="px-2 py-2 text-right font-bold" style={{ color: 'var(--navy)' }}>{formatCents(o.total_cents)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg" style={{ background: toast.type === 'success' ? '#059669' : '#DC2626', color: 'white' }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
