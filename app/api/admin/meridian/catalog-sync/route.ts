import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';
import { catalogSync } from '@/lib/meridian';
import type { MeridianProduct } from '@/lib/types/meridian';

/**
 * POST /api/admin/meridian/catalog-sync
 * Reads all active products from Supabase and pushes them to Meridian.
 * Body: { syncType?: "full" | "delta" }
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const syncType = body.syncType === 'full' ? 'full' : 'delta';

  // Fetch all active products from Supabase
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, description, long_description, category, price_cents, image_url, sku, stock_quantity, requires_prescription, metadata')
    .eq('is_active', true)
    .order('sort_order');

  if (error || !products) {
    return NextResponse.json({ error: 'Failed to fetch products', details: error }, { status: 500 });
  }

  // Map Supabase products → Meridian format
  const meridianProducts: MeridianProduct[] = products.map((p) => ({
    partnerProductId: p.id,
    sku: p.sku || undefined,
    title: p.name,
    category: (p.category || 'peptides').toLowerCase().replace(/[/ ]+/g, '_'),
    descriptionShort: p.description || undefined,
    descriptionLong: p.long_description || undefined,
    imageUrl: p.image_url || undefined,
    priceModel: 'one_time' as const,
    priceAmount: p.price_cents,
    requiresApproval: p.requires_prescription ?? false,
    inventoryCount: p.stock_quantity ?? undefined,
    shippingProfile: 'standard' as const,
  }));

  try {
    const result = await catalogSync({ syncType, products: meridianProducts });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
