-- Audit #7 phase C — Google Sheets ↔ Supabase inventory bridge.
--
-- Adds a `last_synced_at` timestamp per inventory row so the two-way sync
-- can break loops:
--
--   1. Vercel cron pushes inventory → Sheet every 5 min, stamps last_synced_at.
--   2. Apps Script onEdit pushes Sheet → inventory via webhook.
--      The webhook skips writes if the matching row's last_synced_at is
--      within the last 60 seconds (i.e. the edit is probably the echo of
--      our own outbound push).
--
-- Idempotent.

ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

-- Index helps the webhook quickly find the row to update by sku-via-product_id.
CREATE INDEX IF NOT EXISTS idx_inventory_product_id_lookup ON inventory(product_id);
