'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { formatCents } from '@/lib/format';

function CartNoticesBanner({ notices, onDismiss }: { notices: string[]; onDismiss: () => void }) {
  if (notices.length === 0) return null;
  return (
    <div
      className="rounded-2xl p-4 mb-6 flex items-start gap-3"
      style={{
        background: 'rgba(200,149,44,0.08)',
        border: '1px solid rgba(200,149,44,0.3)',
      }}
      role="status"
    >
      <svg
        className="w-5 h-5 shrink-0 mt-0.5"
        style={{ color: 'var(--gold)' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold mb-1" style={{ color: 'var(--navy)' }}>
          Your cart was updated
        </p>
        <ul className="text-xs space-y-0.5" style={{ color: 'var(--text-mid)' }}>
          {notices.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 rounded hover:bg-white/40 transition-colors"
        aria-label="Dismiss"
      >
        <svg
          className="w-4 h-4"
          style={{ color: 'var(--text-light)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export default function CartPage() {
  const { items, cartTotal, updateQuantity, removeFromCart, cartNotices, dismissNotices } = useCart();

  if (items.length === 0) {
    return (
      <section className="py-20">
        <div className="container-xl max-w-md mx-auto">
          {/* Codex round 2 #8 follow-up: reconcile may have removed
              every cart item; surface the notices so the user sees WHY
              their cart is empty. */}
          <CartNoticesBanner notices={cartNotices} onDismiss={dismissNotices} />
          <div className="text-center">
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ background: 'var(--off-white)' }}
            >
              <svg className="w-10 h-10" style={{ color: 'var(--text-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--navy)' }}>
              Your cart is empty
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-light)' }}>
              Browse our catalog and add products to get started.
            </p>
            <Link href="/peptides" className="btn-primary">
              Browse Peptides
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container-xl">
        <CartNoticesBanner notices={cartNotices} onDismiss={dismissNotices} />

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Cart items */}
          <div className="flex-1 min-w-0">
            <div className="space-y-4">
              {items.map((item) => {
                // Audit #9.27 — lead-time SKUs ship with minQty=10 from
                // AddToCartButton. Cart UI must not let the user drop below
                // that floor (the server already rejects, but blocking here
                // saves a failed checkout round-trip).
                const floor = item.minQty ?? 1;
                return (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl"
                  style={{ border: '1px solid var(--border)' }}
                >
                  {/* Image */}
                  <Link href={`/peptides/${item.slug}`} className="shrink-0">
                    <div
                      className="w-20 h-20 rounded-xl overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #0B1F3A, #1a3a6b)' }}
                    >
                      <Image
                        src={item.imageUrl || '/images/oral-peptides.png'}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/peptides/${item.slug}`}
                      className="text-sm font-bold hover:underline block truncate"
                      style={{ color: 'var(--navy)' }}
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
                      {formatCents(item.priceCents)} each
                    </p>
                    {floor > 1 && (
                      <p className="text-[11px] mt-0.5 font-medium" style={{ color: '#D97706' }}>
                        Minimum {floor} vials
                      </p>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div
                    className="flex items-center rounded-lg overflow-hidden shrink-0"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <button
                      onClick={() => {
                        if (item.quantity <= floor) return;
                        updateQuantity(item.productId, item.quantity - 1);
                      }}
                      disabled={item.quantity <= floor}
                      className="px-2.5 py-1.5 text-sm font-bold hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ color: 'var(--text-mid)' }}
                      title={item.quantity <= floor ? `Minimum ${floor}` : undefined}
                    >
                      −
                    </button>
                    <span
                      className="px-3 py-1.5 text-sm font-semibold text-center min-w-[2.5rem]"
                      style={{ color: 'var(--navy)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-sm font-bold hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--text-mid)' }}
                    >
                      +
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="text-right shrink-0 w-24">
                    <p className="text-sm font-bold" style={{ color: 'var(--navy)' }}>
                      {formatCents(item.priceCents * item.quantity)}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 transition-colors group"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4 group-hover:text-red-500" style={{ color: 'var(--text-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                );
              })}
            </div>

            <Link
              href="/peptides"
              className="inline-flex items-center gap-2 text-sm font-medium mt-6 hover:underline"
              style={{ color: 'var(--gold)' }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-24">
              <div
                className="rounded-2xl overflow-hidden bg-white"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="px-6 py-4" style={{ background: 'var(--navy)' }}>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                    Order Summary
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-mid)' }}>
                      Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--navy)' }}>
                      {formatCents(cartTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-mid)' }}>Shipping</span>
                    <span className="font-medium" style={{ color: 'var(--text-light)' }}>
                      Calculated at checkout
                    </span>
                  </div>
                  <hr style={{ borderColor: 'var(--border)' }} />
                  <div className="flex justify-between">
                    <span className="text-sm font-bold" style={{ color: 'var(--navy)' }}>
                      Estimated Total
                    </span>
                    <span className="text-lg font-bold" style={{ color: 'var(--gold)' }}>
                      {formatCents(cartTotal)}
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    className="btn-primary w-full text-center block"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
