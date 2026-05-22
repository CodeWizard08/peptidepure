-- Two-way inventory sync — audit #7, phase A.
--
-- The /inventory clinician view (components/InventoryDashboard.tsx) already
-- subscribes to Supabase Realtime on the `inventory` table, so once an
-- `inventory` row changes, the dashboard live-updates without a refresh.
--
-- What was missing: when an admin edits `products.stock_quantity` via
-- /admin → Inventory & Pricing or /admin → Products, the change never reached
-- the `inventory` table. The two columns were drifting silently.
--
-- This migration:
--   1. Adds a trigger on products.stock_quantity → propagates to linked
--      inventory rows, including the status transition logic (out/low/ok)
--      that previously lived only inside the decrement RPC.
--   2. Simplifies _pp_decrement_one to only touch products. The trigger
--      handles inventory propagation, so there's now exactly ONE place that
--      writes to inventory.stock from a products event — no double decrement.
--
-- Idempotent.

-- ─── Trigger: products.stock_quantity → inventory.stock ─────────────────────
CREATE OR REPLACE FUNCTION sync_product_stock_to_inventory()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Only act when stock_quantity actually changed.
  IF NEW.stock_quantity IS DISTINCT FROM OLD.stock_quantity THEN
    UPDATE inventory
      SET
        stock = COALESCE(NEW.stock_quantity, 0),
        status = CASE
          WHEN COALESCE(NEW.stock_quantity, 0) = 0 THEN 'out'
          WHEN COALESCE(NEW.stock_quantity, 0) < 10 THEN 'low'
          ELSE status
        END,
        updated_at = now()
      WHERE product_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_product_stock_to_inventory ON products;
CREATE TRIGGER trg_sync_product_stock_to_inventory
  AFTER UPDATE OF stock_quantity ON products
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_stock_to_inventory();

-- ─── Refactor _pp_decrement_one — products-only, trigger handles inventory ──
-- Previously this updated both products.stock_quantity AND inventory.stock
-- directly. With the new trigger in place, that's a double-decrement bug
-- (products update fires the trigger, which writes inventory.stock to the
-- new product stock, then the explicit inventory update would decrement it
-- AGAIN). Strip the inventory portion — the trigger is now the single
-- writer to inventory from product stock changes.
CREATE OR REPLACE FUNCTION _pp_decrement_one(p_product_id uuid, p_quantity integer)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock_quantity = greatest(0, stock_quantity - p_quantity)
  WHERE id = p_product_id
    AND stock_quantity IS NOT NULL;
  -- inventory row updated by trg_sync_product_stock_to_inventory
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
