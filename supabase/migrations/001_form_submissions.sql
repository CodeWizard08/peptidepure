-- Form submissions table for clinical forms and contact form
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

create table if not exists form_submissions (
  id uuid default gen_random_uuid() primary key,
  form_type text not null check (form_type in ('baseline', 'treatment-log', 'ae-sae-report', 'outcomes', 'contact')),
  data jsonb not null default '{}',
  submitted_by uuid references auth.users(id),
  provider_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for querying by form type
create index if not exists idx_form_submissions_type on form_submissions(form_type);

-- Index for querying by submitter
create index if not exists idx_form_submissions_user on form_submissions(submitted_by);

-- Row-level security: users can insert, admins can read all
alter table form_submissions enable row level security;

-- Anyone can insert (contact form is anonymous)
create policy "Anyone can submit forms"
  on form_submissions for insert
  with check (true);

-- Authenticated users can view their own submissions
create policy "Users can view own submissions"
  on form_submissions for select
  using (auth.uid() = submitted_by);

-- Auto-update updated_at timestamp
create or replace function update_form_submissions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger form_submissions_updated_at
  before update on form_submissions
  for each row
  execute function update_form_submissions_updated_at();
