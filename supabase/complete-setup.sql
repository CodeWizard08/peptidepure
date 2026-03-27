-- ============================================================
-- PEPTIDEPURE — COMPLETE SUPABASE SETUP
-- Paste this entire file into Supabase SQL Editor and run once.
-- It is safe to re-run: uses IF NOT EXISTS and DROP IF EXISTS.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES  (linked 1-to-1 with auth.users)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     text NOT NULL DEFAULT '',
  role          text NOT NULL DEFAULT 'patient',
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'patient'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing users who have no profile row yet
INSERT INTO public.profiles (id, full_name, role)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', ''), 'patient'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 2. PRODUCTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id                      uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name                    text NOT NULL,
  slug                    text NOT NULL UNIQUE,
  description             text,
  long_description        text,
  category                text NOT NULL DEFAULT '',
  subcategory             text,
  price_cents             integer NOT NULL DEFAULT 0,
  image_url               text,
  sku                     text,
  requires_prescription   boolean NOT NULL DEFAULT false,
  requires_consultation   boolean NOT NULL DEFAULT false,
  is_active               boolean NOT NULL DEFAULT true,
  sort_order              integer NOT NULL DEFAULT 0,
  stock_quantity          integer,
  metadata                jsonb,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

-- Add any missing columns to an existing table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS long_description        text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku                     text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS requires_prescription   boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS requires_consultation   boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity          integer;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS metadata               jsonb;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Admins can manage products"      ON products;
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_products_slug     ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(is_active, sort_order);

-- Low-stock monitoring view
CREATE OR REPLACE VIEW low_stock_products AS
  SELECT id, name, slug, stock_quantity
  FROM products
  WHERE is_active = true
    AND stock_quantity IS NOT NULL
    AND stock_quantity < 10
  ORDER BY stock_quantity ASC;

-- Decrement stock atomically (called after a successful payment)
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id uuid, p_quantity integer)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock_quantity = GREATEST(0, stock_quantity - p_quantity)
  WHERE id = p_product_id
    AND stock_quantity IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────
-- 3. ORDERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id        uuid REFERENCES public.profiles(id),
  order_type        text NOT NULL DEFAULT 'supplement',
  status            text NOT NULL DEFAULT 'pending',
  payment_method    text DEFAULT 'invoice',
  transaction_id    text,                    -- Authorize.net transaction ID
  stripe_session_id text,                    -- legacy (unused, kept for safety)
  items             jsonb NOT NULL DEFAULT '[]',
  subtotal_cents    integer NOT NULL DEFAULT 0,
  discount_cents    integer NOT NULL DEFAULT 0,
  total_cents       integer NOT NULL DEFAULT 0,
  shipping_address  jsonb,
  tracking_number   text,
  patient_notes     text,
  clinician_notes   text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- Add any missing columns to an existing table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method    text DEFAULT 'invoice';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS transaction_id    text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_session_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number   text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS patient_notes     text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS clinician_notes   text;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders"   ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
CREATE POLICY "Users can view own orders"   ON orders FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT  WITH CHECK (auth.uid() = patient_id);

CREATE INDEX IF NOT EXISTS idx_orders_patient    ON orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 4. FORM SUBMISSIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type      text NOT NULL,
  data           jsonb NOT NULL DEFAULT '{}',
  submitted_by   uuid REFERENCES auth.users(id),
  provider_email text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- Ensure the check constraint includes ALL six form types
ALTER TABLE public.form_submissions
  DROP CONSTRAINT IF EXISTS form_submissions_form_type_check;
ALTER TABLE public.form_submissions
  ADD CONSTRAINT form_submissions_form_type_check
  CHECK (form_type IN ('baseline', 'treatment-log', 'ae-sae-report', 'outcomes', 'contact', 'soap_capture'));

CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON form_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user ON form_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_form_submissions_date ON form_submissions(created_at DESC);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit forms"       ON form_submissions;
DROP POLICY IF EXISTS "Users can view own submissions" ON form_submissions;
CREATE POLICY "Anyone can submit forms"        ON form_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own submissions" ON form_submissions FOR SELECT USING (auth.uid() = submitted_by);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_form_submissions_updated_at()
RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS form_submissions_updated_at ON form_submissions;
CREATE TRIGGER form_submissions_updated_at
  BEFORE UPDATE ON form_submissions
  FOR EACH ROW EXECUTE FUNCTION update_form_submissions_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 5. STORAGE — licenses bucket
--    (Supabase UI: Storage → New bucket → "licenses", Private)
--    Then run these policies:
-- ─────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('licenses', 'licenses', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload own license"    ON storage.objects;
DROP POLICY IF EXISTS "Users read own license"      ON storage.objects;
DROP POLICY IF EXISTS "Service role manages licenses" ON storage.objects;

CREATE POLICY "Users upload own license" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'licenses'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users read own license" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'licenses'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
