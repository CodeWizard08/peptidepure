import Link from 'next/link';
import { formatCents } from '@/lib/format';
import type { OrderItemJson } from '@/lib/types/order';

type Props = {
  items: OrderItemJson[];
  order: {
    subtotal_cents: number;
    discount_cents: number;
    total_cents: number;
  };
};

export default function OrderItemsTable({ items, order }: Props) {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-white mb-8"
      style={{ border: '1px solid var(--border)' }}
    >
      <div className="px-6 py-4" style={{ background: 'var(--navy)' }}>
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">
          Order Items
        </h3>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-4">
            <div className="flex-1">
              <Link
                href={`/peptides/${item.product_slug}`}
                className="text-sm font-semibold hover:underline"
                style={{ color: 'var(--navy)' }}
              >
                {item.product_name}
              </Link>
              <p className="text-xs" style={{ color: 'var(--text-light)' }}>
                {formatCents(item.unit_price_cents)} &times; {item.quantity}
              </p>
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--navy)' }}>
              {formatCents(item.line_total_cents)}
            </span>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 space-y-2" style={{ background: 'var(--off-white)', borderTop: '1px solid var(--border)' }}>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-mid)' }}>Subtotal</span>
          <span style={{ color: 'var(--navy)' }}>{formatCents(order.subtotal_cents)}</span>
        </div>
        {order.discount_cents > 0 && (
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-mid)' }}>Discount</span>
            <span style={{ color: '#10B981' }}>-{formatCents(order.discount_cents)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-mid)' }}>Shipping</span>
          <span style={{ color: '#10B981' }}>Free</span>
        </div>
        <hr style={{ borderColor: 'var(--border)' }} />
        <div className="flex justify-between">
          <span className="text-sm font-bold" style={{ color: 'var(--navy)' }}>Total</span>
          <span className="text-lg font-bold" style={{ color: 'var(--gold)' }}>
            {formatCents(order.total_cents)}
          </span>
        </div>
      </div>
    </div>
  );
}
