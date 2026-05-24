import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_IDS = 50;

// GET /api/products/by-ids?ids=<uuid>,<uuid>,...
// Returns the current public view of each active product so the cart can
// reconcile localStorage state against latest pricing / inventory metadata
// (Codex rescue review #8: stale lead-time metadata in cart).
//
// Inactive or missing products are silently omitted from the response so
// the client can compare requested IDs against returned IDs to detect
// drops. This route returns ONLY public-safe fields — no admin-only data.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('ids') ?? '';

  const ids = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => UUID_RE.test(s));

  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }
  if (ids.length > MAX_IDS) {
    return NextResponse.json(
      { error: `Too many ids — max ${MAX_IDS}` },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, price_cents, image_url, stock_quantity, metadata')
    .in('id', ids)
    .eq('is_active', true);

  if (error) {
    console.error('products/by-ids fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }

  return NextResponse.json({ products: data ?? [] });
}
