import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

type InventoryRow = {
  product: string;
  dose: string;
  stock: number;
  status: string;
  notes?: string | null;
  sort_order: number;
};

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — list all inventory rows (admin only)
export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inventory: data });
}

// PUT — full replace (delete all + re-insert) used by admin list editor
export async function PUT(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const items: InventoryRow[] = (body.inventory ?? []).map(
    (item: InventoryRow, idx: number) => ({
      product: item.product,
      dose: item.dose,
      stock: Number(item.stock) || 0,
      status: item.status,
      notes: item.notes || null,
      sort_order: idx,
    })
  );

  const supabase = getAdminSupabase();

  // Delete everything then re-insert so real-time fires for all changes
  const { error: delErr } = await supabase
    .from('inventory')
    .delete()
    .gte('sort_order', 0); // matches all rows

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  if (items.length > 0) {
    const { error: insErr } = await supabase.from('inventory').insert(items);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// PATCH — update a single row by id
export async function PATCH(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getAdminSupabase();
  const { error } = await supabase.from('inventory').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
