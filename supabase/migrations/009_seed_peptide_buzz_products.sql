-- Seed the Peptide Buzz OTC line into the products catalog so clinics can
-- bulk-purchase them through peptidepure.com. The home-page showcase and the
-- /peptides?shop=buzz quick-nav both read from this table.
--
-- Pricing uses the per-unit clinic/wholesale price from the
-- "FOR AI APP: Peptide Pure & Peptide Buzz Pricing & SKUs" spreadsheet.
-- upsell_cents = retail/5-pack price, preorder_cents = preorder/sub price.
--
-- image_url is intentionally left null — admins upload via the Products panel
-- once final product photography is in Supabase storage. Cards render a
-- branded fallback in the meantime.
--
-- Safe to re-run: ON CONFLICT (slug) DO NOTHING.
-- Intentionally NON-AUTHORITATIVE on re-run — once a slug exists, this seed
-- is a no-op for that row. Admin edits to pricing, copy, or metadata in the
-- Products panel win and are never overwritten. To force a full reset, run
-- DELETE WHERE sku IN (...) before re-applying this migration.

INSERT INTO products (
  name, slug, description, category, subcategory,
  price_cents, image_url, sku, is_active, sort_order, metadata
) VALUES
  (
    'Neurosting Oral Pouches — Wintergreen + Caffeine',
    'neurosting-wintergreen-caffeine',
    'BPC-157 + NAD+ oral peptide pouches with 80mg caffeine. Wintergreen flavor, sublingual absorption in minutes.',
    'Nootropics', null,
    3700, null,
    'PB-NS-WG-CAF-20T-V1', true, 1000,
    '{"brand":"peptidebuzz","form":"oral pouch","amount":"20 pouches","gtin":"860014731501","upsell_cents":13900,"preorder_cents":10900,"inventory":"in_stock","collection":"Neurosting"}'::jsonb
  ),
  (
    'Neurosting Oral Pouches — Citrus (Caffeine-Free)',
    'neurosting-citrus',
    'BPC-157 + NAD+ oral peptide pouches, caffeine-free. Citrus flavor, sublingual absorption in minutes.',
    'Nootropics', null,
    3700, null,
    'PB-NS-CT-NC-20T-V1', true, 1001,
    '{"brand":"peptidebuzz","form":"oral pouch","amount":"20 pouches","gtin":"860014731518","upsell_cents":13900,"preorder_cents":10900,"inventory":"in_stock","collection":"Neurosting"}'::jsonb
  ),
  (
    'Royale Repair Tallow Balm',
    'royale-repair-tallow-balm',
    'Whipped grass-fed tallow + GHK-Cu copper peptide for collagen synthesis and skin regeneration. 60mL jar.',
    'Anti-aging Aesthetics', null,
    8800, null,
    'PB-RR-GHKCU-WHIP-60ML', true, 1002,
    '{"brand":"peptidebuzz","form":"topical balm","amount":"60mL","gtin":"00860014731525","upsell_cents":7900,"preorder_cents":7800,"inventory":"in_stock","collection":"Royale Repair"}'::jsonb
  ),
  (
    'Royale Repair Peptide Serum',
    'royale-repair-serum',
    'GHK-Cu + SNAP-8 peptide smoothing serum — reverses photodamage and softens micro-expressions without injectables. 30mL dropper.',
    'Anti-aging Aesthetics', null,
    10800, null,
    'PB-RR-GHKCU-S8-SERUM-30ML', true, 1003,
    '{"brand":"peptidebuzz","form":"topical serum","amount":"30mL","gtin":"00860014731532","upsell_cents":9700,"preorder_cents":9500,"inventory":"in_stock","collection":"Royale Repair"}'::jsonb
  ),
  (
    'Royale Ritual Duo (Balm + Serum)',
    'royale-ritual-duo',
    'The complete Royale Repair anti-aging stack — GHK-Cu Tallow Balm + GHK-Cu/SNAP-8 Serum, formulated to work together.',
    'Anti-aging Aesthetics', null,
    17800, null,
    'PB-RR-DUO', true, 1004,
    '{"brand":"peptidebuzz","form":"bundle","gtin":"860014731549","upsell_cents":16000,"preorder_cents":15800,"inventory":"in_stock","collection":"Royale Repair"}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;
