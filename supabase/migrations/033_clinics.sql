-- Patient app Slice 3 — promote `patient_intakes.clinic_slug` from a free
-- text white-label hint to a real relation against a `clinics` lookup table.
--
-- Why now: the slug column was the first iteration's white-label foundation
-- and intentionally schema-lite so the admin could ship intake review fast.
-- With Slice 2 (auth + dashboard) live and intakes accumulating in the
-- admin queue, the next product step is letting Mort REGISTER clinics
-- so the slug isn't a wild card. The clinic record gives us:
--
--   - A canonical name + contact info per clinic (admin doesn't have to
--     guess what "wellfit" or "acme" maps to).
--   - A status lifecycle (active/suspended/archived) so a clinic with no
--     contract can be turned off without dropping the slug.
--   - An owner_user_id for the future "your intakes" view in the clinician
--     dashboard.
--   - A place to hang branding tokens (primary/accent color, logo URL)
--     when the full white-label slice ships.
--
-- The `clinic_slug` column on patient_intakes stays so existing rows
-- aren't orphaned and so an intake can still be attributed even if the
-- referenced clinic isn't yet registered (resolved to clinic_id=null).
-- New inserts populate BOTH fields when a matching active clinic exists.

create table if not exists clinics (
  id uuid default gen_random_uuid() primary key,
  -- Slug rules match the server-side normalization in
  -- app/api/patient-intakes/route.ts so a slug stored here can always be
  -- found via /p/intake?clinic=<slug>.
  slug text not null unique check (slug ~ '^[a-z0-9_-]{1,64}$'),
  name text not null check (char_length(name) <= 200),
  contact_email text check (contact_email is null or char_length(contact_email) <= 200),
  contact_phone text check (contact_phone is null or char_length(contact_phone) <= 40),
  -- Branding tokens (deferred — kept here so a future migration doesn't
  -- need to alter the table again). Null means use default PeptidePure branding.
  brand_primary text check (brand_primary is null or brand_primary ~ '^#[0-9a-fA-F]{6}$'),
  brand_accent text check (brand_accent is null or brand_accent ~ '^#[0-9a-fA-F]{6}$'),
  brand_logo_url text check (brand_logo_url is null or char_length(brand_logo_url) <= 500),
  -- Admin lifecycle.
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  -- Owner clinician (nullable so the admin can register a clinic before
  -- the clinician has a Supabase account).
  owner_user_id uuid references auth.users(id) on delete set null,
  notes text check (notes is null or char_length(notes) <= 5000),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_clinics_slug on clinics(slug);
create index if not exists idx_clinics_status on clinics(status);
create index if not exists idx_clinics_owner on clinics(owner_user_id);

create or replace function update_clinics_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clinics_updated_at on clinics;
create trigger clinics_updated_at
  before update on clinics
  for each row execute function update_clinics_updated_at();

-- RLS — public can read active clinics so the intake page can fetch the
-- referenced clinic by slug and show "Referred via X". Admin writes go
-- through the service-role client which bypasses RLS, so no INSERT/UPDATE
-- policies are needed here.
alter table clinics enable row level security;

grant select on clinics to anon, authenticated;

drop policy if exists "Anyone can read active clinics" on clinics;
create policy "Anyone can read active clinics"
  on clinics for select
  to anon, authenticated
  using (status = 'active');

-- Link patient_intakes to clinics via a nullable FK. Existing rows keep
-- clinic_slug; new rows populate clinic_id when a matching active clinic
-- exists. ON DELETE SET NULL preserves the intake history if a clinic is
-- removed from the table.
alter table patient_intakes
  add column if not exists clinic_id uuid references clinics(id) on delete set null;

create index if not exists idx_patient_intakes_clinic_id on patient_intakes(clinic_id);
