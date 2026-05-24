'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CartItem } from '@/lib/types/order';

const STORAGE_KEY = 'peptidepure_cart';

type CartContextType = {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  // Reconcile-on-mount notices (Codex rescue review #8). Each entry is a
  // human-readable line like "Tirz 30mg removed — no longer available" or
  // "Sema 5mg now requires a 10-vial minimum order." Cleared after the
  // user dismisses or reloads.
  cartNotices: string[];
  dismissNotices: () => void;
};

const CartContext = createContext<CartContextType>({
  items: [],
  cartCount: 0,
  cartTotal: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  cartNotices: [],
  dismissNotices: () => {},
});

type ProductSnapshot = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  image_url: string | null;
  stock_quantity: number | null;
  metadata: { inventory?: string } | null;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [reconciled, setReconciled] = useState(false);
  const [cartNotices, setCartNotices] = useState<string[]>([]);
  const supabase = createClient();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // Reconcile localStorage cart against current product state — once per
  // session, after hydrate. Codex rescue review #8: without this, the cart
  // can show stale prices, miss a lead-time MOQ flip, or display items the
  // admin has deactivated. Server-side validation in /api/checkout would
  // catch all of these, but the user gets no feedback until they hit Pay.
  useEffect(() => {
    if (!loaded || reconciled) return;
    if (items.length === 0) {
      setReconciled(true);
      return;
    }

    // Codex rescue review round 2 #8 follow-up: the by-ids route caps at
    // 50 IDs per request; without chunking, a cart over that cap (or with
    // tampered duplicate entries) would silently skip reconcile entirely.
    const uniqueIds = Array.from(new Set(items.map((i) => i.productId)));
    const CHUNK = 50;
    const chunks: string[][] = [];
    for (let i = 0; i < uniqueIds.length; i += CHUNK) {
      chunks.push(uniqueIds.slice(i, i + CHUNK));
    }
    let cancelled = false;

    // Codex rescue review round 3 — use allSettled so one chunk's failure
    // doesn't drop reconciliation for the rest of the cart. Track which
    // productIds we couldn't check at all; those items get left untouched
    // (we don't know if they're missing or just unreachable). Items in a
    // SUCCESSFUL chunk that aren't returned are truly deleted and get
    // dropped from the cart.
    Promise.allSettled(
      chunks.map((ids) =>
        fetch(`/api/products/by-ids?ids=${encodeURIComponent(ids.join(','))}`)
          .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
          .then((data: { products: ProductSnapshot[] }) => ({ ids, products: data.products }))
      )
    )
      .then((settled) => {
        if (cancelled) return;

        const checkedIds = new Set<string>();
        const byId = new Map<string, ProductSnapshot>();
        let failedChunks = 0;
        for (const result of settled) {
          if (result.status === 'fulfilled') {
            for (const id of result.value.ids) checkedIds.add(id);
            for (const p of result.value.products) byId.set(p.id, p);
          } else {
            failedChunks += 1;
            console.warn('[cart] reconcile chunk failed:', result.reason);
          }
        }

        const notices: string[] = [];

        setItems((prev) => {
          const reconciledItems: CartItem[] = [];
          for (const item of prev) {
            // Item lives in a chunk we couldn't fetch — leave it alone.
            if (!checkedIds.has(item.productId)) {
              reconciledItems.push(item);
              continue;
            }
            const fresh = byId.get(item.productId);
            if (!fresh) {
              notices.push(`${item.name} was removed from your cart — no longer available.`);
              continue;
            }

            const wasLeadTime = item.minQty != null && item.minQty > 1;
            const nowLeadTime = fresh.metadata?.inventory === 'lead_time';
            const newMinQty = nowLeadTime ? 10 : undefined;
            const newQuantity = Math.max(newMinQty ?? 1, item.quantity);

            if (!wasLeadTime && nowLeadTime) {
              notices.push(`${fresh.name} now requires a 10-vial minimum order — your quantity was bumped up.`);
            }
            if (item.priceCents !== fresh.price_cents) {
              notices.push(
                `${fresh.name} price updated to $${(fresh.price_cents / 100).toFixed(2)}.`
              );
            }

            reconciledItems.push({
              productId: fresh.id,
              name: fresh.name,
              slug: fresh.slug,
              priceCents: fresh.price_cents,
              imageUrl: fresh.image_url,
              quantity: newQuantity,
              minQty: newMinQty,
            });
          }
          return reconciledItems;
        });

        if (failedChunks > 0) {
          notices.push(
            `Could not verify ${failedChunks === 1 ? 'one part' : `${failedChunks} parts`} of your cart against current pricing. Refresh to retry.`
          );
        }
        if (notices.length > 0) setCartNotices(notices);
        setReconciled(true);
      });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // Persist to localStorage on change
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  // Clear cart on sign out
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setItems([]);
        localStorage.removeItem(STORAGE_KEY);
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId !== productId) return i;
        // Audit #9.27 — floor at the item's MOQ if one was set (lead-time SKUs).
        const floor = i.minQty ?? 1;
        return { ...i, quantity: Math.max(floor, quantity) };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const dismissNotices = useCallback(() => {
    setCartNotices([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartNotices,
        dismissNotices,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
