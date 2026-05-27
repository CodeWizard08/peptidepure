-- Patient portal Slice 6 — dosing logs + self-assessment check-ins.
--
-- Patients log each peptide dose and do periodic check-ins rating energy,
-- sleep, mood, and pain. Clinicians see the data via admin (future drill-
-- down). RLS gates each patient to their own rows via auth.uid().

-- ─── Dosing Logs ─────────────────────────────────────────────────────────
create table if not exists patient_dosing_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  -- What was taken
  peptide_name text not null check (char_length(peptide_name) <= 200),
  dose_amount text not null check (char_length(dose_amount) <= 100),
  route text not null default 'SQ' check (route in ('SQ','IM','oral','nasal','topical','nebulized','other')),
  injection_site text check (injection_site is null or char_length(injection_site) <= 200),
  -- Context
  notes text check (notes is null or char_length(notes) <= 2000),
  side_effects text[] not null default '{}'
);

create index if not exists idx_dosing_logs_user on patient_dosing_logs(user_id);
create index if not exists idx_dosing_logs_created on patient_dosing_logs(created_at desc);

alter table patient_dosing_logs enable row level security;

grant select, insert on patient_dosing_logs to authenticated;

drop policy if exists "Patient can read own dosing logs" on patient_dosing_logs;
create policy "Patient can read own dosing logs"
  on patient_dosing_logs for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Patient can insert own dosing logs" on patient_dosing_logs;
create policy "Patient can insert own dosing logs"
  on patient_dosing_logs for insert to authenticated
  with check (auth.uid() = user_id);

-- ─── Check-Ins ───────────────────────────────────────────────────────────
create table if not exists patient_check_ins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  -- Self-assessment scales (1-10)
  energy_level integer not null check (energy_level between 1 and 10),
  sleep_quality integer not null check (sleep_quality between 1 and 10),
  mood integer not null check (mood between 1 and 10),
  pain_level integer not null check (pain_level between 1 and 10),
  -- Optional
  weight_lbs numeric(5,1),
  notes text check (notes is null or char_length(notes) <= 2000),
  goals_progress text check (goals_progress is null or char_length(goals_progress) <= 2000)
);

create index if not exists idx_check_ins_user on patient_check_ins(user_id);
create index if not exists idx_check_ins_created on patient_check_ins(created_at desc);

alter table patient_check_ins enable row level security;

grant select, insert on patient_check_ins to authenticated;

drop policy if exists "Patient can read own check-ins" on patient_check_ins;
create policy "Patient can read own check-ins"
  on patient_check_ins for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Patient can insert own check-ins" on patient_check_ins;
create policy "Patient can insert own check-ins"
  on patient_check_ins for insert to authenticated
  with check (auth.uid() = user_id);
