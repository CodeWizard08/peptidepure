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
      subtitle: (body.subtitle as string | null) ?? null,
      category: (body.category as string | null) ?? null,
      summary: (body.summary as string | null) ?? null,
      body_md: (body.body_md as string | null) ?? '',
      patient_md: (body.patient_md as string | null) ?? '',
      peptides: Array.isArray(body.peptides) ? body.peptides : [],
      tags: Array.isArray(body.tags) ? body.tags.filter((t) => typeof t === 'string') : [],
      image_url: (body.image_url as string | null) ?? null,
      status,
      sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
      metadata: (body.metadata as Record<string, unknown>) ?? {},
      protocol_meta:
        body.protocol_meta && typeof body.protocol_meta === 'object'
          ? body.protocol_meta
          : {},
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

  const id = body.id;
  if (!id || typeof id !== 'string') return NextResponse.json({ error: 'id is required' }, { status: 400 });

  if (body.status !== undefined && (typeof body.status !== 'string' || !VALID_STATUSES.has(body.status))) {
    return NextResponse.json({ error: 'status must be draft|published|archived' }, { status: 400 });
  }
  if (body.slug !== undefined && (typeof body.slug !== 'string' || !/^[a-z0-9-]+$/.test(body.slug))) {
    return NextResponse.json({ error: 'slug must be lowercase alphanumeric + hyphens' }, { status: 400 });
  }

  // Explicit allowlist — never forward arbitrary keys from the request body.
  // Prevents accidental (or hostile) mutation of id, created_at, updated_at,
  // or future schema additions.
  const update: Record<string, unknown> = {};
  if (typeof body.title === 'string') update.title = body.title;
  if (typeof body.slug === 'string') update.slug = body.slug;
  if (body.subtitle !== undefined) update.subtitle = body.subtitle ?? null;
  if (body.category !== undefined) update.category = body.category ?? null;
  if (body.summary !== undefined) update.summary = body.summary ?? null;
  if (typeof body.body_md === 'string') update.body_md = body.body_md;
  if (typeof body.patient_md === 'string') update.patient_md = body.patient_md;
  if (Array.isArray(body.peptides)) update.peptides = body.peptides.filter((p) => typeof p === 'string');
  if (Array.isArray(body.tags)) update.tags = body.tags.filter((t) => typeof t === 'string');
  if (body.image_url !== undefined) update.image_url = body.image_url ?? null;
  if (typeof body.status === 'string') update.status = body.status;
  if (typeof body.sort_order === 'number') update.sort_order = body.sort_order;
  if (body.metadata !== undefined && typeof body.metadata === 'object' && body.metadata !== null) {
    update.metadata = body.metadata;
  }
  if (body.protocol_meta !== undefined && typeof body.protocol_meta === 'object' && body.protocol_meta !== null) {
    update.protocol_meta = body.protocol_meta;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('protocols')
    .update(update)
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
