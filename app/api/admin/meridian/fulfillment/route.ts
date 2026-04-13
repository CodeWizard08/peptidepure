import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';
import { fulfillmentUpdate } from '@/lib/meridian';
import type { FulfillmentStatus } from '@/lib/types/meridian';

/**
 * POST /api/admin/meridian/fulfillment
 * Notify Meridian that an order has shipped / been delivered / etc.
 *
 * Body: {
 *   orderId: string,            // our Supabase order ID
 *   status: FulfillmentStatus,  // "shipped" | "delivered" | "processing" | "cancelled" | "failed"
 *   trackingNumber?: string,
 *   carrier?: string,
 *   trackingUrl?: string,
 *   estimatedDelivery?: string, // ISO 8601
 * }
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (!body.orderId || !body.status) {
    return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Find the order and extract the Meridian order ID from patient_notes
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, patient_notes')
    .eq('id', body.orderId)
    .eq('payment_method', 'stripe_meridian')
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Extract meridian order ID from notes (format: "Meridian Order: ord_abc123")
  const match = order.patient_notes?.match(/Meridian Order:\s*(\S+)/);
  if (!match) {
    return NextResponse.json({ error: 'No Meridian order ID found on this order' }, { status: 400 });
  }

  const meridianOrderId = match[1];

  try {
    const result = await fulfillmentUpdate({
      meridianOrderId,
      partnerOrderRef: order.id,
      status: body.status as FulfillmentStatus,
      trackingNumber: body.trackingNumber,
      carrier: body.carrier,
      trackingUrl: body.trackingUrl,
      estimatedDelivery: body.estimatedDelivery,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
