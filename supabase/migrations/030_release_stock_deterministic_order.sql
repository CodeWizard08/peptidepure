-- Codex rescue review round 3 — make `checkout_release_stock` lock rows in
-- the same canonical product_id order that `checkout_reserve_stock` uses.
-- Two concurrent releases for overlapping SKUs could otherwise acquire
-- per-row locks in different orders and risk a deadlock. The reserve+release
-- pair should always agree on the lock order so a release that immediately
-- follows a charge failure can't deadlock against another in-flight reserve.

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
    ORDER BY (value->>'product_id')::uuid
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
