-- Wire the Peptide Buzz product photography (hosted on www.peptide.buzz) onto
-- the existing seeded SKUs, demote Neurosting Wintergreen so the four imaged
-- products fill the home-page showcase, and add two new pre-launch SKUs
-- (Sleep Strips, SX Performance Strips) so they appear in the catalog and
-- inventory list once admins finalize pricing and flip them active.
--
-- next.config.ts and components/home/PeptideBuzzCollection.tsx have been
-- updated to allow the peptide.buzz hostnames for Next/Image rendering.
--
-- Safe to re-run: UPDATEs are idempotent; INSERTs use ON CONFLICT DO NOTHING
-- and NOT EXISTS guards.

-- 1. Image URLs on the 4 fully-launched Peptide Buzz products
UPDATE products SET image_url = 'https://www.peptide.buzz/img/neurosting-citrus.png'
  WHERE slug = 'neurosting-citrus';

UPDATE products SET image_url = 'https://www.peptide.buzz/img/tallow-balm.png'
  WHERE slug = 'royale-repair-tallow-balm';

UPDATE products SET image_url = 'https://www.peptide.buzz/img/serum.png'
  WHERE slug = 'royale-repair-serum';

UPDATE products SET image_url = 'https://www.peptide.buzz/img/duo-box.png'
  WHERE slug = 'royale-ritual-duo';

-- 2. Demote Wintergreen so the home showcase (first 4 by sort_order) picks
--    the four products that actually have product photography. Wintergreen
--    still appears in /peptides?shop=buzz and the inventory list.
UPDATE products SET sort_order = 1010
  WHERE slug = 'neurosting-wintergreen-caffeine';

-- 3. Add Sleep Strips + SX Performance Strips as pre-launch SKUs.
--    is_active = false so they stay out of the public catalog until admin
--    confirms pricing/SKU and flips them active in /admin → Products.
INSERT INTO products (
  name, slug, description, category, subcategory,
  price_cents, image_url, sku, is_active, sort_order, metadata
) VALUES
  (
    'Sleep Strips',
    'sleep-strips',
    'Sublingual sleep peptide strips. Nightly support for restorative sleep without a pill or capsule.',
    'Nootropics', null,
    0, 'https://www.peptide.buzz/img/sleep-strips.png',
    'PB-SLP-V1', false, 1005,
    '{"brand":"peptidebuzz","form":"sublingual strip","inventory":"lead_time","lead_time_days":21,"collection":"Sleep","status":"pre-launch"}'::jsonb
  ),
  (
    'SX Performance Strips',
    'sx-strips',
    'Sublingual performance peptide strips for daily libido, energy, and sexual response support.',
    'Nootropics', null,
    0, 'https://www.peptide.buzz/img/sx-strips.png',
    'PB-SX-V1', false, 1006,
    '{"brand":"peptidebuzz","form":"sublingual strip","inventory":"lead_time","lead_time_days":21,"collection":"SX","status":"pre-launch"}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

-- 4. Linked inventory rows for the two new strip SKUs so they show on the
--    admin Inventory List immediately. status='order' = pre-launch / on order.
INSERT INTO inventory (product, dose, stock, status, notes, sort_order, product_id)
SELECT
  'Sleep Strips',
  'Strips · count TBD',
  0, 'order',
  'Pre-launch — confirm SKU + pricing in /admin → Products, then flip is_active=true',
  105,
  p.id
FROM products p
WHERE p.slug = 'sleep-strips'
  AND NOT EXISTS (SELECT 1 FROM inventory i WHERE i.product_id = p.id);

INSERT INTO inventory (product, dose, stock, status, notes, sort_order, product_id)
SELECT
  'SX Performance Strips',
  'Strips · count TBD',
  0, 'order',
  'Pre-launch — confirm SKU + pricing in /admin → Products, then flip is_active=true',
  106,
  p.id
FROM products p
WHERE p.slug = 'sx-strips'
  AND NOT EXISTS (SELECT 1 FROM inventory i WHERE i.product_id = p.id);
