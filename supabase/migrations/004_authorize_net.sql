-- Add transaction_id column for Authorize.net payments
-- Run this in the Supabase SQL Editor

alter table orders add column if not exists transaction_id text;
