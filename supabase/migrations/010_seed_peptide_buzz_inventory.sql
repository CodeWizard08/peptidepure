-- Add the Peptide Buzz SKUs (seeded in migration 009) to the standalone
-- inventory list so they show up on the admin "Inventory List" panel and
-- the public /inventory page.
--
-- Each row is linked via product_id so the bundle-aware decrement_stock RPC
-- (from migration 008) decrements inventory.stock automatically whenever
-- one of these products is purchased.
--
-- Initial stock = 0 / status = 'order' — these are pre-launch SKUs.
-- Admins should update stock + status in /admin → Inventory List once the
-- first lot arrives from the manufacturer / 3PL.
--
-- Safe to re-run: each INSERT uses NOT EXISTS to guard against duplicates.

INSERT INTO inventory (product, dose, stock, status, notes, sort_order, product_id)
SELECT
  'Neurosting Wintergreen + Caffeine',
  '20 pouches · 5-pack',
  0, 'order',
  'Pre-launch — adjust when first lot arrives',
  100,
  p.id
FROM products p
WHERE p.slug = 'neurosting-wintergreen-caffeine'
  AND NOT EXISTS (SELECT 1 FROM inventory i WHERE i.product_id = p.id);

INSERT INTO inventory (product, dose, stock, status, notes, sort_order, product_id)
SELECT
  'Neurosting Citrus (caffeine-free)',
  '20 pouches · 5-pack',
  0, 'order',
  'Pre-launch — adjust when first lot arrives',
  101,
  p.id
FROM products p
WHERE p.slug = 'neurosting-citrus'
  AND NOT EXISTS (SELECT 1 FROM inventory i WHERE i.product_id = p.id);

INSERT INTO inventory (product, dose, stock, status, notes, sort_order, product_id)
SELECT
  'Royale Repair Tallow Balm',
  '60mL',
  0, 'order',
  'Pre-launch — adjust when first lot arrives',
  102,
  p.id
FROM products p
WHERE p.slug = 'royale-repair-tallow-balm'
  AND NOT EXISTS (SELECT 1 FROM inventory i WHERE i.product_id = p.id);

INSERT INTO inventory (product, dose, stock, status, notes, sort_order, product_id)
SELECT
  'Royale Repair Peptide Serum',
  '30mL',
  0, 'order',
  'Pre-launch — adjust when first lot arrives',
  103,
  p.id
FROM products p
WHERE p.slug = 'royale-repair-serum'
  AND NOT EXISTS (SELECT 1 FROM inventory i WHERE i.product_id = p.id);

INSERT INTO inventory (product, dose, stock, status, notes, sort_order, product_id)
SELECT
  'Royale Ritual Duo (Balm + Serum)',
  'Bundle',
  0, 'order',
  'Bundle — verify component stock',
  104,
  p.id
FROM products p
WHERE p.slug = 'royale-ritual-duo'
  AND NOT EXISTS (SELECT 1 FROM inventory i WHERE i.product_id = p.id);
