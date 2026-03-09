'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { createClient } from '@/lib/supabase/client';
import { formatCents } from '@/lib/format';
import type { User } from '@supabase/supabase-js';

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    price_cents: number;
    image_url: string | null;
  };
};

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = () => {
    addToCart(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        priceCents: product.price_cents,
        imageUrl: product.image_url,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="btn-primary opacity-50 pointer-events-none">Loading…</div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/account" className="btn-primary">
          Login to Order
        </Link>
        <Link href="/contact" className="btn-outline">
          Contact Us
        </Link>
      </div>
    );
  }

  // Logged in
  return (
    <div className="mb-8">
      {/* Price */}
      <div className="mb-4">
        <span className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
          {formatCents(product.price_cents)}
        </span>
        <span className="text-xs ml-2" style={{ color: 'var(--text-light)' }}>per unit</span>
      </div>

      {/* Quantity + Add to Cart */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex items-center rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2.5 text-sm font-bold hover:bg-gray-50 transition-colors"
            style={{ color: 'var(--text-mid)' }}
          >
            −
          </button>
          <span
            className="px-4 py-2.5 text-sm font-semibold min-w-[3rem] text-center"
            style={{ color: 'var(--navy)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}
          >
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-2.5 text-sm font-bold hover:bg-gray-50 transition-colors"
            style={{ color: 'var(--text-mid)' }}
          >
            +
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={added}
          className="btn-primary flex items-center gap-2"
          style={added ? { background: '#10B981' } : undefined}
        >
          {added ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Added to Cart
            </>
          ) : (
            'Add to Cart'
          )}
        </button>

        <Link href="/contact" className="btn-outline">
          Contact Us
        </Link>
      </div>

      {/* View cart link after adding */}
      {added && (
        <Link
          href="/cart"
          className="inline-flex items-center gap-1 text-sm font-medium mt-3 hover:underline"
          style={{ color: 'var(--gold)' }}
        >
          View Cart →
        </Link>
      )}
    </div>
  );
}
