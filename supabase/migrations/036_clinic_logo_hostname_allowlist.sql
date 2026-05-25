-- Codex rescue review verification pass — close issue (b) PARTIAL.
--
-- The previous DB CHECK on clinics.brand_logo_url (in migration 035)
-- enforced scheme + URL-shape only. Any HTTPS host could pass — so a
-- direct SQL insert (via service-role or a future code path that
-- skipped the API validator) could still store a URL that next/image
-- can't render. The API layer (app/api/admin/clinics/route.ts) was
-- tightened in commit 4b10586 to validate against the lib/image-hosts.ts
-- allowlist, but the DB layer lagged behind.
--
-- This migration mirrors the JS hostname allowlist into the DB CHECK as
-- defense-in-depth. The allowlist is small (4 hosts) and rarely changes;
-- adding a new host is a 2-line update in BOTH lib/image-hosts.ts AND
-- this CHECK regex. The previous "JS is source of truth" decision still
-- holds for the application path; this is purely a guardrail against
-- non-API writes.
--
-- Backfill step first: NULL out any existing brand_logo_url rows that
-- don't match the new pattern. Without this, the ALTER TABLE … ADD
-- CONSTRAINT would fail on the first non-conforming row. NULL is the
-- safe degraded state — the page falls back to no-logo branding.
--
-- Idempotent — DROP IF EXISTS + ADD CHECK is safe to re-run.

-- ─── 1. Backfill: NULL non-conforming rows ────────────────────────────
-- Anything that's already https:// + matches the hostname allowlist
-- stays as-is. Everything else (mailto:, javascript:, http://, unrelated
-- https:// hosts) gets nulled. Admin can re-enter via the panel; the
-- API-layer validator will reject non-conforming URLs at save time.
update clinics
set brand_logo_url = null
where brand_logo_url is not null
  and brand_logo_url !~ '^https://(dzbvaswimmaxfvambivu\.supabase\.co|peptidepure\.com|www\.peptide\.buzz|peptide\.buzz)(:[0-9]+)?(/[^[:space:]]*)?$';

-- ─── 2. Replace the CHECK with hostname-aware version ──────────────────
alter table clinics drop constraint if exists clinics_brand_logo_url_check;

alter table clinics add constraint clinics_brand_logo_url_check
  check (
    brand_logo_url is null
    or (
      char_length(brand_logo_url) <= 500
      and brand_logo_url ~ '^https://(dzbvaswimmaxfvambivu\.supabase\.co|peptidepure\.com|www\.peptide\.buzz|peptide\.buzz)(:[0-9]+)?(/[^[:space:]]*)?$'
    )
  );

-- NOTE: when adding/removing a host, update BOTH:
--   - lib/image-hosts.ts → REMOTE_IMAGE_PATTERNS array
--   - this CHECK regex (the alternation inside the second capture group)
-- A misaligned change will cause API-validated saves to be rejected by
-- the DB CHECK with a confusing constraint-violation error.
