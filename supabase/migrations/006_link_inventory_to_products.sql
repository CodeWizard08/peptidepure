-- Link inventory rows to products so online purchases auto-decrement the
-- admin "Live Inventory" list. Previously, the Stripe webhook only touched
-- products.stock_quantity — the standalone `inventory` table was never updated.
--
-- After this migration, bind each inventory row to a product via the admin UI
-- (Inventory List panel → "Linked Product" dropdown). Purchases of a bound
-- product decrement the inventory.stock column and flip status to 'low'/'out'
-- automatically. Unbound rows remain manual-only.

-- Run in Supabase SQL Editor.

alter table inventory
  add column if not exists product_id uuid references products(id) on delete set null;

create index if not exists idx_inventory_product_id
  on inventory(product_id)
  where product_id is not null;

-- Upgrade decrement_stock: decrement products.stock_quantity AND any linked
-- inventory row, plus adjust status when stock crosses thresholds.
create or replace function decrement_stock(p_product_id uuid, p_quantity integer)
returns void as $$
begin
  update products
  set stock_quantity = greatest(0, stock_quantity - p_quantity)
  where id = p_product_id
    and stock_quantity is not null;

  update inventory
  set
    stock = greatest(0, stock - p_quantity),
    status = case
      when greatest(0, stock - p_quantity) = 0 then 'out'
      when greatest(0, stock - p_quantity) < 10 then 'low'
      else status
    end
  where product_id = p_product_id;
end;
$$ language plpgsql security definer;
