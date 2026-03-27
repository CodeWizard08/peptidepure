import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminSupabase();

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }

  return NextResponse.json({ products: products || [] });
}

export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminSupabase();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    name,
    slug,
    description,
    category,
    subcategory,
    price_cents,
    image_url,
    is_active,
    sort_order,
    metadata,
  } = body;

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!category || typeof category !== 'string') {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  }
  if (price_cents !== undefined && (typeof price_cents !== 'number' || !Number.isInteger(price_cents) || price_cents < 0)) {
    return NextResponse.json({ error: 'price_cents must be a non-negative integer' }, { status: 400 });
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      description,
      category,
      subcategory,
      price_cents: price_cents ?? 0,
      image_url,
      is_active: is_active ?? true,
      sort_order: sort_order ?? 0,
      metadata: metadata ?? {},
    })
    .select('*')
    .single();

  if (error) {
    console.error('Product create error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }

  return NextResponse.json({ product }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminSupabase();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { id, ...fields } = body;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
  }

  if (
    fields.price_cents !== undefined &&
    (typeof fields.price_cents !== 'number' ||
      !Number.isInteger(fields.price_cents) ||
      (fields.price_cents as number) < 0)
  ) {
    return NextResponse.json({ error: 'price_cents must be a non-negative integer' }, { status: 400 });
  }

  const { data: product, error } = await supabase
    .from('products')
    .update(fields)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }

  return NextResponse.json({ product });
}

export async function DELETE(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    console.error('Product delete error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
