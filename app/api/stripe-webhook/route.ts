import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, sendAdminNotification, orderConfirmationHtml, newOrderAdminHtml } from '@/lib/email';

// Use service role for webhook (no user session)
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true });
    }

    const metadata = session.metadata || {};
    const shipping = JSON.parse(metadata.shippingAddress || '{}');
    const items = JSON.parse(metadata.items || '[]');

    // Build order items
    const orderItems = items.map((i: { productId: string; name: string; slug: string; priceCents: number; quantity: number }) => ({
      product_id: i.productId,
      product_name: i.name,
      product_slug: i.slug,
      quantity: i.quantity,
      unit_price_cents: i.priceCents,
      line_total_cents: i.priceCents * i.quantity,
    }));

    const subtotalCents = orderItems.reduce((sum: number, i: { line_total_cents: number }) => sum + i.line_total_cents, 0);

    const supabase = getAdminSupabase();

    // Create order in DB
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        patient_id: metadata.userId,
        order_type: 'supplement',
        status: 'confirmed',
        payment_method: 'credit_card',
        stripe_session_id: session.id,
        items: orderItems,
        subtotal_cents: subtotalCents,
        discount_cents: 0,
        total_cents: subtotalCents,
        shipping_address: {
          name: shipping.name,
          email: shipping.email,
          phone: shipping.phone,
          line1: shipping.line1,
          line2: shipping.line2,
          city: shipping.city,
          state: shipping.state,
          zip: shipping.zip,
          country: 'US',
        },
        patient_notes: metadata.notes || null,
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Order creation from webhook failed:', orderError);
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
    }

    // Decrement stock
    for (const item of items) {
      await supabase.rpc('decrement_stock', {
        p_product_id: item.productId,
        p_quantity: item.quantity,
      });
    }

    // Send emails (fire and forget)
    if (order) {
      const orderData = {
        id: order.id,
        items: orderItems,
        total_cents: subtotalCents,
        shipping_address: shipping,
      };
      sendEmail({
        to: shipping.email,
        subject: `Order Confirmed — ${order.id.slice(0, 8).toUpperCase()}`,
        html: orderConfirmationHtml(orderData),
      });
      sendAdminNotification(
        `New Order: $${(subtotalCents / 100).toFixed(2)} from ${shipping.name}`,
        newOrderAdminHtml(orderData)
      );
    }
  }

  return NextResponse.json({ received: true });
}
