-- Attribute patient intakes to a specific clinician user. The previous
-- `referring_clinician` free-text field stays (patients can still type a
-- name when there's no shared link), but `referring_user_id` is the
-- canonical relational link populated when a patient lands via the
-- clinician's personal /p/intake?ref=<uuid> share link.

alter table patient_intakes
  add column if not exists referring_user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_patient_intakes_referring_user
  on patient_intakes(referring_user_id);
