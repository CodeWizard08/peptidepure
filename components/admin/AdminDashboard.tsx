'use client';

import { useState, useEffect } from 'react';

type RecentOrder = {
  id: string;
  status: string;
  total_cents: number;
  created_at: string;
  shipping_address: { name?: string; email?: string } | null;
};

type Stats = {
  totalOrders: number;
  totalRevenueCents: number;
  pendingOrders: number;
  activeProducts: number;
  totalUsers: number;
  recentOrders: RecentOrder[];
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
  processing: { bg: '#E0E7FF', text: '#3730A3' },
  shipped: { bg: '#D1FAE5', text: '#065F46' },
  delivered: { bg: '#ECFDF5', text: '#047857' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function StatCard({
  label,
  value,
  sub,
  gold,
}: {
  label: string;
  value: string | number;
  sub?: string;
  gold?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-1"
      style={{
        background: 'white',
        border: gold ? '1px solid rgba(200,149,44,0.3)' : '1px solid var(--border)',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-light)' }}>
        {label}
      </p>
      <p
        className="text-3xl font-bold leading-tight"
        style={{ color: gold ? 'var(--gold)' : 'var(--navy)' }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs" style={{ color: 'var(--text-light)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'white', border: '1px solid var(--border)' }}
    >
      <div className="h-3 w-20 rounded animate-pulse mb-3" style={{ background: 'var(--border)' }} />
      <div className="h-8 w-16 rounded animate-pulse" style={{ background: 'var(--border)' }} />
    </div>
  );
}

export default function AdminDashboard({ onNavigate }: { onNavigate: (section: string) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setStats(data);
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
          Dashboard
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
          Overview of your store
        </p>
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm"
          style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}
        >
          Failed to load stats. Check your Supabase connection.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} />
            <StatCard
              label="Revenue"
              value={fmt(stats?.totalRevenueCents ?? 0)}
              sub="excl. cancelled"
              gold
            />
            <StatCard
              label="Pending"
              value={stats?.pendingOrders ?? 0}
              sub="awaiting action"
            />
            <StatCard
              label="Active Products"
              value={stats?.activeProducts ?? 0}
            />
            <StatCard
              label="Clinicians"
              value={stats?.totalUsers ?? 0}
              sub="registered"
            />
          </>
        )}
      </div>

      {/* Recent Orders */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'white', border: '1px solid var(--border)' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h3 className="text-sm font-bold" style={{ color: 'var(--navy)' }}>
            Recent Orders
          </h3>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold transition-colors"
            style={{ color: 'var(--gold)' }}
          >
            View All Orders →
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-4 w-24 rounded animate-pulse" style={{ background: 'var(--border)' }} />
                <div className="h-4 w-16 rounded animate-pulse" style={{ background: 'var(--border)' }} />
                <div className="h-4 flex-1 rounded animate-pulse" style={{ background: 'var(--border)' }} />
                <div className="h-4 w-16 rounded animate-pulse" style={{ background: 'var(--border)' }} />
                <div className="h-4 w-24 rounded animate-pulse" style={{ background: 'var(--border)' }} />
              </div>
            ))}
          </div>
        ) : !stats?.recentOrders?.length ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>
              No orders yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Order #', 'Status', 'Customer', 'Amount', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-light)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order, idx) => {
                  const colors = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom:
                          idx < stats.recentOrders.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold" style={{ color: 'var(--navy)' }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: 'var(--text-dark)' }}>
                          {order.shipping_address?.name || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>
                          {fmt(order.total_cents)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                          {fmtDate(order.created_at)}
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
