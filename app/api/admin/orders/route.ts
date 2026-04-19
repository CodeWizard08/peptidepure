import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, orderStatusUpdateHtml } from '@/lib/email';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — list all orders (admin only)
export async function GET(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const supabase = getAdminSupabase();

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: orders, error, count } = await query;

  if (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }

  return NextResponse.json({ orders, total: count, page, limit });
}

// PATCH — update order status, tracking, notes
export async function PATCH(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { orderId, status, trackingNumber, clinicianNotes } = body;

  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
  }

  const validStatuses = ['pending', 'approved', 'processing', 'completed', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  // Fetch previous state so we can decide whether to email the customer.
  const { data: prevOrder } = await supabase
    .from('orders')
    .select('id, status, tracking_number, shipping_address')
    .eq('id', orderId)
    .single();

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
  if (clinicianNotes !== undefined) updates.clinician_notes = clinicianNotes;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  }

  const { data: order, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select('id, status, tracking_number, clinician_notes, shipping_address')
    .single();

  if (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }

  // Email the customer when status or tracking number has changed (not clinician notes).
  const statusChanged = status && prevOrder?.status !== status;
  const trackingChanged =
    trackingNumber !== undefined &&
    (prevOrder?.tracking_number ?? '') !== (trackingNumber ?? '') &&
    trackingNumber;

  if (statusChanged || trackingChanged) {
    const shipping = (order.shipping_address ?? {}) as { name?: string; email?: string };
    if (shipping.email) {
      const subjectPrefix = trackingChanged && !statusChanged ? 'Tracking added' : 'Order update';
      sendEmail({
        to: shipping.email,
        subject: `${subjectPrefix} — PeptidePure™ #${order.id.slice(0, 8).toUpperCase()}`,
        html: orderStatusUpdateHtml({
          id: order.id,
          customerName: shipping.name || 'Clinician',
          status: order.status,
          trackingNumber: order.tracking_number,
        }),
      }).catch((err) => console.error('Order update email failed:', err));
    }
  }

  return NextResponse.json({ order });
}
