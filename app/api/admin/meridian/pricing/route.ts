import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';
import { pricingUpdate } from '@/lib/meridian';

/**
 * POST /api/admin/meridian/pricing
 * Push current pricing to Meridian.
 * Body: { productIds?: string[] }  — if omitted, pushes all active products.
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select('id, price_cents')
    .eq('is_active', true);

  if (body.productIds?.length) {
    query = query.in('id', body.productIds);
  }

  const { data: products, error } = await query;

  if (error || !products) {
    return NextResponse.json({ error: 'Failed to fetch products', details: error }, { status: 500 });
  }

  const updates = products.map((p) => ({
    partnerProductId: p.id,
    priceAmount: p.price_cents,
  }));

  try {
    const result = await pricingUpdate({ updates });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
