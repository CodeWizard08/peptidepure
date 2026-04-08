/**
 * POST /api/inventory-notifications
 *
 * Captures email addresses for restock notifications. Inserts into the
 * inventory_notifications table (must be created via migration 003).
 *
 * Request body: { productId: string, email: string }
 * Responses:
 *   201 — subscribed (or already subscribed; idempotent on the unique constraint)
 *   400 — validation error
 *   500 — DB error
 *
 * Note: this endpoint deliberately accepts unauthenticated requests since
 * the goal is broad funnel capture, not authenticated user actions. RLS
 * on the table allows public inserts.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { productId?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const productId = body.productId?.trim();
  const email = body.email?.trim().toLowerCase();

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Verify the product exists before subscribing
  const { data: product, error: productErr } = await supabase
    .from('products')
    .select('id, name')
    .eq('id', productId)
    .eq('is_active', true)
    .maybeSingle();

  if (productErr || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 400 });
  }

  // Insert; treat unique-violation as a successful idempotent operation
  const { error } = await supabase
    .from('inventory_notifications')
    .insert({ product_id: productId, email });

  if (error) {
    // Postgres unique violation = already subscribed → still report success
    if (error.code === '23505') {
      return NextResponse.json(
        { success: true, message: 'Already subscribed for this product.' },
        { status: 200 }
      );
    }
    // Table missing — give the developer a clear hint
    if (error.code === '42P01') {
      console.error('inventory_notifications table missing — run migration 003');
      return NextResponse.json(
        { error: 'Notification system is being set up. Please try again later.' },
        { status: 503 }
      );
    }
    console.error('inventory_notifications insert error:', error);
    return NextResponse.json({ error: 'Could not save your subscription' }, { status: 500 });
  }

  return NextResponse.json(
    {
      success: true,
      message: `We'll email you when ${product.name} is back in stock.`,
    },
    { status: 201 }
  );
}
