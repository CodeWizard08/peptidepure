-- Patient Auth Slice 2 — fix Supabase Auth user creation.
--
-- Symptom: admin.generateLink({ type: 'magiclink' }) AND anon
-- signInWithOtp({ shouldCreateUser: true }) both fail with
--   "Database error saving new user"
-- whenever the email isn't already in auth.users. The auth.users INSERT
-- runs the `on_auth_user_created` trigger which calls our
-- `handle_new_user()` function (from supabase/complete-setup.sql:26-43).
-- If that function raises any exception, the auth.users INSERT rolls back
-- and Supabase returns the generic error above with no detail.
--
-- Two defensive changes:
--
-- 1. `SET search_path = public, auth, pg_catalog` so the function's
--    references to `public.profiles` and any auth-side helpers don't
--    depend on the caller's search_path.
--
-- 2. Wrap the profiles INSERT in BEGIN/EXCEPTION/END so a constraint
--    violation, RLS error, or missing-column quirk turns into a warning
--    instead of aborting the whole user-creation transaction. The
--    profile row can be backfilled later by joining auth.users to
--    profiles on id; losing the row is much less catastrophic than
--    losing the user.
--
-- Also grant INSERT on profiles to the auth-adjacent roles. The function
-- runs SECURITY DEFINER as the function-owner (typically `postgres`,
-- which has BYPASSRLS), so RLS shouldn't block it — but the grant is
-- belt-and-braces in case the function ownership ever changes.

grant insert on public.profiles to anon, authenticated, service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
begin
  begin
    insert into public.profiles (id, full_name, role)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      'patient'
    )
    on conflict (id) do nothing;
  exception when others then
    -- Don't abort the auth.users insert if profile creation fails.
    raise warning 'handle_new_user: profiles insert failed for user % (%): %',
      new.id, new.email, sqlerrm;
  end;
  return new;
end;
$$;
