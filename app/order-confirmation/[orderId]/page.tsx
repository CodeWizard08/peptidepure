import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatCents, formatOrderNumber, formatDate } from '@/lib/format';
import type { Order, OrderItemJson, ShippingAddress } from '@/lib/types/order';

export async function generateMetadata({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return { title: `Order ${formatOrderNumber(orderId)} | PeptidePure` };
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'var(--gold-pale)', color: 'var(--gold)' },
  confirmed: { bg: '#DBEAFE', color: '#1E40AF' },
  processing: { bg: '#E0E7FF', color: '#3730A3' },
  shipped: { bg: '#D1FAE5', color: '#065F46' },
  delivered: { bg: '#D1FAE5', color: '#065F46' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B' },
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // Fetch order
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('patient_id', user.id)
    .single<Order>();

  if (!order) notFound();

  const items: OrderItemJson[] = order.items ?? [];
  const shipping: ShippingAddress | null = order.shipping_address;
  const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;

  return (
    <>
      {/* Success banner */}
      <section className="py-12" style={{ background: 'var(--off-white)' }}>
        <div className="container-xl max-w-3xl text-center">
          <div
            className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.1)' }}
          >
            <svg className="w-8 h-8" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--navy)' }}>
            Order Confirmed
          </h1>
          <p className="text-sm mb-3" style={{ color: 'var(--text-mid)' }}>
            Thank you for your order! We&apos;ll send you an email confirmation shortly.
          </p>
          <div className="inline-flex items-center gap-3">
            <span className="text-sm font-mono font-bold" style={{ color: 'var(--navy)' }}>
              {formatOrderNumber(order.id)}
            </span>
            <span
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-light)' }}>
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
      </section>

      {/* Order details */}
      <section className="py-12">
        <div className="container-xl max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Shipping */}
            {shipping && (
              <div
                className="rounded-2xl bg-white p-6"
                style={{ border: '1px solid var(--border)' }}
              >
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-light)' }}>
                  Shipping Address
                </h3>
                <div className="text-sm space-y-0.5" style={{ color: 'var(--text-mid)' }}>
                  <p className="font-semibold" style={{ color: 'var(--navy)' }}>{shipping.name}</p>
                  <p>{shipping.line1}</p>
                  {shipping.line2 && <p>{shipping.line2}</p>}
                  <p>{shipping.city}, {shipping.state} {shipping.zip}</p>
                  <p>{shipping.email}</p>
                  {shipping.phone && <p>{shipping.phone}</p>}
                </div>
              </div>
            )}

            {/* Order Info */}
            <div
              className="rounded-2xl bg-white p-6"
              style={{ border: '1px solid var(--border)' }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-light)' }}>
                Order Details
              </h3>
              <div className="text-sm space-y-2" style={{ color: 'var(--text-mid)' }}>
                <div>
                  <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-light)' }}>Type</span>
                  <p className="font-semibold capitalize" style={{ color: 'var(--navy)' }}>{order.order_type}</p>
                </div>
                {order.tracking_number && (
                  <div>
                    <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-light)' }}>Tracking</span>
                    <p className="font-mono font-semibold" style={{ color: 'var(--navy)' }}>{order.tracking_number}</p>
                  </div>
                )}
              </div>
              {order.patient_notes && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-light)' }}>
                    Order Notes
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-mid)' }}>{order.patient_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items table */}
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
                      {formatCents(item.unit_price_cents)} × {item.quantity}
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

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/peptides" className="btn-primary">
              Continue Shopping
            </Link>
            <Link href="/account" className="btn-outline">
              View Order History
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
