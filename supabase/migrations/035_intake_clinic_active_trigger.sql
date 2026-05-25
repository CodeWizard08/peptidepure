-- Codex rescue review (e) — close the clinic-resolution race on
-- patient_intakes inserts.
--
-- The intake POST route resolves clinic_slug → clinic_id in one query
-- ("find an active clinic with this slug"), then inserts the new intake
-- row in a separate statement. If an admin archives the clinic between
-- those two statements, the intake gets linked to a clinic that's no
-- longer active. The patient_intakes.clinic_id FK only checks row
-- existence, not status, so the bad link sticks until manual cleanup.
--
-- A BEFORE INSERT trigger closes the window: if clinic_id is set but
-- the referenced clinic isn't currently 'active', the trigger nulls the
-- clinic_id. The intake still records its `clinic_slug` so admin can
-- reconcile manually (e.g., reactivate the clinic + back-fill).
--
-- Cheap row-level check, no application-code coordination needed.

create or replace function ensure_intake_clinic_active()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.clinic_id is not null then
    if not exists (
      select 1 from clinics
      where id = new.clinic_id
        and status = 'active'
    ) then
      -- Drop the link rather than abort the insert. The patient's
      -- intake is still valuable; only the clinic attribution is stale.
      new.clinic_id := null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists patient_intakes_clinic_active_check on patient_intakes;
create trigger patient_intakes_clinic_active_check
  before insert on patient_intakes
  for each row
  execute function ensure_intake_clinic_active();

-- Codex rescue review (b) — tighten the existing brand_logo_url length
-- check into a length-AND-scheme check. Blocks javascript:, data:, and
-- mixed-content http: at the DB level so a future code path that skips
-- the API validator can't smuggle in dangerous values.
--
-- The previous constraint (`char_length(brand_logo_url) <= 500`) is
-- replaced by a single composite CHECK; existing 'https://...'-style
-- rows continue to satisfy it.
alter table clinics drop constraint if exists clinics_brand_logo_url_check;
alter table clinics add constraint clinics_brand_logo_url_check
  check (
    brand_logo_url is null
    or (
      char_length(brand_logo_url) <= 500
      and brand_logo_url ~ '^https://[A-Za-z0-9._-]+(:[0-9]+)?(/[^[:space:]]*)?$'
    )
  );
