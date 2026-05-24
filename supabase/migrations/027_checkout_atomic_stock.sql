-- Atomic stock reservation for the storefront checkout (Codex rescue
-- review, HIGH severity items #1 + #2 — TOCTOU between stock validation
-- and decrement; partial-failure window between charge and decrement).
--
-- Design: reserve-then-charge.
--   1. Caller pre-expands the cart (cart items + bundle components) into a
--      flat JSONB array of {product_id, quantity}.
--   2. `checkout_reserve_stock` locks each product row FOR UPDATE inside
--      one transaction, verifies stock is sufficient, and decrements.
--      Raises an exception on the first underflow — Postgres rolls the
--      whole transaction back so partial decrements never leak.
--   3. The route then calls Authorize.net.
--   4. If the charge fails (or the order insert fails), the route calls
--      `checkout_release_stock` to undo the reservation.
--
-- The row-level lock is held only for the duration of the reserve RPC
-- (milliseconds), NOT during the Authorize.net round trip — that would
-- serialize all checkouts behind a slow payment processor.
--
-- We do NOT recurse into bundle_components here. The caller is responsible
-- for expansion, because the same expansion is already needed for the
-- pre-flight validation and the order-line audit. Doing it in two places
-- (TS pre-flight + PL/pgSQL recursion) would let them drift.

create or replace function checkout_reserve_stock(p_items jsonb)
returns void as $$
declare
  rec record;
  v_current integer;
  v_name    text;
begin
  for rec in
    select
      (value->>'product_id')::uuid as product_id,
      (value->>'quantity')::integer as quantity
    from jsonb_array_elements(p_items)
  loop
    if rec.quantity is null or rec.quantity <= 0 then
      continue;
    end if;

    -- Lock the row for the rest of this transaction. Concurrent reserves
    -- block here until our transaction commits/rolls back.
    select stock_quantity, name
    into v_current, v_name
    from products
    where id = rec.product_id
    for update;

    if not found then
      raise exception 'checkout_reserve_stock: product % not found', rec.product_id
        using errcode = 'P0002';
    end if;

    -- stock_quantity NULL = untracked / unlimited. We still touch the row
    -- (FOR UPDATE above) so the caller can rely on a consistent view but
    -- skip the underflow check.
    if v_current is not null and v_current < rec.quantity then
      raise exception 'checkout_reserve_stock: insufficient stock for % (have %, need %)',
        v_name, v_current, rec.quantity
        using errcode = 'P0001';
    end if;

    perform _pp_decrement_one(rec.product_id, rec.quantity);
  end loop;
end;
$$ language plpgsql security definer;

-- Compensating action — restore reserved stock when the charge or order
-- insert fails after a successful reserve. Mirrors _pp_decrement_one but
-- adds rather than subtracts.
create or replace function checkout_release_stock(p_items jsonb)
returns void as $$
declare
  rec record;
  v_new_stock integer;
begin
  for rec in
    select
      (value->>'product_id')::uuid as product_id,
      (value->>'quantity')::integer as quantity
    from jsonb_array_elements(p_items)
  loop
    if rec.quantity is null or rec.quantity <= 0 then
      continue;
    end if;

    update products
    set stock_quantity = stock_quantity + rec.quantity
    where id = rec.product_id
      and stock_quantity is not null;

    update inventory
    set
      stock = stock + rec.quantity,
      status = case
        when stock + rec.quantity = 0 then 'out'
        when stock + rec.quantity < 10 then 'low'
        else 'in_stock'
      end
    where product_id = rec.product_id;
  end loop;
end;
$$ language plpgsql security definer;
