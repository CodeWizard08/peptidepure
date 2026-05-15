-- Migration 011 wired the Peptide Buzz product photography by slug, but the
-- pre-existing Peptide Buzz rows in production have different slugs (longer,
-- human-typed names like "royale-repair-whipped-tallow-ghk-cu-peptide-balm")
-- than the canonical slugs migration 009 assumed. Those UPDATEs missed every
-- row except the one whose slug happened to match (Duo).
--
-- This migration re-targets the UPDATEs by SKU — the stable identifier shared
-- between the master pricing spreadsheet, migration 007 (brand tagging), and
-- every seeded version of these products.
--
-- Only updates rows where image_url is currently empty so admin-uploaded
-- photos through /admin → Products are never overwritten.
--
-- Safe to re-run: every statement is idempotent.

UPDATE products
SET image_url = 'https://www.peptide.buzz/img/neurosting-citrus.png'
WHERE sku = 'PB-NS-CT-NC-20T-V1'
  AND (image_url IS NULL OR image_url = '');

UPDATE products
SET image_url = 'https://www.peptide.buzz/img/tallow-balm.png'
WHERE sku = 'PB-RR-GHKCU-WHIP-60ML'
  AND (image_url IS NULL OR image_url = '');

UPDATE products
SET image_url = 'https://www.peptide.buzz/img/serum.png'
WHERE sku = 'PB-RR-GHKCU-S8-SERUM-30ML'
  AND (image_url IS NULL OR image_url = '');

UPDATE products
SET image_url = 'https://www.peptide.buzz/img/duo-box.png'
WHERE sku = 'PB-RR-DUO'
  AND (image_url IS NULL OR image_url = '');

-- Demote the Wintergreen variant by SKU too, since the slug-based demote in
-- migration 011 may have missed the pre-existing row.
UPDATE products
SET sort_order = 1010
WHERE sku = 'PB-NS-WG-CAF-20T-V1'
  AND sort_order < 1010;
