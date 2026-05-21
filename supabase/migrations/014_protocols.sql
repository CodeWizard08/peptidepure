-- /protocols hub — clinician-facing protocol library
-- Scott's brief: "links to Claude. We can have Claude write the protocols…
-- I can edit. Need lots of pages and good organization."
--
-- Each protocol is one row. body_md holds long-form markdown that Claude
-- drafts and Scott edits. status='draft' hides from public; 'published'
-- shows on /protocols and /protocols/<slug>.

CREATE TABLE IF NOT EXISTS protocols (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  title        text NOT NULL,
  category     text,
  summary      text,
  body_md      text NOT NULL DEFAULT '',
  peptides     text[] NOT NULL DEFAULT '{}',
  image_url    text,
  status       text NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft','published','archived')),
  sort_order   integer NOT NULL DEFAULT 0,
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Defensive: if a `protocols` table existed before this migration with a
-- different shape (different Claude session, prior tooling, hand-rolled
-- experiment), CREATE TABLE IF NOT EXISTS skipped silently. Add each
-- expected column individually so the rest of the migration works.
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS slug         text;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS title        text;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS category     text;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS summary      text;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS body_md      text NOT NULL DEFAULT '';
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS peptides     text[] NOT NULL DEFAULT '{}';
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS image_url    text;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS status       text NOT NULL DEFAULT 'draft';
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS sort_order   integer NOT NULL DEFAULT 0;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS metadata     jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS created_at   timestamptz NOT NULL DEFAULT now();
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS updated_at   timestamptz NOT NULL DEFAULT now();

-- Make slug unique if it isn't already (CREATE UNIQUE INDEX is idempotent
-- via IF NOT EXISTS; the constraint shape inside CREATE TABLE didn't apply
-- to the pre-existing table).
CREATE UNIQUE INDEX IF NOT EXISTS protocols_slug_key ON protocols(slug);

-- Make sure the status CHECK constraint exists (CREATE TABLE skipped it on
-- a pre-existing table). Drop-and-readd to handle the case where an older
-- constraint allowed different values.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'protocols_status_check'
      AND conrelid = 'protocols'::regclass
  ) THEN
    ALTER TABLE protocols DROP CONSTRAINT protocols_status_check;
  END IF;
  ALTER TABLE protocols
    ADD CONSTRAINT protocols_status_check CHECK (status IN ('draft','published','archived'));
END $$;

CREATE INDEX IF NOT EXISTS idx_protocols_status_sort
  ON protocols(status, sort_order);

CREATE INDEX IF NOT EXISTS idx_protocols_category_published
  ON protocols(category) WHERE status = 'published';

-- RLS — anyone can read published protocols; mutations go through the
-- admin service-role key (same pattern as products).
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published protocols" ON protocols;
CREATE POLICY "Anyone can view published protocols"
  ON protocols FOR SELECT USING (status = 'published');

-- Auto-touch updated_at
CREATE OR REPLACE FUNCTION update_protocols_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS protocols_updated_at ON protocols;
CREATE TRIGGER protocols_updated_at
  BEFORE UPDATE ON protocols
  FOR EACH ROW EXECUTE FUNCTION update_protocols_updated_at();

