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
  product_id?: string | null;
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

// PUT — full replace used by admin list editor.
// Calls replace_inventory(jsonb) RPC (migration 022) so DELETE + INSERT
// happen in a single transaction — a concurrent purchase can't lose its
// decrement against the empty intermediate state.
export async function PUT(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const items: InventoryRow[] = [];
  for (const [idx, item] of ((body.inventory ?? []) as InventoryRow[]).entries()) {
    const stock = Number(item.stock);
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      return NextResponse.json(
        { error: `Row ${idx + 1}: stock must be a non-negative integer` },
        { status: 400 },
      );
    }
    items.push({
      product: item.product,
      dose: item.dose,
      stock,
      status: item.status,
      notes: item.notes || null,
      sort_order: idx,
      product_id: item.product_id || null,
    });
  }

  const supabase = getAdminSupabase();
  const { error } = await supabase.rpc('replace_inventory', { p_rows: items });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// PATCH — update a single row by id
export async function PATCH(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Stock must be a non-negative integer if provided — otherwise the reverse
  // trigger would copy a negative value into products.stock_quantity.
  if (updates.stock !== undefined) {
    const stock = Number(updates.stock);
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      return NextResponse.json({ error: 'stock must be a non-negative integer' }, { status: 400 });
    }
    updates.stock = stock;
  }

  const supabase = getAdminSupabase();
  const { error } = await supabase.from('inventory').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
