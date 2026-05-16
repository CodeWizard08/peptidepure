-- Real Peptide Buzz inventory counts from Scott (2026-05-16):
--   Tallow Balm: 995 jars
--   Serum: 995 bottles
--   Neurosting Wintergreen: 2003 cans / 5 = 406 five-packs (the saleable unit)
--   Neurosting Citrus: 1564 cans / 5 = 312 five-packs (the saleable unit)
--
-- These replace the placeholder stock=0/status='order' rows from migration 010.
-- Status flips to 'ok' since stock is well above the low/out thresholds.
--
-- Targeted by SKU to match production rows regardless of slug (same lesson
-- as migration 012).
--
-- Safe to re-run: UPDATEs are idempotent.

-- Use IN (...) rather than = (… LIMIT 1) — if migration 009 created shadow
-- product rows (same SKU, different slug from production), this still matches
-- the linked inventory row regardless of which products.id it points to.

UPDATE inventory
SET stock = 995, status = 'ok',
    notes = 'Stock confirmed 2026-05-16'
WHERE product_id IN (SELECT id FROM products WHERE sku = 'PB-RR-GHKCU-WHIP-60ML');

UPDATE inventory
SET stock = 995, status = 'ok',
    notes = 'Stock confirmed 2026-05-16'
WHERE product_id IN (SELECT id FROM products WHERE sku = 'PB-RR-GHKCU-S8-SERUM-30ML');

UPDATE inventory
SET stock = 406, status = 'ok',
    notes = '2003 cans · 5-pack units · stock confirmed 2026-05-16'
WHERE product_id IN (SELECT id FROM products WHERE sku = 'PB-NS-WG-CAF-20T-V1');

UPDATE inventory
SET stock = 312, status = 'ok',
    notes = '1564 cans · 5-pack units · stock confirmed 2026-05-16'
WHERE product_id IN (SELECT id FROM products WHERE sku = 'PB-NS-CT-NC-20T-V1');