-- Seed the existing 8 protocols from content/peptides.json so the page
-- is useful on day one. Body left empty for Scott to fill via the
-- "Draft with Claude" button in /admin → Protocols.
-- Safe to re-run: ON CONFLICT (slug) DO NOTHING.
INSERT INTO protocols (slug, title, category, summary, peptides, image_url, status, sort_order) VALUES
  (
    'aesthetic-tissue-regeneration',
    'Aesthetic & Tissue Regeneration Comparison Protocol',
    'MSK/Tissue Repair',
    'Compare multi-peptide regenerative formulation (GLOW) vs higher-dose GHK-Cu monotherapy, with optional glutathione support.',
    ARRAY['BPC-157 10mg','GHK-Cu 50mg','TB4 (TB-500) 10mg','Glutathione 1500mg'],
    'https://dzbvaswimmaxfvambivu.supabase.co/storage/v1/object/public/peptides/wp-content/uploads/2026/01/IMG_1351.jpeg',
    'draft', 1
  ),
  (
    'soft-tissue-repair',
    'Soft-Tissue Repair & Regenerative Support Protocol',
    'MSK/Tissue Repair',
    'Focused tissue repair protocol combining BPC-157 and TB-500 for musculoskeletal and soft-tissue recovery.',
    ARRAY['BPC-157 10mg','TB4 (TB-500) 10mg','BPC-157/TB500 10mg'],
    'https://dzbvaswimmaxfvambivu.supabase.co/storage/v1/object/public/peptides/wp-content/uploads/2026/01/BPC-TB4-COMBOS.jpeg',
    'draft', 2
  ),
  (
    'metabolic-health-body-composition',
    'Metabolic Health & Body Composition Comparison Protocol',
    'Metabolism/Weight Loss',
    'Compare GLP-1/GIP agonists alongside metabolic peptides for body composition optimization.',
    ARRAY['Tirz 10mg','Reta 10mg','Sema 15mg','AOD-9604 2mg','MOTS-c 10mg'],
    'https://dzbvaswimmaxfvambivu.supabase.co/storage/v1/object/public/peptides/wp-content/uploads/2026/01/Bundle-Vial-Mockups-4.png',
    'draft', 3
  ),
  (
    'lean-mass-growth-hormone',
    'Lean Mass & Growth Hormone Optimization Protocol',
    'Growth Hormone',
    'Growth hormone optimization using synergistic GHRH/GHRP combinations for lean mass and recovery.',
    ARRAY['CJC-1295/Ipamorelin 10mg','Ipamorelin 5mg','Tesamorelin 10mg','Sermorelin 10mg'],
    'https://dzbvaswimmaxfvambivu.supabase.co/storage/v1/object/public/peptides/wp-content/uploads/2026/01/Bundle-Vial-Mockups-Lean-Mass-Growth-Hormone-Optimization-Protocol.png',
    'draft', 4
  ),
  (
    'libido-sexual-response',
    'Libido & Sexual Response Comparison Protocol',
    'Cognitive & Mood',
    'Compare PT-141 against oxytocin and melanotan-II for libido, sexual response, and mood support.',
    ARRAY['PT-141 10mg','Oxytocin 5mg','Melanotan-II 10mg'],
    'https://dzbvaswimmaxfvambivu.supabase.co/storage/v1/object/public/peptides/wp-content/uploads/2026/01/PT141-OXY-MT2.jpeg',
    'draft', 5
  ),
  (
    'neuroplasticity-circadian',
    'Neuroplasticity & Circadian Optimization Protocol',
    'Cognitive & Mood',
    'Neuroplasticity support and circadian rhythm regulation through targeted cognitive peptides.',
    ARRAY['Cerebrolysin 60mg','NA-Selank Amidate 30mg','Selank 10mg','Semax 10mg','DSIP 10mg'],
    null,
    'draft', 6
  ),
  (
    'mitochondrial-support',
    'Mitochondrial Support Protocol',
    'Longevity & Mitochondrial',
    'Mitochondrial function and cellular energy support combining MOTS-c, SS-31, and NAD+.',
    ARRAY['MOTS-c 10mg','SS-31 10mg','NAD+ 1000mg','Glutathione 1500mg'],
    null,
    'draft', 7
  ),
  (
    'longevity',
    'Longevity Protocol',
    'Longevity & Mitochondrial',
    'Multi-mechanism longevity stack combining cellular aging, neuroprotection, and tissue support peptides.',
    ARRAY['Epithalon 10mg','GHK-Cu 50mg','MOTS-c 10mg','Pinealon 10mg','NAD+ 1000mg'],
    null,
    'draft', 8
  )
ON CONFLICT (slug) DO NOTHING;
