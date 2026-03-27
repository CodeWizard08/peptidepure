import { createClient } from '@/lib/supabase/server';

/**
 * Returns true if the currently logged-in Supabase user
 * has app_metadata.role === 'admin'.
 *
 * To grant admin access, set this in Supabase dashboard:
 *   Authentication → Users → [user] → Edit → App Metadata
 *   { "role": "admin" }
 *
 * Or via SQL:
 *   UPDATE auth.users
 *   SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
 *   WHERE email = 'you@example.com';
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.app_metadata?.role === 'admin';
  } catch {
    return false;
  }
}
