import Link from 'next/link';
import type { Order } from '@/lib/types/order';
import { OrderRow } from './AccountShared';

export default function OrdersPanel({ orders, loading }: { orders: Order[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-7 h-7 rounded-full animate-spin" style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--off-white)' }}>
          <svg className="w-8 h-8" style={{ color: 'var(--text-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--navy)' }}>No orders yet</p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-light)' }}>Your order history will appear here after your first purchase.</p>
        <Link href="/peptides" className="btn-primary text-sm">Browse Peptides</Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--border)' }}>
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-widest"
        style={{ background: 'var(--off-white)', color: 'var(--text-light)', borderBottom: '1px solid var(--border)' }}>
        <div className="col-span-3">Order</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Items</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1" />
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {orders.map((order) => <OrderRow key={order.id} order={order} detailed />)}
      </div>
    </div>
  );
}
