-- ============================================================
-- RLS Policies for the existing orders table (PeptidePure storefront)
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Step 1: Check if RLS is already enabled (run this first)
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'orders';

-- Step 2: Enable RLS (safe to run even if already enabled)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Step 3: Check existing policies (run this to see what's already there)
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'orders';

-- Step 4: Add policies for storefront access
-- If policies already exist with the same names, drop them first:
-- DROP POLICY IF EXISTS "Users can view own orders" ON orders;
-- DROP POLICY IF EXISTS "Users can create own orders" ON orders;

-- Allow users to view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = patient_id);

-- Allow users to insert their own orders
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- ============================================================
-- IMPORTANT: The profiles table must have a row for the user.
-- If your user can sign up but has no profile row, orders won't
-- be insertable due to the FK constraint (patient_id -> profiles.id).
--
-- To auto-create profiles on sign up, use this trigger:
-- ============================================================

-- Create a function that inserts a profile row on auth.users insert
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

-- Drop the trigger if it already exists, then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- If you already have users without profile rows, backfill them:
-- ============================================================
-- INSERT INTO public.profiles (id, full_name, role)
-- SELECT id, COALESCE(raw_user_meta_data->>'full_name', ''), 'patient'
-- FROM auth.users
-- WHERE id NOT IN (SELECT id FROM public.profiles)
-- ON CONFLICT (id) DO NOTHING;
