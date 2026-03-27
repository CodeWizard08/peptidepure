import { NextResponse } from 'next/server';
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

  try {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 50,
    });

    if (error) {
      console.error('Users fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    const users = (data?.users || []).map((user) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      user_metadata: {
        full_name: user.user_metadata?.full_name || '',
        clinic: user.user_metadata?.clinic || '',
        npi_number: user.user_metadata?.npi_number || '',
        credential: user.user_metadata?.credential || '',
        phone: user.user_metadata?.phone || '',
      },
    }));

    return NextResponse.json({ users, total: users.length });
  } catch (err) {
    console.error('Users route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
