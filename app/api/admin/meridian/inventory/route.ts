import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';
import { inventoryUpdate } from '@/lib/meridian';

/**
 * POST /api/admin/meridian/inventory
 * Push current inventory levels to Meridian.
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
    .select('id, sku, stock_quantity')
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
    sku: p.sku || undefined,
    quantity: p.stock_quantity ?? 0,
    reason: 'sync' as const,
  }));

  try {
    const result = await inventoryUpdate({ updates });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
