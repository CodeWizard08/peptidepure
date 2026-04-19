import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// GET /api/admin/bundle-components?parentId=<uuid>
// List the component peptides bound to a bundle/protocol product.
export async function GET(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');
  if (!parentId) return NextResponse.json({ error: 'Missing parentId' }, { status: 400 });

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('bundle_components')
    .select('parent_product_id, component_product_id, quantity')
    .eq('parent_product_id', parentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ components: data ?? [] });
}

// PUT /api/admin/bundle-components
// Body: { parentId: uuid, components: [{ componentId: uuid, quantity: int }, ...] }
// Replaces the full component set for the given parent.
export async function PUT(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parentId: string | undefined = body.parentId;
  const components: { componentId: string; quantity: number }[] = body.components ?? [];

  if (!parentId) return NextResponse.json({ error: 'Missing parentId' }, { status: 400 });

  for (const c of components) {
    if (!c.componentId || typeof c.quantity !== 'number' || c.quantity < 1) {
      return NextResponse.json({ error: 'Each component needs componentId and quantity >= 1' }, { status: 400 });
    }
    if (c.componentId === parentId) {
      return NextResponse.json({ error: 'A product cannot be its own component' }, { status: 400 });
    }
  }

  const supabase = getAdminSupabase();

  const { error: delErr } = await supabase
    .from('bundle_components')
    .delete()
    .eq('parent_product_id', parentId);

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  if (components.length > 0) {
    const rows = components.map((c) => ({
      parent_product_id: parentId,
      component_product_id: c.componentId,
      quantity: c.quantity,
    }));
    const { error: insErr } = await supabase.from('bundle_components').insert(rows);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: components.length });
}
