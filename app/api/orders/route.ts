import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { OrderItemJson, ShippingAddress } from '@/lib/types/order';

type OrderItemInput = {
  productId: string;
  quantity: number;
};

type OrderBody = {
  shipping: {
    name: string;
    email: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  };
  notes?: string;
  items: OrderItemInput[];
};

export async function POST(request: Request) {
  const supabase = await createClient();

  // Authenticate
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: OrderBody = await request.json();

  // Validate required fields
  if (
    !body.shipping?.name ||
    !body.shipping?.email ||
    !body.shipping?.line1 ||
    !body.shipping?.city ||
    !body.shipping?.state ||
    !body.shipping?.zip ||
    !body.items?.length
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Fetch product prices from DB (never trust client prices)
  const productIds = body.items.map((i) => i.productId);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, slug, price_cents, is_active')
    .in('id', productIds)
    .eq('is_active', true);

  if (productsError || !products) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }

  // Build a map for lookup
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Validate all products exist and are active
  for (const item of body.items) {
    if (!productMap.has(item.productId)) {
      return NextResponse.json(
        { error: `Product not found or inactive: ${item.productId}` },
        { status: 400 }
      );
    }
    if (item.quantity < 1) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }
  }

  // Build items jsonb array
  const orderItems: OrderItemJson[] = body.items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      product_id: item.productId,
      product_name: product.name,
      product_slug: product.slug,
      quantity: item.quantity,
      unit_price_cents: product.price_cents,
      line_total_cents: product.price_cents * item.quantity,
    };
  });

  // Calculate totals
  const subtotalCents = orderItems.reduce((sum, i) => sum + i.line_total_cents, 0);
  const totalCents = subtotalCents; // No discount for now

  // Build shipping address jsonb
  const shippingAddress: ShippingAddress = {
    name: body.shipping.name,
    email: body.shipping.email,
    phone: body.shipping.phone,
    line1: body.shipping.line1,
    line2: body.shipping.line2,
    city: body.shipping.city,
    state: body.shipping.state,
    zip: body.shipping.zip,
    country: body.shipping.country || 'US',
  };

  // Insert order into existing orders table
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      patient_id: user.id,
      order_type: 'supplement',
      status: 'pending',
      items: orderItems,
      subtotal_cents: subtotalCents,
      discount_cents: 0,
      total_cents: totalCents,
      shipping_address: shippingAddress,
      patient_notes: body.notes || null,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('Order insert error:', orderError);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
