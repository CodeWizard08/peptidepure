-- Codex review fixes for audit #7 rounds 4 + 5.
--
-- (1) Atomic bulk replace
--     /api/admin/inventory PUT previously did DELETE-all then INSERT-all as
--     two separate Supabase calls. Between the DELETE commit and the INSERT
--     commit, a concurrent purchase could decrement products.stock_quantity
--     against stale state and then be overwritten by the INSERT phase's
--     reverse-trigger fire — silently losing the decrement.
--
--     This migration adds an RPC that does DELETE + INSERT in a single
--     transaction. The PUT route is updated in the same commit to call the
--     RPC instead of issuing two separate statements.
--
-- (2) Restock from 'low' status now flips to 'ok'
--     The forward trigger added in 021 only flipped 'out'/'order' back to
--     'ok' on restock. A stock 5 → 15 update left status='low' even though
--     stock was healthy again.
--
-- (3) inventory.stock CHECK constraint
--     Adds a non-negative constraint so a bad write can never propagate a
--     negative number through the reverse trigger to products.stock_quantity.
--
-- Idempotent.

-- ─── stock >= 0 CHECK constraint ────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'inventory_stock_nonneg'
      AND conrelid = 'inventory'::regclass
  ) THEN
    -- Clamp any existing negative rows first so the constraint applies cleanly.
    UPDATE inventory SET stock = 0 WHERE stock < 0;
    ALTER TABLE inventory ADD CONSTRAINT inventory_stock_nonneg CHECK (stock >= 0);
  END IF;
END $$;

-- ─── Forward trigger: include 'low' in the restock-to-'ok' branch ───────────
CREATE OR REPLACE FUNCTION sync_product_stock_to_inventory()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  IF NEW.stock_quantity IS DISTINCT FROM OLD.stock_quantity THEN
    UPDATE inventory
      SET
        stock = COALESCE(NEW.stock_quantity, 0),
        status = CASE
          WHEN COALESCE(NEW.stock_quantity, 0) = 0 THEN 'out'
          WHEN COALESCE(NEW.stock_quantity, 0) < 10 THEN 'low'
          -- Restock arriving — flip terminal/awaiting statuses (including
          -- the prior 'low' state) back to 'ok' when stock is healthy.
          WHEN status IN ('out', 'order', 'low') THEN 'ok'
          ELSE status
        END,
        updated_at = now()
      WHERE product_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- ─── Atomic inventory replace RPC ───────────────────────────────────────────
-- Takes a jsonb array of inventory rows; deletes everything and re-inserts in
-- a single transaction so no concurrent reader sees the intermediate empty
-- state. The reverse trigger fires once per INSERT to keep
-- products.stock_quantity in sync.
CREATE OR REPLACE FUNCTION replace_inventory(p_rows jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM inventory;
  IF p_rows IS NULL OR jsonb_array_length(p_rows) = 0 THEN
    RETURN;
  END IF;

  INSERT INTO inventory (product, dose, stock, status, notes, sort_order, product_id)
  SELECT
    (rec->>'product')::text,
    (rec->>'dose')::text,
    GREATEST(0, COALESCE((rec->>'stock')::int, 0)),
    (rec->>'status')::text,
    NULLIF(rec->>'notes', '')::text,
    COALESCE((rec->>'sort_order')::int, 0),
    NULLIF(rec->>'product_id', '')::uuid
  FROM jsonb_array_elements(p_rows) rec;
END;
$$;
