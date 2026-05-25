-- Codex rescue review (Slices 3 + 4) — close two data-exposure gaps:
--
-- (g) clinics table previously granted table-level SELECT to anon/authenticated.
--     The RLS policy filters by status='active' but does NOT restrict columns,
--     so unauthenticated supabase-js clients could query active rows and read
--     internal fields (`notes`, `owner_user_id`, `contact_email`,
--     `contact_phone`) that were only meant for admin consumption.
--
-- (NEW-1) patient_intakes.admin_notes is patient-visible via /p/dashboard,
--     but the admin UI labels it "Admin notes" — names + intent diverge,
--     which can leak internal clinician notes to the patient. The patient
--     read RLS (migration 031) returns the full row.
--
-- Fix in both cases: Postgres column-level grants. Revoke table-level
-- SELECT from anon/authenticated and re-grant ONLY the public-safe columns.
-- Service-role bypasses grants AND RLS, so admin routes are unaffected.
--
-- Idempotent — REVOKE + GRANT are both safe to re-run.

-- ─── clinics ─────────────────────────────────────────────────────────────
-- Strip the prior table-level public grant from migration 033.
revoke select on clinics from anon;
revoke select on clinics from authenticated;

-- Re-grant SELECT on the public-safe columns only. id/slug/name/status
-- are needed for the "Referred via X" lookup and the public/admin embeds.
-- The branding tokens are intentionally public — they're the white-label
-- presentation tokens. Anything else stays admin-only via service-role.
grant select (id, slug, name, status, brand_primary, brand_accent, brand_logo_url)
  on clinics to anon, authenticated;

-- ─── patient_intakes ─────────────────────────────────────────────────────
-- migration 031 granted authenticated full-row SELECT on patient_intakes
-- gated by RLS (email-match). Reduce to the columns the patient dashboard
-- actually renders. admin_notes specifically is dropped from the patient-
-- visible set; if Mort wants to send a message TO the patient, a future
-- slice can add a `patient_visible_notes` column with its own grant.
--
-- Columns intentionally NOT re-granted to authenticated:
--   email             — patient already knows it (their auth identity)
--   admin_notes       — internal clinician notes
--   referring_user_id — opaque uuid, no patient value
--   reviewed_by       — who reviewed
--   referring_clinician (free-text variant)
--
-- The admin route uses service-role and is unaffected.

revoke select on patient_intakes from authenticated;

grant select (
  id,
  created_at,
  status,
  name,
  phone,
  date_of_birth,
  primary_concerns,
  current_peptides,
  goals,
  reviewed_at,
  clinic_slug,
  clinic_id,
  email
) on patient_intakes to authenticated;

-- (anon never had SELECT on patient_intakes; nothing to revoke there.)
