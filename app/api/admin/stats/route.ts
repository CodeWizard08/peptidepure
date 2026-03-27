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

  // Count total orders
  const { count: totalOrders, error: totalOrdersError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  if (totalOrdersError) {
    console.error('Stats: total orders error:', totalOrdersError);
  }

  // Sum revenue (status != 'cancelled')
  const { data: revenueData, error: revenueError } = await supabase
    .from('orders')
    .select('total_cents')
    .neq('status', 'cancelled');

  if (revenueError) {
    console.error('Stats: revenue error:', revenueError);
  }

  const totalRevenueCents = (revenueData || []).reduce(
    (sum: number, order: { total_cents: number }) => sum + (order.total_cents || 0),
    0
  );

  // Count pending orders
  const { count: pendingOrders, error: pendingError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (pendingError) {
    console.error('Stats: pending orders error:', pendingError);
  }

  // Count active products
  const { count: activeProducts, error: productsError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (productsError) {
    console.error('Stats: active products error:', productsError);
  }

  // Count users
  let totalUsers = 0;
  try {
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (usersError) {
      console.error('Stats: users error:', usersError);
    } else {
      totalUsers = usersData?.users?.length || 0;
    }
  } catch (err) {
    console.error('Stats: users fetch failed:', err);
  }

  // Recent 5 orders
  const { data: recentOrders, error: recentError } = await supabase
    .from('orders')
    .select('id, status, total_cents, created_at, shipping_address')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentError) {
    console.error('Stats: recent orders error:', recentError);
  }

  return NextResponse.json({
    totalOrders: totalOrders || 0,
    totalRevenueCents,
    pendingOrders: pendingOrders || 0,
    activeProducts: activeProducts || 0,
    totalUsers,
    recentOrders: recentOrders || [],
  });
}
