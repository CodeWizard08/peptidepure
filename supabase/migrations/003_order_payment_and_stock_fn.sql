-- Add payment_method and stripe_session_id to orders table
-- Run this in the Supabase SQL Editor

alter table orders add column if not exists payment_method text default 'invoice';
alter table orders add column if not exists stripe_session_id text;

-- Function to safely decrement product stock (called after Stripe payment)
create or replace function decrement_stock(p_product_id uuid, p_quantity integer)
returns void as $$
begin
  update products
  set stock_quantity = greatest(0, stock_quantity - p_quantity)
  where id = p_product_id
    and stock_quantity is not null;
end;
$$ language plpgsql security definer;
