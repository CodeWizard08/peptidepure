import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/meridian';
import { createClient } from '@/lib/supabase/server';
import type { MeridianWebhookPayload } from '@/lib/types/meridian';

/**
 * POST /api/meridian-webhook
 *
 * Receives webhook events from Meridian:
 *   - order.confirmed
 *   - order.status_changed
 *   - order.cancelled
 *   - order.refunded
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-webhook-signature') || '';

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload: MeridianWebhookPayload = JSON.parse(rawBody);
  const supabase = await createClient();

  // Find our order by the Meridian order ID stored in patient_notes
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status')
    .eq('order_type', 'meridian')
    .ilike('patient_notes', `%${payload.orderId}%`)
    .limit(1);

  const order = orders?.[0];

  if (!order) {
    console.warn(`Meridian webhook: no matching order for ${payload.orderId}`);
    return NextResponse.json({ received: true, matched: false }, { status: 200 });
  }

  // Map Meridian status → our status
  let newStatus: string | null = null;
  switch (payload.event) {
    case 'order.confirmed':
      newStatus = 'approved';
      break;
    case 'order.cancelled':
      newStatus = 'cancelled';
      break;
    case 'order.refunded':
      newStatus = 'cancelled';
      break;
    case 'order.status_changed':
      if (payload.orderStatus === 'processing') newStatus = 'processing';
      if (payload.orderStatus === 'cancelled') newStatus = 'cancelled';
      break;
  }

  if (newStatus && newStatus !== order.status) {
    await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', order.id);
  }

  return NextResponse.json({ received: true, orderId: order.id }, { status: 200 });
}
