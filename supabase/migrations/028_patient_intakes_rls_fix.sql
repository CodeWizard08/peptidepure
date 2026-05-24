-- Fixup: the original 024 policy used the implicit `TO PUBLIC` form, which
-- in standalone Postgres covers every role but in Supabase's setup needs
-- explicit `TO anon, authenticated` + `GRANT INSERT` to reliably allow
-- writes from the anon-key-backed server client.
--
-- Symptom before this fix: POST /api/patient-intakes returned 500 with
--   {"code":"42501", "message":"new row violates row-level security policy
--    for table \"patient_intakes\""}
-- even though the migration declared `WITH CHECK (true)`.

-- Make sure the anon + authenticated roles have INSERT privilege on the
-- table — this is the column-level grant the RLS check sits on top of.
grant insert on patient_intakes to anon, authenticated;

-- Re-create the policy with an explicit role list. The previous policy
-- with the same name is dropped first so re-running the migration is safe.
drop policy if exists "Anyone can submit patient intake" on patient_intakes;
create policy "Anyone can submit patient intake"
  on patient_intakes
  for insert
  to anon, authenticated
  with check (true);
