-- Peptide Buzz pricing corrections per Scott's May 21 audit, §2 source-of-
-- truth table.
--
-- Migration 009 seeded:
--   Royale Repair Balm:   price_cents=8800, upsell_cents=7900  ← upsell inverted
--   Royale Repair Serum:  price_cents=10800, upsell_cents=9700 ← upsell inverted
--   Royale Ritual Duo:    price_cents=17800, upsell_cents=16000 ← bogus discount
--   Neurosting Wintergreen: upsell_cents=13900 ($139)  ← 5-pack should be $149
--   Neurosting Citrus:      upsell_cents=13900 ($139)  ← 5-pack should be $149
--
-- §2 says Provider/Clinic for Royale Repair is volume-tier only (no single-
-- unit clinic price below retail), so the strikethrough has nothing legitimate
-- to show — clear upsell_cents on those rows. Volume tiers will be wired in a
-- follow-up via the new admin tier-pricing UI (audit #1).
--
-- Each UPDATE is gated by the *original* wrong value so admin manual edits
-- via /admin → Products are never overwritten. Re-running is a no-op.

-- ─── Royale Repair Balm — clear inverted upsell ─────────────────────────────
UPDATE products
SET metadata = metadata - 'upsell_cents'
WHERE sku = 'PB-RR-GHKCU-WHIP-60ML'
  AND (metadata->>'upsell_cents')::int = 7900;

-- ─── Royale Repair Serum — clear inverted upsell ────────────────────────────
UPDATE products
SET metadata = metadata - 'upsell_cents'
WHERE sku = 'PB-RR-GHKCU-S8-SERUM-30ML'
  AND (metadata->>'upsell_cents')::int = 9700;

-- ─── Royale Ritual Duo — clear bogus discount strikethrough ─────────────────
UPDATE products
SET metadata = metadata - 'upsell_cents'
WHERE sku = 'PB-RR-DUO'
  AND (metadata->>'upsell_cents')::int = 16000;

-- ─── Neurosting Wintergreen — correct 5-pack upsell to $149 ─────────────────
UPDATE products
SET metadata = jsonb_set(metadata, '{upsell_cents}', '14900'::jsonb)
WHERE sku = 'PB-NS-WG-CAF-20T-V1'
  AND (metadata->>'upsell_cents')::int = 13900;

-- ─── Neurosting Citrus — correct 5-pack upsell to $149 ──────────────────────
UPDATE products
SET metadata = jsonb_set(metadata, '{upsell_cents}', '14900'::jsonb)
WHERE sku = 'PB-NS-CT-NC-20T-V1'
  AND (metadata->>'upsell_cents')::int = 13900;
