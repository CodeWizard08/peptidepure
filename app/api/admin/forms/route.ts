import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get('type');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const supabase = getAdminSupabase();

  let query = supabase
    .from('form_submissions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (typeFilter && typeFilter !== 'all') {
    query = query.eq('form_type', typeFilter);
  }

  const { data: submissions, error, count } = await query;

  if (error) {
    console.error('Forms fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch form submissions' }, { status: 500 });
  }

  return NextResponse.json({ submissions: submissions || [], total: count || 0, page, limit });
}

export async function DELETE(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const supabase = getAdminSupabase();
  const { error } = await supabase.from('form_submissions').delete().eq('id', id);
  if (error) {
    console.error('Form delete error:', error);
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
