-- Codex rescue review round 2 fixups for migration 027.
--
-- (1) HIGH — Drop redundant inventory writes from stock-mutating RPCs.
--     Since migration 022 installed the forward trigger
--     `sync_product_stock_to_inventory()`, updating `products.stock_quantity`
--     automatically mirrors into `inventory.stock` AND sets a status from
--     the canonical vocabulary ('ok','low','order','out'). Any RPC that
--     ALSO writes inventory directly causes a double-write and (in our
--     027 release case) violates `inventory_status_check` because we used
--     the non-existent status 'in_stock'.
--
--     Affected functions:
--       - _pp_decrement_one (originally migration 008, pre-dates the trigger)
--       - checkout_release_stock (migration 027)
--     Both are rewritten to update only `products`; the trigger handles
--     the rest.
--
-- (2) MEDIUM — Sort + aggregate items inside checkout_reserve_stock.
--     The caller passes a JSONB array; locking rows in caller order opens
--     an ABBA deadlock window for two concurrent carts with overlapping
--     SKUs in different orders. Sorting by product_id at the start of the
--     RPC gives every transaction the same lock order. Aggregating
--     duplicate product_ids defends against malformed payloads that list
--     the same SKU twice.
--
-- Idempotent — CREATE OR REPLACE for each function.

-- (1a) Only touch products; trigger from 022 syncs inventory.
CREATE OR REPLACE FUNCTION _pp_decrement_one(p_product_id uuid, p_quantity integer)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock_quantity = greatest(0, stock_quantity - p_quantity)
  WHERE id = p_product_id
    AND stock_quantity IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (1b) Release reverses a reservation; same single-table policy.
CREATE OR REPLACE FUNCTION checkout_release_stock(p_items jsonb)
RETURNS void AS $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT
      (value->>'product_id')::uuid AS product_id,
      sum((value->>'quantity')::integer) AS quantity
    FROM jsonb_array_elements(p_items)
    GROUP BY (value->>'product_id')::uuid
  LOOP
    IF rec.quantity IS NULL OR rec.quantity <= 0 THEN
      CONTINUE;
    END IF;
    UPDATE products
    SET stock_quantity = stock_quantity + rec.quantity
    WHERE id = rec.product_id
      AND stock_quantity IS NOT NULL;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (2) Reserve with deterministic lock order + duplicate aggregation.
CREATE OR REPLACE FUNCTION checkout_reserve_stock(p_items jsonb)
RETURNS void AS $$
DECLARE
  rec record;
  v_current integer;
  v_name    text;
BEGIN
  FOR rec IN
    SELECT
      (value->>'product_id')::uuid AS product_id,
      sum((value->>'quantity')::integer) AS quantity
    FROM jsonb_array_elements(p_items)
    GROUP BY (value->>'product_id')::uuid
    ORDER BY (value->>'product_id')::uuid
  LOOP
    IF rec.quantity IS NULL OR rec.quantity <= 0 THEN
      CONTINUE;
    END IF;

    SELECT stock_quantity, name INTO v_current, v_name
    FROM products
    WHERE id = rec.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'checkout_reserve_stock: product % not found', rec.product_id
        USING errcode = 'P0002';
    END IF;

    IF v_current IS NOT NULL AND v_current < rec.quantity THEN
      RAISE EXCEPTION 'checkout_reserve_stock: insufficient stock for % (have %, need %)',
        v_name, v_current, rec.quantity
        USING errcode = 'P0001';
    END IF;

    PERFORM _pp_decrement_one(rec.product_id, rec.quantity);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
