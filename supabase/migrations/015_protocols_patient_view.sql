-- Add a patient-facing version of each protocol so Scott can share the
-- /protocols/<slug>?view=patient link directly without rewriting.
--
-- The clinical (body_md) version stays as the default for the catalog;
-- patient_md is opt-in via the "?view=patient" query param or the tab
-- switcher on the detail page.

ALTER TABLE protocols
  ADD COLUMN IF NOT EXISTS patient_md text NOT NULL DEFAULT '';
