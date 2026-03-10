import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';

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

  // Build Stripe line items
  const lineItems = body.items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      price_data: {
        currency: 'usd',
        product_data: { name: product.name },
        unit_amount: product.price_cents,
      },
      quantity: item.quantity,
    };
  });

  const origin = request.headers.get('origin') || 'https://peptidepure.com';

  // Create Stripe Checkout Session
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    customer_email: body.shipping.email,
    metadata: {
      userId: user.id,
      shippingAddress: JSON.stringify(body.shipping),
      notes: body.notes || '',
      items: JSON.stringify(
        body.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          name: productMap.get(i.productId)!.name,
          slug: productMap.get(i.productId)!.slug,
          priceCents: productMap.get(i.productId)!.price_cents,
        }))
      ),
    },
    success_url: `${origin}/order-confirmation/{CHECKOUT_SESSION_ID}?stripe=1`,
    cancel_url: `${origin}/checkout`,
  });

  return NextResponse.json({ sessionUrl: session.url });
}
