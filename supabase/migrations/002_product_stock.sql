-- Add stock_quantity column to products table for inventory tracking
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

alter table products add column if not exists stock_quantity integer;

-- Set a default stock for existing products (adjust as needed)
-- update products set stock_quantity = 100 where stock_quantity is null;

-- Optional: create a view for low-stock alerts
create or replace view low_stock_products as
select id, name, slug, stock_quantity
from products
where is_active = true
  and stock_quantity is not null
  and stock_quantity < 10
order by stock_quantity asc;
