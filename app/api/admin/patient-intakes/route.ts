import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const VALID_STATUSES = new Set(['new', 'contacted', 'archived']);
const ADMIN_NOTES_MAX = 10_000;

export async function GET(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = (searchParams.get('search') || '').trim();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const supabase = getAdminSupabase();
  // Slice 3 — join the linked clinic so the admin panel can show the
  // canonical clinic name next to the slug. `clinic:clinics(...)` is
  // PostgREST's foreign-table embedding syntax; resolves through the
  // patient_intakes.clinic_id FK added in migration 033.
  let query = supabase
    .from('patient_intakes')
    .select('*, clinic:clinics(id, slug, name, status)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all' && VALID_STATUSES.has(status)) {
    query = query.eq('status', status);
  }

  // Server-side search across name/email/clinic. Escape three classes:
  //   - PostgREST `or()` delimiters: , ( ) * \
  //   - SQL LIKE wildcards: % _   (Codex round 2 — a `%` search would
  //     otherwise match every row and quietly look like a server bug)
  if (search) {
    const escaped = search
      .replace(/[\\]/g, '\\\\')        // backslash first so it doesn't escape later escapes
      .replace(/[%_]/g, '\\$&')        // LIKE wildcards — render as literal characters
      .replace(/[,()*]/g, '\\$&');     // PostgREST delimiters
    const pattern = `%${escaped}%`;
    query = query.or(
      `name.ilike.${pattern},email.ilike.${pattern},clinic_slug.ilike.${pattern}`
    );
  }

  const { data, error, count } = await query;
  if (error) {
    console.error('Patient intake fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch patient intakes' }, { status: 500 });
  }
  return NextResponse.json({ intakes: data ?? [], total: count ?? 0, page, limit });
}

// PATCH /api/admin/patient-intakes?id=<uuid>
// Body: { status?: 'new'|'contacted'|'archived', admin_notes?: string }
export async function PATCH(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body.status === 'string') {
    if (!VALID_STATUSES.has(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    patch.status = body.status;
    patch.reviewed_at = new Date().toISOString();
  }
  if (typeof body.admin_notes === 'string') {
    if (body.admin_notes.length > ADMIN_NOTES_MAX) {
      return NextResponse.json(
        { error: `admin_notes exceeds ${ADMIN_NOTES_MAX.toLocaleString()} characters` },
        { status: 400 }
      );
    }
    patch.admin_notes = body.admin_notes;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const { error } = await supabase.from('patient_intakes').update(patch).eq('id', id);
  if (error) {
    console.error('Patient intake update error:', error);
    return NextResponse.json({ error: 'Failed to update intake' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const supabase = getAdminSupabase();
  const { error } = await supabase.from('patient_intakes').delete().eq('id', id);
  if (error) {
    console.error('Patient intake delete error:', error);
    return NextResponse.json({ error: 'Failed to delete intake' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
