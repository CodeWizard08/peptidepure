-- Inventory restock notifications
-- Captures email addresses of visitors who want to be notified when an
-- out-of-stock product becomes available again. Feeds into Meridian's
-- future subscription/notification system.

create table if not exists inventory_notifications (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now(),
  notified_at timestamptz,
  unique (product_id, email)
);

create index if not exists idx_inv_notif_product on inventory_notifications(product_id);
create index if not exists idx_inv_notif_pending on inventory_notifications(notified_at) where notified_at is null;

-- RLS: anyone can insert (it's a notification signup, no PII reveal)
-- Only service role can read/update
alter table inventory_notifications enable row level security;

drop policy if exists "Anyone can subscribe to notifications" on inventory_notifications;
create policy "Anyone can subscribe to notifications"
  on inventory_notifications for insert
  with check (true);
