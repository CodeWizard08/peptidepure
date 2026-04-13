import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/meridian';
import { createServiceClient } from '@/lib/supabase/service';
import type { MeridianInboundOrder, OrderAcceptResponse } from '@/lib/types/meridian';
import { sendAdminNotification, newOrderAdminHtml } from '@/lib/email';

/**
 * Meridian orders don't have a Supabase user. We assign them to a
 * system profile. Set MERIDIAN_SYSTEM_PATIENT_ID in .env.local to
 * the profile ID that should own Meridian orders (e.g. admin profile).
 */
function getSystemPatientId(): string {
  const id = process.env.MERIDIAN_SYSTEM_PATIENT_ID;
  if (!id) throw new Error('MERIDIAN_SYSTEM_PATIENT_ID is not set');
  return id;
}

/**
 * POST /api/meridian-orders
 *
 * Meridian calls this endpoint when a customer completes checkout.
 * We verify the signature, store the order in Supabase, decrement
 * stock, and return our order reference so Meridian can track it.
 */
export async function POST(request: Request) {
  // ── Verify webhook signature ──────────────────────────────────────
  const rawBody = await request.text();
  const signature = request.headers.get('x-webhook-signature') || '';

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload: MeridianInboundOrder = JSON.parse(rawBody);

  // Basic validation
  if (!payload.meridianOrderId || !payload.items?.length || !payload.paymentConfirmed) {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // ── Map Meridian items to our order format ────────────────────────
  const orderItems = payload.items.map((item) => ({
    product_id: item.productId,
    product_name: item.title,
    product_slug: '',
    quantity: item.quantity,
    unit_price_cents: item.unitPrice,
    line_total_cents: item.unitPrice * item.quantity,
  }));

  const totalCents = payload.totalAmount;

  // ── Insert order ──────────────────────────────────────────────────
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      patient_id: getSystemPatientId(),
      order_type: 'supplement',
      status: 'pending',
      payment_method: 'stripe_meridian',
      items: orderItems,
      subtotal_cents: totalCents,
      discount_cents: 0,
      total_cents: totalCents,
      shipping_address: {
        name: payload.customerName,
        email: payload.customerEmail,
        line1: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
      },
      patient_notes: `Meridian Order: ${payload.meridianOrderId}`,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('Meridian order insert error:', orderError);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }

  // ── Decrement stock ───────────────────────────────────────────────
  for (const item of payload.items) {
    await supabase.rpc('decrement_stock', {
      p_product_id: item.productId,
      p_quantity: item.quantity,
    });
  }

  // ── Notify admin ──────────────────────────────────────────────────
  await sendAdminNotification(
    `Meridian Order: $${(totalCents / 100).toFixed(2)} from ${payload.customerName}`,
    newOrderAdminHtml({
      id: order.id,
      items: orderItems,
      total_cents: totalCents,
      shipping_address: { name: payload.customerName, email: payload.customerEmail },
    }),
  ).catch((err) => console.error('Admin notification failed:', err));

  // ── Respond with our order ref ────────────────────────────────────
  const response: OrderAcceptResponse = {
    orderId: order.id,
    status: 'accepted',
  };

  return NextResponse.json(response, { status: 200 });
}
