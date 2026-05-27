-- Codex review of Slice 6 — tighten DB constraints.

-- P1: cap side_effects array at 20 entries
alter table patient_dosing_logs
  drop constraint if exists patient_dosing_logs_side_effects_count_chk;
alter table patient_dosing_logs
  add constraint patient_dosing_logs_side_effects_count_chk
  check (cardinality(side_effects) <= 20);

-- P2: weight_lbs semantic range (50-1000 lbs)
alter table patient_check_ins
  drop constraint if exists patient_check_ins_weight_lbs_chk;
alter table patient_check_ins
  add constraint patient_check_ins_weight_lbs_chk
  check (weight_lbs is null or weight_lbs between 50 and 1000);
