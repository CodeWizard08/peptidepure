-- Patient intake submissions — the first piece of the patient-facing app
-- (audit PDF priority #2). A public form at /p/intake writes here; clinicians
-- review submissions in the admin panel. The clinic_slug column is the
-- white-label hook: a clinician sends a patient to /p/intake?clinic=acme and
-- the row gets attributed to "acme" so we can later partition by clinic.

create table if not exists patient_intakes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- White-label attribution. NULL = direct submission via peptidepure.com.
  -- Future: foreign-key this to a `clinics` table once multi-tenant launches.
  clinic_slug text,
  -- Patient identity
  name text not null,
  email text not null,
  phone text,
  date_of_birth date,
  -- Clinical context — multi-select of high-level concerns + free-text fields.
  primary_concerns text[] not null default '{}',
  current_peptides text,
  goals text,
  -- Optional referrer (the clinician who shared the link).
  referring_clinician text,
  -- Required consents. Form validation enforces these are true on submit.
  consent_research boolean not null default false,
  consent_contact boolean not null default false,
  -- Admin review lifecycle.
  status text not null default 'new' check (status in ('new', 'contacted', 'archived')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  admin_notes text
);

create index if not exists idx_patient_intakes_status on patient_intakes(status);
create index if not exists idx_patient_intakes_clinic on patient_intakes(clinic_slug);
create index if not exists idx_patient_intakes_created on patient_intakes(created_at desc);

alter table patient_intakes enable row level security;

-- Public form submission. Admin reads/updates go through the service-role
-- key, which bypasses RLS, so no SELECT/UPDATE policy is needed.
drop policy if exists "Anyone can submit patient intake" on patient_intakes;
create policy "Anyone can submit patient intake"
  on patient_intakes for insert
  with check (true);

create or replace function update_patient_intakes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists patient_intakes_updated_at on patient_intakes;
create trigger patient_intakes_updated_at
  before update on patient_intakes
  for each row
  execute function update_patient_intakes_updated_at();
