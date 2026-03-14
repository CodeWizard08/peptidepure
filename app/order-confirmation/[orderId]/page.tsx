import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatOrderNumber, formatDate } from '@/lib/format';
import OrderItemsTable from '@/components/OrderItemsTable';
import type { Order, OrderItemJson, ShippingAddress } from '@/lib/types/order';

export async function generateMetadata({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return { title: `Order ${formatOrderNumber(orderId)} | PeptidePure` };
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:    { bg: 'var(--gold-pale)', color: 'var(--gold)' },
  confirmed:  { bg: '#DBEAFE', color: '#1E40AF' },
  processing: { bg: '#E0E7FF', color: '#3730A3' },
  shipped:    { bg: '#D1FAE5', color: '#065F46' },
  delivered:  { bg: '#D1FAE5', color: '#065F46' },
  cancelled:  { bg: '#FEE2E2', color: '#991B1B' },
};

const cardBorder = { border: '1px solid var(--border)' } as const;
const labelStyle = { color: 'var(--text-light)' } as const;
const midStyle = { color: 'var(--text-mid)' } as const;
const navyStyle = { color: 'var(--navy)' } as const;

export default async function OrderConfirmationPage({
  params,
}: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: order } = await supabase
    .from('orders').select('*')
    .eq('id', orderId).eq('patient_id', user.id)
    .single<Order>();
  if (!order) notFound();

  const items: OrderItemJson[] = order.items ?? [];
  const shipping: ShippingAddress | null = order.shipping_address;
  const ss = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;

  return (
    <>
      {/* Success banner */}
      <section className="py-12" style={{ background: 'var(--off-white)' }}>
        <div className="container-xl max-w-3xl text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.1)' }}>
            <svg className="w-8 h-8" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={navyStyle}>Order Confirmed</h1>
          <p className="text-sm mb-3" style={midStyle}>
            Thank you for your order! We&apos;ll send you an email confirmation shortly.
          </p>
          <div className="inline-flex items-center gap-3">
            <span className="text-sm font-mono font-bold" style={navyStyle}>{formatOrderNumber(order.id)}</span>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: ss.bg, color: ss.color }}>{order.status}</span>
          </div>
          <p className="text-xs mt-2" style={labelStyle}>Placed on {formatDate(order.created_at)}</p>
        </div>
      </section>

      {/* Order details */}
      <section className="py-12">
        <div className="container-xl max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {shipping && (
              <div className="rounded-2xl bg-white p-6" style={cardBorder}>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={labelStyle}>Shipping Address</h3>
                <div className="text-sm space-y-0.5" style={midStyle}>
                  <p className="font-semibold" style={navyStyle}>{shipping.name}</p>
                  <p>{shipping.line1}</p>
                  {shipping.line2 && <p>{shipping.line2}</p>}
                  <p>{shipping.city}, {shipping.state} {shipping.zip}</p>
                  <p>{shipping.email}</p>
                  {shipping.phone && <p>{shipping.phone}</p>}
                </div>
              </div>
            )}
            <div className="rounded-2xl bg-white p-6" style={cardBorder}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={labelStyle}>Order Details</h3>
              <div className="text-sm space-y-2" style={midStyle}>
                <div>
                  <span className="text-xs font-semibold uppercase" style={labelStyle}>Type</span>
                  <p className="font-semibold capitalize" style={navyStyle}>{order.order_type}</p>
                </div>
                {order.tracking_number && (
                  <div>
                    <span className="text-xs font-semibold uppercase" style={labelStyle}>Tracking</span>
                    <p className="font-mono font-semibold" style={navyStyle}>{order.tracking_number}</p>
                  </div>
                )}
              </div>
              {order.patient_notes && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-1" style={labelStyle}>Order Notes</h4>
                  <p className="text-sm" style={midStyle}>{order.patient_notes}</p>
                </div>
              )}
            </div>
          </div>

          <OrderItemsTable items={items} order={order} />

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/peptides" className="btn-primary">Continue Shopping</Link>
            <Link href="/account" className="btn-outline">View Order History</Link>
          </div>
        </div>
      </section>
    </>
  );
}
