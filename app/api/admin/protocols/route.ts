import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function revalidateProtocolRoutes(slug?: string) {
  revalidatePath('/protocols');
  if (slug) revalidatePath(`/protocols/${slug}`);
}

const VALID_STATUSES = new Set(['draft', 'published', 'archived']);

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('protocols')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('title', { ascending: true });

  if (error) {
    console.error('[admin/protocols GET]', error);
    return NextResponse.json({ error: 'Failed to fetch protocols' }, { status: 500 });
  }
  return NextResponse.json({ protocols: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Slug must be lowercase alphanumeric + hyphens' }, { status: 400 });
  }

  const status = typeof body.status === 'string' && VALID_STATUSES.has(body.status) ? body.status : 'draft';

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('protocols')
    .insert({
      title,
      slug,
      category: (body.category as string | null) ?? null,
      summary: (body.summary as string | null) ?? null,
      body_md: (body.body_md as string | null) ?? '',
      peptides: Array.isArray(body.peptides) ? body.peptides : [],
      image_url: (body.image_url as string | null) ?? null,
      status,
      sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
      metadata: (body.metadata as Record<string, unknown>) ?? {},
    })
    .select('*')
    .single();

  if (error) {
    console.error('[admin/protocols POST]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateProtocolRoutes(slug);
  return NextResponse.json({ protocol: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { id, ...fields } = body;
  if (!id || typeof id !== 'string') return NextResponse.json({ error: 'id is required' }, { status: 400 });

  if (fields.status !== undefined && (typeof fields.status !== 'string' || !VALID_STATUSES.has(fields.status))) {
    return NextResponse.json({ error: 'status must be draft|published|archived' }, { status: 400 });
  }
  if (fields.slug !== undefined && (typeof fields.slug !== 'string' || !/^[a-z0-9-]+$/.test(fields.slug))) {
    return NextResponse.json({ error: 'slug must be lowercase alphanumeric + hyphens' }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('protocols')
    .update(fields)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[admin/protocols PATCH]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateProtocolRoutes(data?.slug);
  return NextResponse.json({ protocol: data });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const supabase = getAdminSupabase();
  const { data: existing } = await supabase.from('protocols').select('slug').eq('id', id).single();

  const { error } = await supabase.from('protocols').delete().eq('id', id);
  if (error) {
    console.error('[admin/protocols DELETE]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateProtocolRoutes(existing?.slug);
  return NextResponse.json({ success: true });
}
