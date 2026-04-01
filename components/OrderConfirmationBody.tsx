import Link from 'next/link';
import { formatCents, formatOrderNumber, formatDate } from '@/lib/format';
import OrderItemsTable from '@/components/OrderItemsTable';
import type { Order, OrderItemJson, ShippingAddress } from '@/lib/types/order';

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:    { bg: 'var(--gold-pale)', color: 'var(--gold)' },
  approved:   { bg: '#D1FAE5', color: '#065F46' },
  confirmed:  { bg: '#DBEAFE', color: '#1E40AF' },
  processing: { bg: '#E0E7FF', color: '#3730A3' },
  shipped:    { bg: '#D1FAE5', color: '#065F46' },
  delivered:  { bg: '#D1FAE5', color: '#065F46' },
  cancelled:  { bg: '#FEE2E2', color: '#991B1B' },
};

interface Props {
  order: Order;
  items: OrderItemJson[];
  shipping: ShippingAddress | null;
}

export default function OrderConfirmationBody({ order, items, shipping }: Props) {
  const ss = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;
  const isPaid = order.payment_method === 'credit_card';
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  // Build a human-readable item summary: "BPC-157 ×2, NAD+ ×1"
  const itemSummary = items
    .slice(0, 3)
    .map((i) => `${i.product_name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`)
    .join(', ') + (items.length > 3 ? ` +${items.length - 3} more` : '');

  return (
    <>
      {/* ── Hero confirmation banner ── */}
      <section
        className="py-16"
        style={{
          background: 'linear-gradient(150deg, #07172b 0%, #0B1F3A 50%, #0f2845 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dot grid */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, rgba(200,149,44,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="container-xl max-w-2xl text-center" style={{ position: 'relative' }}>
          {/* Checkmark */}
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.3)' }}
          >
            <svg className="w-10 h-10" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Main confirmation headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            {isPaid ? 'Payment Complete' : 'Order Received'}
          </h1>

          {/* Personalized summary */}
          <p className="text-base mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Your order of{' '}
            <strong style={{ color: 'white' }}>
              {totalQty} item{totalQty !== 1 ? 's' : ''}
            </strong>
            {' '}totaling{' '}
            <strong style={{ color: 'var(--gold)' }}>
              {formatCents(order.total_cents)}
            </strong>
            {' '}{isPaid ? 'has been paid and confirmed.' : 'has been received and is pending review.'}
          </p>

          {/* Item list teaser */}
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {itemSummary}
          </p>

          {/* Order number + status chip */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span className="text-sm font-mono font-bold text-white">{formatOrderNumber(order.id)}</span>
            <span className="w-px h-4" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: ss.bg, color: ss.color }}
            >
              {order.status}
            </span>
            <span className="w-px h-4" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {formatDate(order.created_at)}
            </span>
          </div>

          {/* Email notice */}
          <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
            A confirmation email has been sent to{' '}
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{shipping?.email}</span>
          </p>
        </div>
      </section>

      {/* ── Order details section ── */}
      <section className="py-12" style={{ background: 'var(--off-white)' }}>
        <div className="container-xl max-w-3xl">

          {/* Status callout card */}
          <div
            className="rounded-2xl p-5 mb-8 flex items-start gap-4"
            style={{
              background: isPaid ? 'rgba(16,185,129,0.05)' : 'var(--gold-pale)',
              border: `1.5px solid ${isPaid ? 'rgba(16,185,129,0.2)' : 'rgba(200,149,44,0.25)'}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: isPaid ? '#10B981' : 'var(--gold)' }}
            >
              {isPaid ? (
                <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: isPaid ? '#065F46' : 'var(--navy)' }}>
                {isPaid
                  ? `Payment of ${formatCents(order.total_cents)} processed successfully`
                  : `Order ${formatOrderNumber(order.id)} is pending review`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: isPaid ? '#047857' : 'var(--text-mid)' }}>
                {isPaid
                  ? 'Your card has been charged and your order is confirmed. We&apos;ll ship as soon as possible.'
                  : 'Our team will review your order and send an invoice within 1 business day.'}
              </p>
            </div>
          </div>

          {/* Address + details cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {shipping && (
              <div className="rounded-2xl bg-white p-6" style={{ border: '1.5px solid var(--border)' }}>
                <h3 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-light)' }}>
                  Ship To
                </h3>
                <div className="text-sm space-y-0.5" style={{ color: 'var(--text-mid)' }}>
                  <p className="font-semibold text-base" style={{ color: 'var(--navy)' }}>{shipping.name}</p>
                  <p>{shipping.line1}</p>
                  {shipping.line2 && <p>{shipping.line2}</p>}
                  <p>{shipping.city}, {shipping.state} {shipping.zip}</p>
                  <p className="mt-2 text-xs" style={{ color: 'var(--text-light)' }}>{shipping.email}</p>
                  {shipping.phone && <p className="text-xs" style={{ color: 'var(--text-light)' }}>{shipping.phone}</p>}
                </div>
              </div>
            )}
            <div className="rounded-2xl bg-white p-6" style={{ border: '1.5px solid var(--border)' }}>
              <h3 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-light)' }}>
                Order Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-mid)' }}>Order number</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--navy)' }}>{formatOrderNumber(order.id)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-mid)' }}>Date placed</span>
                  <span style={{ color: 'var(--navy)' }}>{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-mid)' }}>Payment</span>
                  <span style={{ color: 'var(--navy)' }}>{isPaid ? 'Credit card' : 'Invoice'}</span>
                </div>
                {order.tracking_number && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-mid)' }}>Tracking</span>
                    <span className="font-mono font-semibold" style={{ color: 'var(--navy)' }}>{order.tracking_number}</span>
                  </div>
                )}
              </div>
              {order.patient_notes && (
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-light)' }}>Notes</p>
                  <p className="text-xs" style={{ color: 'var(--text-mid)' }}>{order.patient_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items table */}
          <OrderItemsTable items={items} order={order} />

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <Link
              href="/account?tab=orders"
              className="btn-primary"
            >
              View Order History
            </Link>
            <Link href="/peptides" className="btn-outline">
              Continue Shopping
            </Link>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: 'var(--text-light)' }}>
            Questions about your order?{' '}
            <Link href="/contact" className="underline" style={{ color: 'var(--gold)' }}>
              Contact us
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
