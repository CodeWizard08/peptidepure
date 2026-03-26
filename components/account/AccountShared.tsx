import Link from 'next/link';
import { formatCents, formatOrderNumber, formatDate } from '@/lib/format';
import type { Order } from '@/lib/types/order';

export const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:    { bg: 'var(--gold-pale)', color: 'var(--gold)' },
  confirmed:  { bg: '#DBEAFE', color: '#1E40AF' },
  processing: { bg: '#E0E7FF', color: '#3730A3' },
  shipped:    { bg: '#D1FAE5', color: '#065F46' },
  delivered:  { bg: '#D1FAE5', color: '#065F46' },
  cancelled:  { bg: '#FEE2E2', color: '#991B1B' },
};

export function OrderRow({ order, detailed = false }: { order: Order; detailed?: boolean }) {
  const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;
  const itemCount = (order.items ?? []).reduce((s, i) => s + i.quantity, 0);

  if (detailed) {
    return (
      <Link href={`/order-confirmation/${order.id}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors items-center">
        <div className="md:col-span-3"><span className="text-sm font-bold font-mono" style={{ color: 'var(--navy)' }}>{formatOrderNumber(order.id)}</span></div>
        <div className="md:col-span-2"><span className="text-xs" style={{ color: 'var(--text-light)' }}>{formatDate(order.created_at)}</span></div>
        <div className="md:col-span-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: statusStyle.bg, color: statusStyle.color }}>{order.status}</span>
        </div>
        <div className="md:col-span-2"><span className="text-xs" style={{ color: 'var(--text-mid)' }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</span></div>
        <div className="md:col-span-2 md:text-right"><span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>{formatCents(order.total_cents)}</span></div>
        <div className="md:col-span-1 md:text-right"><span className="text-xs font-medium" style={{ color: 'var(--text-light)' }}>View →</span></div>
      </Link>
    );
  }

  return (
    <Link href={`/order-confirmation/${order.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-sm font-bold font-mono" style={{ color: 'var(--navy)' }}>{formatOrderNumber(order.id)}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: statusStyle.bg, color: statusStyle.color }}>{order.status}</span>
        <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-light)' }}>{formatDate(order.created_at)}</span>
      </div>
      <span className="text-sm font-bold shrink-0" style={{ color: 'var(--gold)' }}>{formatCents(order.total_cents)}</span>
    </Link>
  );
}

export function StatCard({ label, value, icon, color = 'var(--navy)' }: { label: string; value: string; icon: React.ReactNode; color?: string }) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'white', border: '1px solid var(--border)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}10`, color }}>{icon}</div>
      <div>
        <p className="text-2xl font-bold" style={{ color }}>{value}</p>
        <p className="text-xs" style={{ color: 'var(--text-light)' }}>{label}</p>
      </div>
    </div>
  );
}

export function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-light)' }}>{label}</span>
      <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-dark)' }}>{value}</p>
    </div>
  );
}
