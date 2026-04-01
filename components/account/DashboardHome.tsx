import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { Order } from '@/lib/types/order';
import { OrderRow, StatCard } from './AccountShared';

interface Props {
  user: User;
  displayName: string;
  orders: Order[];
  ordersLoading: boolean;
  onViewOrders: () => void;
}

export default function DashboardHome({ displayName, orders, ordersLoading, onViewOrders }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 md:p-8" style={{ background: 'white', border: '1px solid var(--border)' }}>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>
          Hello <strong style={{ color: 'var(--navy)' }}>{displayName}</strong>
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-mid)' }}>
          From your account dashboard you can view your{' '}
          <button onClick={onViewOrders} className="underline" style={{ color: 'var(--gold)' }}>recent orders</button>,
          manage your shipping and billing addresses, and edit your password and account details.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Orders" value={ordersLoading ? '—' : String(orders.length)}
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} />
        <StatCard label="Pending" value={ordersLoading ? '—' : String(orders.filter((o) => o.status === 'pending').length)} color="var(--gold)"
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard label="Completed" value={ordersLoading ? '—' : String(orders.filter((o) => o.status === 'completed').length)} color="#10B981"
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>

      {!ordersLoading && orders.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--navy)' }}>Recent Orders</h3>
            <button onClick={onViewOrders} className="text-xs font-medium hover:underline" style={{ color: 'var(--gold)' }}>View all →</button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {orders.slice(0, 3).map((order) => <OrderRow key={order.id} order={order} />)}
          </div>
        </div>
      )}

      {!ordersLoading && orders.length === 0 && (
        <div className="rounded-2xl p-8 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-mid)' }}>No orders yet.</p>
          <Link href="/peptides" className="btn-primary text-sm mt-4 inline-block">Browse Peptides</Link>
        </div>
      )}
    </div>
  );
}
