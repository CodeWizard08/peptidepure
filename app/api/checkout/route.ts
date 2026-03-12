import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chargeCard } from '@/lib/authorizenet';
import { sendEmail, sendAdminNotification, orderConfirmationHtml, newOrderAdminHtml } from '@/lib/email';

type CheckoutItem = {
  productId: string;
  quantity: number;
};

type CheckoutBody = {
  items: CheckoutItem[];
  shipping: {
    name: string;
    email: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  notes?: string;
  payment: {
    dataDescriptor: string;
    dataValue: string;
  };
};

export async function POST(request: Request) {
  const supabase = await createClient();

  // Authenticate
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: CheckoutBody = await request.json();

  if (!body.items?.length || !body.shipping?.name || !body.shipping?.email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!body.payment?.dataDescriptor || !body.payment?.dataValue) {
    return NextResponse.json({ error: 'Missing payment data' }, { status: 400 });
  }

  // Fetch products from DB
  const productIds = body.items.map((i) => i.productId);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, slug, price_cents, is_active, stock_quantity')
    .in('id', productIds)
    .eq('is_active', true);

  if (productsError || !products) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Validate products and stock
  for (const item of body.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
    }
    if (product.stock_quantity != null && item.quantity > product.stock_quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product.name}` },
        { status: 400 }
      );
    }
  }

  // Calculate total server-side
  const orderTotalCents = body.items.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + product.price_cents * item.quantity;
  }, 0);

  if (orderTotalCents < 100_000) {
    return NextResponse.json(
      { error: 'Minimum order is $1,000. For smaller orders, please email info@peptidepure.com.' },
      { status: 400 }
    );
  }

  const amountDollars = orderTotalCents / 100;

  // Split name for billing
  const nameParts = body.shipping.name.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || firstName;

  // Build order description
  const orderDesc = body.items
    .map((i) => {
      const p = productMap.get(i.productId)!;
      return `${p.name} x${i.quantity}`;
    })
    .join(', ');

  // Charge via Authorize.net
  const chargeResult = await chargeCard({
    opaqueDataDescriptor: body.payment.dataDescriptor,
    opaqueDataValue: body.payment.dataValue,
    amount: amountDollars,
    billTo: {
      firstName,
      lastName,
      address: body.shipping.line1,
      city: body.shipping.city,
      state: body.shipping.state,
      zip: body.shipping.zip,
      country: 'US',
    },
    orderDescription: orderDesc,
    customerEmail: body.shipping.email,
  });

  if (!chargeResult.success) {
    return NextResponse.json(
      { error: chargeResult.message || 'Payment declined. Please check your card details and try again.' },
      { status: 402 }
    );
  }

  // Build order items
  const orderItems = body.items.map((i) => {
    const p = productMap.get(i.productId)!;
    return {
      product_id: i.productId,
      product_name: p.name,
      product_slug: p.slug,
      quantity: i.quantity,
      unit_price_cents: p.price_cents,
      line_total_cents: p.price_cents * i.quantity,
    };
  });

  // Create order in DB
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      patient_id: user.id,
      order_type: 'supplement',
      status: 'confirmed',
      payment_method: 'credit_card',
      transaction_id: chargeResult.transactionId,
      items: orderItems,
      subtotal_cents: orderTotalCents,
      discount_cents: 0,
      total_cents: orderTotalCents,
      shipping_address: {
        name: body.shipping.name,
        email: body.shipping.email,
        phone: body.shipping.phone,
        line1: body.shipping.line1,
        line2: body.shipping.line2,
        city: body.shipping.city,
        state: body.shipping.state,
        zip: body.shipping.zip,
        country: 'US',
      },
      patient_notes: body.notes || null,
    })
    .select('id')
    .single();

  if (orderError) {
    console.error('Order creation failed:', orderError);
    return NextResponse.json({ error: 'Payment succeeded but order creation failed. Please contact support.' }, { status: 500 });
  }

  // Decrement stock
  for (const item of body.items) {
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
      total_cents: orderTotalCents,
      shipping_address: body.shipping,
    };
    sendEmail({
      to: body.shipping.email,
      subject: `Order Confirmed — ${order.id.slice(0, 8).toUpperCase()}`,
      html: orderConfirmationHtml(orderData),
    });
    sendAdminNotification(
      `New Order: $${amountDollars.toFixed(2)} from ${body.shipping.name}`,
      newOrderAdminHtml(orderData)
    );
  }

  return NextResponse.json({
    success: true,
    orderId: order.id,
    transactionId: chargeResult.transactionId,
  });
}
