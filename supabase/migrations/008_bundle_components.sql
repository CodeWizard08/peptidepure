-- Bundle / Protocol Package → Component Peptides mapping.
-- When a customer purchases a bundle product (e.g. "$5,000 Foundation Bundle" or
-- "Metabolic Health Comparison Protocol"), each component peptide's inventory
-- should decrement automatically, not just the parent SKU.
--
-- The shape is: one row per (parent bundle product, component peptide product),
-- with `quantity` = how many vials of the component per one bundle purchased.
--
-- decrement_stock() is upgraded: after touching the parent, it recurses into
-- bundle_components and decrements each component (products.stock_quantity AND
-- the linked inventory row from migration 006). Cycle-safe via a visited set.

create table if not exists bundle_components (
  parent_product_id     uuid not null references products(id) on delete cascade,
  component_product_id  uuid not null references products(id) on delete restrict,
  quantity              integer not null default 1 check (quantity > 0),
  created_at            timestamptz not null default now(),
  primary key (parent_product_id, component_product_id),
  constraint bundle_no_self check (parent_product_id <> component_product_id)
);

create index if not exists idx_bundle_components_parent on bundle_components(parent_product_id);
create index if not exists idx_bundle_components_component on bundle_components(component_product_id);

-- Core helper: decrement one product (+ linked inventory row). No recursion.
create or replace function _pp_decrement_one(p_product_id uuid, p_quantity integer)
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

-- Upgraded decrement_stock — now bundle-aware.
-- Walks bundle_components breadth-first with a visited set to prevent cycles.
create or replace function decrement_stock(p_product_id uuid, p_quantity integer)
returns void as $$
declare
  visited uuid[] := array[]::uuid[];
  queue record;
  current_id uuid;
  current_qty integer;
  pending record;
begin
  -- Stack of (product_id, quantity) tuples to process.
  -- Implemented as a temp table because plpgsql has no native stack type.
  create temporary table if not exists _decrement_queue (
    product_id uuid,
    quantity   integer
  ) on commit drop;

  delete from _decrement_queue;
  insert into _decrement_queue values (p_product_id, p_quantity);

  loop
    select q.product_id, q.quantity into current_id, current_qty
    from _decrement_queue q
    limit 1;

    exit when current_id is null;

    delete from _decrement_queue
    where product_id = current_id and quantity = current_qty;

    -- Guard against cycles
    if current_id = any(visited) then
      continue;
    end if;
    visited := array_append(visited, current_id);

    -- Decrement this product (+ its linked inventory row)
    perform _pp_decrement_one(current_id, current_qty);

    -- Enqueue all components of this product with multiplied quantities
    for pending in
      select component_product_id as product_id,
             quantity * current_qty as quantity
      from bundle_components
      where parent_product_id = current_id
    loop
      insert into _decrement_queue values (pending.product_id, pending.quantity);
    end loop;
  end loop;
end;
$$ language plpgsql security definer;
