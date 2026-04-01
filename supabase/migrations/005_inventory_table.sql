-- Create live inventory table
-- Run this in the Supabase SQL Editor

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  product text not null,
  dose text not null,
  stock integer not null default 0,
  status text not null default 'ok',
  notes text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint inventory_status_check check (status in ('ok', 'low', 'order', 'out'))
);

-- RLS: authenticated clinicians can read
alter table inventory enable row level security;

create policy "Authenticated users can read inventory"
  on inventory for select
  to authenticated
  using (true);

-- Auto-update updated_at on row change
create or replace function update_inventory_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger inventory_updated_at
  before update on inventory
  for each row execute function update_inventory_updated_at();

-- Enable real-time for this table
-- (run this separately if the publication already exists)
alter publication supabase_realtime add table inventory;

-- Seed with current inventory data
insert into inventory (product, dose, stock, status, notes, sort_order) values
  ('AOD',                         '5mg',        59,  'ok',    null,                           0),
  ('ARA-290',                     '10mg',        114, 'ok',    null,                           1),
  ('Botox',                       '100mg',       30,  'ok',    null,                           2),
  ('BPC-157',                     '10mg',        118, 'ok',    null,                           3),
  ('BPC-157/TB500 (Wolverine)',   '20mg Total',  94,  'ok',    '10 kits on order',             4),
  ('Cerebrolysin',                '60mg',        0,   'out',   null,                           5),
  ('CJC/Ipamorelin',              '5/5mg',       199, 'ok',    null,                           6),
  ('DSIP',                        '10mg',        9,   'order', '8 kits on order',              7),
  ('Epithalon',                   '10mg',        30,  'ok',    null,                           8),
  ('Epithalon',                   '50mg',        61,  'ok',    null,                           9),
  ('GHK-Cu',                      '50mg',        37,  'ok',    '6 kits on order',              10),
  ('GHK-Cu',                      '100mg',       31,  'ok',    null,                           11),
  ('GLOW',                        '70mg Total',  100, 'ok',    null,                           12),
  ('Glutathione',                 '600mg',       30,  'ok',    null,                           13),
  ('Glutathione',                 '1500mg',      0,   'out',   '6 kits on order',              14),
  ('HGH',                         '10 IU',       16,  'low',   null,                           15),
  ('HGH',                         '15 IU',       50,  'ok',    null,                           16),
  ('HCG',                         '10000 IU',    96,  'ok',    null,                           17),
  ('IGF-LR3',                     '1mg',         20,  'low',   null,                           18),
  ('Kisspeptin',                  '10mg',        0,   'out',   'New SKU — 5 kits on order',    19),
  ('KLOW',                        '80mg',        0,   'out',   '8 kits on order',              20),
  ('KPV',                         '10mg',        30,  'ok',    null,                           21),
  ('LIPO-C+',                     '10mL',        0,   'out',   '8 kits on order',              22),
  ('MGF',                         '5mg',         0,   'out',   'New SKU — 5 kits on order',    23),
  ('Mots-C',                      '10mg',        29,  'order', '10 kits on order',             24),
  ('MT-2 (Melanotan)',             '10mg',        68,  'ok',    null,                           25),
  ('NAD+',                        '1000mg',      188, 'ok',    null,                           26),
  ('Oxytocin',                    '50mg',        20,  'low',   null,                           27),
  ('PT-141',                      '10mg',        48,  'ok',    null,                           28),
  ('RETA',                        '10mg',        2,   'order', '10 kits on order',             29),
  ('RETA',                        '15mg',        32,  'ok',    null,                           30),
  ('RETA',                        '20mg',        39,  'ok',    null,                           31),
  ('RETA',                        '30mg',        183, 'ok',    null,                           32),
  ('RETA',                        '60mg',        28,  'ok',    null,                           33),
  ('Selank',                      '10mg',        30,  'ok',    '6 kits on order',              34),
  ('Selank Amidate',              '30mg',        21,  'low',   null,                           35),
  ('Semax',                       '10mg',        4,   'order', '8 kits on order — 4 units remaining', 36),
  ('SNAP8',                       '10mg',        20,  'low',   null,                           37),
  ('SS-31',                       '10mg',        20,  'low',   null,                           38),
  ('Super Human Blend',           '10mL',        20,  'low',   null,                           39),
  ('TB500',                       '10mg',        45,  'ok',    null,                           40),
  ('Tesamorelin',                 '10mg',        50,  'ok',    null,                           41),
  ('Thymosin Alpha-1',            '10mg',        30,  'order', '10 kits on order',             42),
  ('TIRZ',                        '10mg',        45,  'ok',    null,                           43),
  ('TIRZ',                        '15mg',        50,  'ok',    null,                           44),
  ('TIRZ',                        '30mg',        240, 'ok',    null,                           45),
  ('TIRZ',                        '70mg',        39,  'ok',    null,                           46);
