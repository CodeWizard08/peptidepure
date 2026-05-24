-- Bound admin_notes at 10,000 characters. Codex rescue review (MEDIUM):
-- without a cap, a compromised or malicious admin session could push a
-- multi-MB payload through PATCH /api/admin/patient-intakes and bloat the
-- row. The route also enforces the same cap so 99% of clients fail fast
-- on the API side and never reach the DB.

alter table patient_intakes
  drop constraint if exists patient_intakes_admin_notes_length;

alter table patient_intakes
  add constraint patient_intakes_admin_notes_length
  check (admin_notes is null or char_length(admin_notes) <= 10000);
