'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { createClient } from '@/lib/supabase/client';
import { formatCents } from '@/lib/format';
import type { User } from '@supabase/supabase-js';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const { items, cartTotal, clearCart } = useCart();

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Shipping form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('invoice');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthLoading(false);
      if (user) {
        setName(user.user_metadata?.full_name || '');
        setEmail(user.email || '');
        setPhone(user.user_metadata?.phone || '');
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/account');
    }
  }, [authLoading, user, router]);

  // Redirect if cart is empty (after initial load)
  useEffect(() => {
    if (!authLoading && items.length === 0) {
      router.push('/cart');
    }
  }, [authLoading, items.length, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !address1 || !city || !state || !zip) {
      setError('Please fill in all required shipping fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping: {
            name,
            email,
            phone: phone || undefined,
            line1: address1,
            line2: address2 || undefined,
            city,
            state,
            zip,
            country: 'US',
          },
          notes: notes || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to place order. Please try again.');
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/order-confirmation/${data.orderId}`);
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  if (authLoading || !user || items.length === 0) {
    return (
      <div className="py-20 flex justify-center">
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }}
        />
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="container-xl">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left — Shipping + Payment */}
            <div className="flex-1 min-w-0 space-y-8">
              {/* Shipping Information */}
              <div
                className="rounded-2xl bg-white p-6 md:p-8"
                style={{ border: '1px solid var(--border)' }}
              >
                <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--navy)' }}>
                  Shipping Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Full Name *" value={name} onChange={setName} />
                    <InputField label="Email *" type="email" value={email} onChange={setEmail} />
                  </div>
                  <InputField label="Phone" type="tel" value={phone} onChange={setPhone} />
                  <InputField label="Address Line 1 *" value={address1} onChange={setAddress1} />
                  <InputField label="Address Line 2" value={address2} onChange={setAddress2} />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <InputField label="City *" value={city} onChange={setCity} />
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-light)' }}>
                        State *
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full py-3 px-3 text-sm rounded-xl bg-transparent focus:outline-none"
                        style={{
                          background: 'rgba(11,31,58,0.04)',
                          border: '1px solid rgba(11,31,58,0.1)',
                          color: 'var(--text-dark)',
                        }}
                      >
                        <option value="">Select</option>
                        {US_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <InputField label="ZIP Code *" value={zip} onChange={setZip} />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div
                className="rounded-2xl bg-white p-6 md:p-8"
                style={{ border: '1px solid var(--border)' }}
              >
                <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--navy)' }}>
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <PaymentOption
                    value="invoice"
                    label="Invoice (Net 30)"
                    description="We'll send an invoice to your email after order confirmation."
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                  />
                  <PaymentOption
                    value="wire"
                    label="Wire Transfer"
                    description="Bank wire details will be provided in your order confirmation email."
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                  />
                  <PaymentOption
                    value="credit_card"
                    label="Credit Card"
                    description="Stripe integration coming soon."
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                    disabled
                    badge="Coming Soon"
                  />
                </div>
              </div>

              {/* Order Notes */}
              <div
                className="rounded-2xl bg-white p-6 md:p-8"
                style={{ border: '1px solid var(--border)' }}
              >
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--navy)' }}>
                  Order Notes <span className="text-xs font-normal" style={{ color: 'var(--text-light)' }}>(optional)</span>
                </h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Special instructions or notes about your order…"
                  className="w-full py-3 px-4 text-sm rounded-xl bg-transparent focus:outline-none resize-none"
                  style={{
                    background: 'rgba(11,31,58,0.04)',
                    border: '1px solid rgba(11,31,58,0.1)',
                    color: 'var(--text-dark)',
                  }}
                />
              </div>
            </div>

            {/* Right — Order Summary */}
            <div className="lg:w-96 shrink-0">
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
                  <div className="p-6">
                    {/* Items */}
                    <div className="space-y-3 mb-6">
                      {items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-lg overflow-hidden shrink-0"
                            style={{ background: 'linear-gradient(135deg, #0B1F3A, #1a3a6b)' }}
                          >
                            <img
                              src={item.imageUrl || '/images/oral-peptides.png'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: 'var(--navy)' }}>
                              {item.name}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-light)' }}>
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold shrink-0" style={{ color: 'var(--navy)' }}>
                            {formatCents(item.priceCents * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <hr style={{ borderColor: 'var(--border)' }} />

                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'var(--text-mid)' }}>Subtotal</span>
                        <span className="font-semibold" style={{ color: 'var(--navy)' }}>
                          {formatCents(cartTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'var(--text-mid)' }}>Shipping</span>
                        <span className="font-medium" style={{ color: '#10B981' }}>Free</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'var(--text-mid)' }}>Tax</span>
                        <span style={{ color: 'var(--text-light)' }}>$0.00</span>
                      </div>
                      <hr style={{ borderColor: 'var(--border)' }} />
                      <div className="flex justify-between">
                        <span className="text-sm font-bold" style={{ color: 'var(--navy)' }}>Total</span>
                        <span className="text-xl font-bold" style={{ color: 'var(--gold)' }}>
                          {formatCents(cartTotal)}
                        </span>
                      </div>
                    </div>

                    {error && (
                      <div
                        className="text-sm px-4 py-3 rounded-xl mt-4"
                        style={{
                          background: 'rgba(220,38,38,0.06)',
                          border: '1px solid rgba(220,38,38,0.15)',
                          color: '#DC2626',
                        }}
                      >
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full text-center mt-5"
                      style={submitting ? { opacity: 0.7, pointerEvents: 'none' } : undefined}
                    >
                      {submitting ? 'Placing Order…' : 'Place Order'}
                    </button>

                    <Link
                      href="/cart"
                      className="block text-center text-sm font-medium mt-3 hover:underline"
                      style={{ color: 'var(--text-light)' }}
                    >
                      ← Back to Cart
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ── Helper components ── */

function InputField({
  label,
  type = 'text',
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-light)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-3 px-4 text-sm rounded-xl bg-transparent focus:outline-none"
        style={{
          background: 'rgba(11,31,58,0.04)',
          border: '1px solid rgba(11,31,58,0.1)',
          color: 'var(--text-dark)',
        }}
      />
    </div>
  );
}

function PaymentOption({
  value,
  label,
  description,
  selected,
  onChange,
  disabled = false,
  badge,
}: {
  value: string;
  label: string;
  description: string;
  selected: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  badge?: string;
}) {
  const isSelected = selected === value;
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(value)}
      className="w-full text-left p-4 rounded-xl transition-all duration-200"
      style={{
        background: isSelected ? 'rgba(200,149,44,0.04)' : 'rgba(11,31,58,0.02)',
        border: isSelected ? '1.5px solid var(--gold)' : '1.5px solid var(--border)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
          style={{
            border: isSelected ? '2px solid var(--gold)' : '2px solid var(--border)',
          }}
        >
          {isSelected && (
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} />
          )}
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>
          {label}
        </span>
        {badge && (
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs mt-1 ml-7" style={{ color: 'var(--text-light)' }}>
        {description}
      </p>
    </button>
  );
}
