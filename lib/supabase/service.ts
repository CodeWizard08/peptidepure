import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client using the service role key.
 * Bypasses RLS — use ONLY in server-side code that doesn't
 * have a user session (e.g. inbound webhooks from Meridian).
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase service role credentials');
  return createSupabaseClient(url, key);
}
