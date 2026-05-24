-- Patient Auth Slice 2 — let authenticated patients read their own intake
-- via /p/dashboard. The intake was originally inserted by the public
-- service-role path (no auth session yet), and the patient claims it
-- afterward by signing in with the same email via magic link. We match
-- on the email column rather than introduce a patient_user_id FK because
-- the email is the natural identity Supabase auth keys against and we
-- don't want to retrofit existing rows.

-- Make sure authenticated has SELECT privilege on the table — RLS sits
-- on top of column grants.
grant select on patient_intakes to authenticated;

drop policy if exists "Patient can read own intake" on patient_intakes;
create policy "Patient can read own intake"
  on patient_intakes
  for select
  to authenticated
  using (
    -- auth.email() returns the email of the currently authenticated user
    -- (NULL when no session). lower() both sides defensively — Supabase
    -- normalizes auth emails to lowercase but our insert path also lowercases
    -- before write, so this should be a no-op in practice.
    lower(email) = lower(auth.email())
  );
