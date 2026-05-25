import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import { matchesRemotePattern, REMOTE_IMAGE_PATTERNS } from '@/lib/image-hosts';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const SLUG_RE = /^[a-z0-9_-]{1,64}$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_STATUSES = new Set(['active', 'suspended', 'archived']);

// Field-level length / format caps. Mirrors the DB CHECK constraints in
// migration 033 so the route returns clean 400s before reaching Postgres.
const NAME_MAX = 200;
const EMAIL_MAX = 200;
const PHONE_MAX = 40;
const LOGO_URL_MAX = 500;
const NOTES_MAX = 5000;

type ClinicBody = {
  slug?: string;
  name?: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  brand_primary?: string | null;
  brand_accent?: string | null;
  brand_logo_url?: string | null;
  status?: string;
  owner_user_id?: string | null;
  notes?: string | null;
};

function normalizeSlug(raw: string | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64);
  return cleaned || null;
}

function validateClinic(body: ClinicBody, partial: boolean): { ok: true; patch: Record<string, unknown> } | { ok: false; error: string } {
  const patch: Record<string, unknown> = {};

  if (body.slug !== undefined) {
    const slug = normalizeSlug(body.slug);
    if (!slug || !SLUG_RE.test(slug)) {
      return { ok: false, error: 'slug must be lowercase letters, digits, dashes or underscores (max 64 chars)' };
    }
    patch.slug = slug;
  } else if (!partial) {
    return { ok: false, error: 'slug is required' };
  }

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return { ok: false, error: 'name is required' };
    if (name.length > NAME_MAX) return { ok: false, error: `name exceeds ${NAME_MAX} chars` };
    patch.name = name;
  } else if (!partial) {
    return { ok: false, error: 'name is required' };
  }

  if (body.contact_email !== undefined) {
    const email = body.contact_email?.trim() || null;
    if (email && email.length > EMAIL_MAX) return { ok: false, error: `contact_email exceeds ${EMAIL_MAX} chars` };
    patch.contact_email = email;
  }
  if (body.contact_phone !== undefined) {
    const phone = body.contact_phone?.trim() || null;
    if (phone && phone.length > PHONE_MAX) return { ok: false, error: `contact_phone exceeds ${PHONE_MAX} chars` };
    patch.contact_phone = phone;
  }
  if (body.brand_primary !== undefined) {
    const c = body.brand_primary?.trim() || null;
    if (c && !HEX_RE.test(c)) return { ok: false, error: 'brand_primary must be a #RRGGBB hex color' };
    patch.brand_primary = c;
  }
  if (body.brand_accent !== undefined) {
    const c = body.brand_accent?.trim() || null;
    if (c && !HEX_RE.test(c)) return { ok: false, error: 'brand_accent must be a #RRGGBB hex color' };
    patch.brand_accent = c;
  }
  if (body.brand_logo_url !== undefined) {
    const url = body.brand_logo_url?.trim() || null;
    if (url) {
      if (url.length > LOGO_URL_MAX) {
        return { ok: false, error: `brand_logo_url exceeds ${LOGO_URL_MAX} chars` };
      }
      // Codex review fixes (a) + (b) + final-pass — use URL parsing
      // (not regex) so edge cases like ports, fragments, userinfo, and
      // unusual hostname shapes are handled correctly, then check:
      //   1. scheme is https (blocks javascript:, data:, http:)
      //   2. no whitespace in the path (defense vs %20 in user input)
      //   3. hostname AND pathname match an entry in REMOTE_IMAGE_PATTERNS
      //      so save-time and render-time invariants stay aligned.
      // The patterns live in lib/image-hosts.ts so the validator and the
      // next/image renderer can never drift.
      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        return { ok: false, error: 'brand_logo_url must be a valid URL' };
      }
      if (parsed.protocol !== 'https:') {
        return { ok: false, error: 'brand_logo_url must use https://' };
      }
      if (/\s/.test(parsed.pathname)) {
        return { ok: false, error: 'brand_logo_url path must not contain whitespace' };
      }
      if (!matchesRemotePattern(parsed)) {
        // Build a developer-readable list of allowed host+path patterns
        // so the admin can see WHY a perfectly-valid-looking URL was
        // rejected (e.g. "host OK but path doesn't match the /img/**
        // pattern for www.peptide.buzz").
        const allowedSummary = REMOTE_IMAGE_PATTERNS
          .map((p) => `${p.hostname}${typeof p.pathname === 'string' ? p.pathname : ''}`)
          .join(', ');
        return {
          ok: false,
          error: `brand_logo_url ("${parsed.hostname}${parsed.pathname}") doesn't match any allowed host+path pattern. Allowed: ${allowedSummary}`,
        };
      }
    }
    patch.brand_logo_url = url;
  }
  if (body.status !== undefined) {
    if (!VALID_STATUSES.has(body.status)) {
      return { ok: false, error: `status must be one of: ${Array.from(VALID_STATUSES).join(', ')}` };
    }
    patch.status = body.status;
  }
  if (body.owner_user_id !== undefined) {
    const owner = body.owner_user_id?.trim() || null;
    if (owner && !UUID_RE.test(owner)) return { ok: false, error: 'owner_user_id must be a UUID' };
    patch.owner_user_id = owner ? owner.toLowerCase() : null;
  }
  if (body.notes !== undefined) {
    const notes = body.notes?.trim() || null;
    if (notes && notes.length > NOTES_MAX) return { ok: false, error: `notes exceeds ${NOTES_MAX} chars` };
    patch.notes = notes;
  }

  return { ok: true, patch };
}

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
  let query = supabase
    .from('clinics')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all' && VALID_STATUSES.has(status)) {
    query = query.eq('status', status);
  }
  if (search) {
    const escaped = search
      .replace(/[\\]/g, '\\\\')
      .replace(/[%_]/g, '\\$&')
      .replace(/[,()*]/g, '\\$&');
    const pattern = `%${escaped}%`;
    query = query.or(`name.ilike.${pattern},slug.ilike.${pattern},contact_email.ilike.${pattern}`);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error('clinics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch clinics' }, { status: 500 });
  }
  return NextResponse.json({ clinics: data ?? [], total: count ?? 0, page, limit });
}

export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: ClinicBody = await request.json().catch(() => ({}));
  const validation = validateClinic(body, false);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('clinics')
    .insert(validation.patch)
    .select('*')
    .single();
  if (error) {
    // Postgres unique-violation on slug — return a friendly 409 instead of 500.
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A clinic with that slug already exists' }, { status: 409 });
    }
    console.error('clinics insert error:', error);
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 });
  }
  return NextResponse.json({ clinic: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id || !UUID_RE.test(id)) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const body: ClinicBody = await request.json().catch(() => ({}));
  const validation = validateClinic(body, true);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  if (Object.keys(validation.patch).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('clinics')
    .update(validation.patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A clinic with that slug already exists' }, { status: 409 });
    }
    console.error('clinics update error:', error);
    return NextResponse.json({ error: 'Failed to update clinic' }, { status: 500 });
  }
  return NextResponse.json({ clinic: data });
}

export async function DELETE(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id || !UUID_RE.test(id)) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const supabase = getAdminSupabase();
  const { error } = await supabase.from('clinics').delete().eq('id', id);
  if (error) {
    console.error('clinics delete error:', error);
    return NextResponse.json({ error: 'Failed to delete clinic' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
