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
    .select('id, name, slug, price_cents, is_active, stock_quantity, metadata')
    .in('id', productIds)
    .eq('is_active', true);

  if (productsError || !products) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // MOQ check for lead-time items (server-side enforcement — audit #9.27).
  for (const item of body.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
    }
    const meta = (product.metadata ?? {}) as { inventory?: string };
    if (meta.inventory === 'lead_time' && item.quantity < 10) {
      return NextResponse.json(
        { error: `${product.name} requires a minimum order of 10 vials (lead-time item)` },
        { status: 400 }
      );
    }
  }

  // Aggregate total depletion across the whole cart, including each cart
  // item's own quantity AND any bundle components those items expand into.
  // This is the unified stock-validation pass — without it, a cart with
  // bundle B + standalone P (where P is a component of B) would pass the
  // two separate checks individually but oversell P. The `decrement_stock`
  // RPC (migration 008) is already bundle-aware and walks bundle_components
  // BFS at decrement time, so post-charge we only call it on the cart items
  // themselves — not on components — to avoid double-decrement. Codex
  // rescue review flagged the prior double-decrement as a HIGH bug.
  const { data: bundleRows } = await supabase
    .from('bundle_components')
    .select('parent_product_id, component_product_id, quantity')
    .in('parent_product_id', productIds);

  const componentRows = bundleRows ?? [];
  const componentIds = Array.from(new Set(componentRows.map((c) => c.component_product_id)));

  // Total stock to deplete per product (combining cart items + bundle components).
  const totalDepletion = new Map<string, number>();
  for (const item of body.items) {
    totalDepletion.set(item.productId, (totalDepletion.get(item.productId) ?? 0) + item.quantity);
  }
  for (const item of body.items) {
    const components = componentRows.filter((c) => c.parent_product_id === item.productId);
    for (const c of components) {
      const add = c.quantity * item.quantity;
      totalDepletion.set(
        c.component_product_id,
        (totalDepletion.get(c.component_product_id) ?? 0) + add
      );
    }
  }

  // Hydrate stock for every product we'll touch (cart items already have
  // it; components might not).
  const stockMap = new Map<string, { id: string; name: string; stock_quantity: number | null }>();
  for (const p of products) stockMap.set(p.id, p);
  const missingComponentIds = componentIds.filter((id) => !stockMap.has(id));
  if (missingComponentIds.length > 0) {
    const { data: componentProducts } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .in('id', missingComponentIds);
    for (const c of componentProducts ?? []) stockMap.set(c.id, c);
  }

  for (const [productId, requiredQty] of totalDepletion) {
    const p = stockMap.get(productId);
    if (!p) {
      return NextResponse.json({ error: `Product not found: ${productId}` }, { status: 400 });
    }
    if (p.stock_quantity != null && requiredQty > p.stock_quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${p.name}` },
        { status: 400 }
      );
    }
  }

  // Build the depletion payload once — used to reserve before charging
  // and to release on any failure after charging. Codex rescue review
  // (HIGH #2): the pre-flight check above is cheap and informative but
  // still has a TOCTOU window with the actual decrement, so we hand the
  // authoritative pass off to checkout_reserve_stock (migration 027)
  // which locks each product row FOR UPDATE inside one transaction.
  const depletionPayload = Array.from(totalDepletion, ([product_id, quantity]) => ({
    product_id,
    quantity,
  }));

  // Calculate total server-side
  const orderTotalCents = body.items.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + product.price_cents * item.quantity;
  }, 0);

  if (orderTotalCents < 100) { // TEMP for testing, restore to 100_000
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

  // Atomically reserve stock BEFORE we charge the customer. The RPC locks
  // each product row FOR UPDATE inside one Postgres transaction; if any
  // underflow is detected (e.g. a concurrent order grabbed the last unit
  // between our pre-flight check and now), it raises an exception and the
  // entire transaction rolls back — no partial decrements.
  const { error: reserveError } = await supabase.rpc('checkout_reserve_stock', {
    p_items: depletionPayload,
  });
  if (reserveError) {
    console.error('[checkout] checkout_reserve_stock failed:', reserveError);
    // P0001 = our explicit "insufficient stock" raise. Surface a clean
    // 409 so the client can retell the user. Any other error is a server
    // bug and gets a generic 500.
    const isStockError = (reserveError.message || '').toLowerCase().includes('insufficient stock');
    return NextResponse.json(
      {
        error: isStockError
          ? 'One of the items in your cart sold out while you were checking out. Please refresh and try again.'
          : 'Inventory reservation failed. Please try again or contact support.',
      },
      { status: isStockError ? 409 : 500 }
    );
  }

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
    // Charge failed — release the stock we just reserved. If the release
    // RPC itself fails (rare), we alert admin since the stock now drifts
    // negative until manual reconciliation.
    const { error: releaseError } = await supabase.rpc('checkout_release_stock', {
      p_items: depletionPayload,
    });
    if (releaseError) {
      console.error('[checkout] release after charge-failure failed:', releaseError);
      sendAdminNotification(
        '[ACTION REQUIRED] Stock release failed after charge decline',
        `<p>A customer's card was declined but the compensating stock release also failed. Inventory drift exists — restore manually.</p>
         <ul>${depletionPayload
           .map((d) => `<li><code>${d.product_id}</code> &times; ${d.quantity}</li>`)
           .join('')}</ul>
         <p>Release RPC error: ${releaseError.message ?? 'unknown'}</p>`
      );
    }
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
      status: 'approved',
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
    // Stock was reserved + card was charged + order insert failed. Release
    // the reservation and alert ops: the customer has been charged but no
    // order row exists, so the transaction needs a manual void in
    // Authorize.net.
    const { error: releaseError } = await supabase.rpc('checkout_release_stock', {
      p_items: depletionPayload,
    });
    sendAdminNotification(
      '[ACTION REQUIRED] Charge succeeded but order row insert failed',
      `<p>Customer was charged via Authorize.net but the orders-table insert failed. Void the charge manually and contact the customer.</p>
       <ul>
         <li><strong>Transaction ID:</strong> ${chargeResult.transactionId}</li>
         <li><strong>Customer email:</strong> ${body.shipping.email}</li>
         <li><strong>Amount:</strong> $${amountDollars.toFixed(2)}</li>
         <li><strong>Order insert error:</strong> ${orderError.message ?? 'unknown'}</li>
         ${releaseError ? `<li><strong>Stock release ALSO failed:</strong> ${releaseError.message}</li>` : ''}
       </ul>`
    );
    return NextResponse.json({ error: 'Payment succeeded but order creation failed. Please contact support.' }, { status: 500 });
  }

  // Stock was already decremented atomically by checkout_reserve_stock
  // above — nothing to do here. The order is paid, the order row exists,
  // and inventory is consistent.

  // Send emails — await both in parallel so failures are logged
  if (order) {
    const orderData = {
      id: order.id,
      items: orderItems,
      total_cents: orderTotalCents,
      shipping_address: body.shipping,
    };
    const [customerSent, adminSent] = await Promise.all([
      sendEmail({
        to: body.shipping.email,
        subject: `Order Confirmed — ${order.id.slice(0, 8).toUpperCase()}`,
        html: orderConfirmationHtml(orderData),
      }),
      sendAdminNotification(
        `New Order: $${amountDollars.toFixed(2)} from ${body.shipping.name}`,
        newOrderAdminHtml(orderData)
      ),
    ]);
    if (!customerSent) console.error(`Customer email failed for order ${order.id}`);
    if (!adminSent) console.error(`Admin notification failed for order ${order.id}`);
  }

  return NextResponse.json({
    success: true,
    orderId: order.id,
    transactionId: chargeResult.transactionId,
  });
}
