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
-- Walks bundle_components breadth-first using parallel arrays as a queue.
-- Visited set prevents infinite loops if the component graph contains a cycle.
create or replace function decrement_stock(p_product_id uuid, p_quantity integer)
returns void as $$
declare
  visited      uuid[]    := array[]::uuid[];
  queue_ids    uuid[]    := array[p_product_id];
  queue_qtys   integer[] := array[p_quantity];
  current_id   uuid;
  current_qty  integer;
  pending      record;
begin
  while coalesce(array_length(queue_ids, 1), 0) > 0 loop
    current_id  := queue_ids[1];
    current_qty := queue_qtys[1];
    queue_ids   := queue_ids[2:];
    queue_qtys  := queue_qtys[2:];

    if current_id = any(visited) then
      continue;
    end if;
    visited := array_append(visited, current_id);

    perform _pp_decrement_one(current_id, current_qty);

    for pending in
      select component_product_id as cid,
             quantity * current_qty as qty
      from bundle_components
      where parent_product_id = current_id
    loop
      queue_ids  := array_append(queue_ids,  pending.cid);
      queue_qtys := array_append(queue_qtys, pending.qty);
    end loop;
  end loop;
end;
$$ language plpgsql security definer;
