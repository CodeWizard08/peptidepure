-- Two-way inventory sync — audit #7, phase B.
--
-- Phase A (migration 020) propagated products.stock_quantity → inventory.
-- This phase adds the reverse: when an admin edits inventory.stock via
-- /admin → Inventory List (or the row-level PATCH), propagate that back
-- to products.stock_quantity so the products table stays the source of
-- truth and purchase decrements operate on the correct number.
--
-- Loop protection: both triggers guard on pg_trigger_depth() <= 1. The
-- first trigger fires on a direct admin edit (depth 1, allowed); when it
-- writes to the other table, the sibling trigger fires at depth 2 and
-- silently no-ops.
--
-- This migration also patches the products → inventory trigger from 020
-- to flip the inventory.status BACK to 'ok' when a restock takes stock
-- above the low-stock threshold. Previously a restock from 0 → 100 left
-- status='out' even though stock was healthy again.
--
-- Idempotent.

-- ─── Updated forward trigger (020 → with restock-aware status + loop guard) ─
CREATE OR REPLACE FUNCTION sync_product_stock_to_inventory()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Loop guard: skip if this UPDATE was itself triggered by the reverse
  -- sync trigger. Direct edits to products run at depth=1.
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
          -- Restock event: flip terminal/awaiting statuses back to 'ok'.
          WHEN status IN ('out', 'order') THEN 'ok'
          ELSE status
        END,
        updated_at = now()
      WHERE product_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- ─── New reverse trigger: inventory.stock → products.stock_quantity ─────────
-- Fires on INSERT too, because the bulk-save endpoint for /admin → Inventory
-- List uses a DELETE + INSERT pattern (see PUT /api/admin/inventory), so a
-- pure UPDATE trigger would silently miss those edits.
CREATE OR REPLACE FUNCTION sync_inventory_stock_to_product()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Loop guard: skip if this UPDATE was itself triggered by the forward
  -- sync trigger. Direct edits run at depth=1.
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  -- Only propagate when the row is linked to a product. (Standalone inventory
  -- rows with product_id IS NULL exist for SKUs the clinic stocks but doesn't
  -- transact through the platform — those don't affect any products row.)
  IF NEW.product_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- On UPDATE, only fire when stock actually changed (avoids spurious writes
  -- to products when admin edits only status/notes). On INSERT, OLD is NULL
  -- so we always propagate the seed stock.
  IF TG_OP = 'INSERT' OR NEW.stock IS DISTINCT FROM OLD.stock THEN
    UPDATE products
      SET stock_quantity = NEW.stock
      WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_inventory_stock_to_product ON inventory;
-- Cannot use "OF stock" with INSERT, so the trigger fires on every
-- INSERT/UPDATE and the function gates on actual stock change.
CREATE TRIGGER trg_sync_inventory_stock_to_product
  AFTER INSERT OR UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION sync_inventory_stock_to_product();
