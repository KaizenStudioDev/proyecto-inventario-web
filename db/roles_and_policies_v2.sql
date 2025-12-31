-- Roles & RLS hardening for Inventory app (Simplified version)
-- Run in Supabase SQL editor (public schema)

-----------------------------
-- 0) Add columns to profiles (drop and recreate constraints)
-----------------------------
-- Drop existing role constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add or update role column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'tester';

-- Update any NULL or invalid role values to 'tester'
UPDATE public.profiles 
SET role = 'tester' 
WHERE role IS NULL OR role NOT IN ('admin', 'vendedor', 'contabilidad', 'tester');

-- Add check constraint for role values
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'vendedor', 'contabilidad', 'tester'));

-- Add is_test_user column if missing
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_test_user BOOLEAN DEFAULT FALSE;

-----------------------------
-- 1) Enable RLS on all tables
-----------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-----------------------------
-- 2) Helper: Get user role
-----------------------------
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE((SELECT role FROM public.profiles WHERE user_id = auth.uid()), 'tester')
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_test_user_func()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT is_test_user FROM public.profiles WHERE user_id = auth.uid()), FALSE)
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-----------------------------
-- 3) PRODUCTS Policies
-----------------------------
DROP POLICY IF EXISTS products_select ON public.products;
DROP POLICY IF EXISTS products_insert_admin ON public.products;
DROP POLICY IF EXISTS products_insert_tester ON public.products;
DROP POLICY IF EXISTS products_update_admin ON public.products;
DROP POLICY IF EXISTS products_update_tester ON public.products;
DROP POLICY IF EXISTS products_delete_admin ON public.products;

CREATE POLICY products_select ON public.products
  FOR SELECT 
  USING (get_user_role() IN ('admin', 'vendedor', 'contabilidad', 'tester'));

CREATE POLICY products_insert_admin ON public.products
  FOR INSERT 
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY products_insert_tester ON public.products
  FOR INSERT 
  WITH CHECK (get_user_role() = 'tester' AND NOT is_test_user_func());

CREATE POLICY products_update_admin ON public.products
  FOR UPDATE 
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY products_update_tester ON public.products
  FOR UPDATE 
  USING (get_user_role() = 'tester' AND NOT is_test_user_func())
  WITH CHECK (get_user_role() = 'tester' AND NOT is_test_user_func());

CREATE POLICY products_delete_admin ON public.products
  FOR DELETE 
  USING (get_user_role() = 'admin');

-----------------------------
-- 4) CUSTOMERS Policies
-----------------------------
DROP POLICY IF EXISTS customers_select ON public.customers;
DROP POLICY IF EXISTS customers_insert_admin ON public.customers;
DROP POLICY IF EXISTS customers_insert_tester ON public.customers;
DROP POLICY IF EXISTS customers_update_admin ON public.customers;
DROP POLICY IF EXISTS customers_update_tester ON public.customers;
DROP POLICY IF EXISTS customers_delete_admin ON public.customers;

CREATE POLICY customers_select ON public.customers
  FOR SELECT 
  USING (get_user_role() IN ('admin', 'vendedor', 'contabilidad', 'tester'));

CREATE POLICY customers_insert_admin ON public.customers
  FOR INSERT 
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY customers_insert_tester ON public.customers
  FOR INSERT 
  WITH CHECK (get_user_role() = 'tester' AND NOT is_test_user_func());

CREATE POLICY customers_update_admin ON public.customers
  FOR UPDATE 
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY customers_update_tester ON public.customers
  FOR UPDATE 
  USING (get_user_role() = 'tester' AND NOT is_test_user_func())
  WITH CHECK (get_user_role() = 'tester' AND NOT is_test_user_func());

CREATE POLICY customers_delete_admin ON public.customers
  FOR DELETE 
  USING (get_user_role() = 'admin');

-----------------------------
-- 5) SUPPLIERS Policies
-----------------------------
DROP POLICY IF EXISTS suppliers_select ON public.suppliers;
DROP POLICY IF EXISTS suppliers_insert_admin ON public.suppliers;
DROP POLICY IF EXISTS suppliers_insert_tester ON public.suppliers;
DROP POLICY IF EXISTS suppliers_update_admin ON public.suppliers;
DROP POLICY IF EXISTS suppliers_update_tester ON public.suppliers;
DROP POLICY IF EXISTS suppliers_delete_admin ON public.suppliers;

CREATE POLICY suppliers_select ON public.suppliers
  FOR SELECT 
  USING (get_user_role() IN ('admin', 'contabilidad', 'tester', 'vendedor'));

CREATE POLICY suppliers_insert_admin ON public.suppliers
  FOR INSERT 
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY suppliers_insert_tester ON public.suppliers
  FOR INSERT 
  WITH CHECK (get_user_role() = 'tester' AND NOT is_test_user_func());

CREATE POLICY suppliers_update_admin ON public.suppliers
  FOR UPDATE 
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY suppliers_update_tester ON public.suppliers
  FOR UPDATE 
  USING (get_user_role() = 'tester' AND NOT is_test_user_func())
  WITH CHECK (get_user_role() = 'tester' AND NOT is_test_user_func());

CREATE POLICY suppliers_delete_admin ON public.suppliers
  FOR DELETE 
  USING (get_user_role() = 'admin');

-----------------------------
-- 6) SALES Policies
-----------------------------
DROP POLICY IF EXISTS sales_select ON public.sales;
DROP POLICY IF EXISTS sales_insert ON public.sales;
DROP POLICY IF EXISTS sales_update_admin ON public.sales;
DROP POLICY IF EXISTS sales_delete_admin ON public.sales;

CREATE POLICY sales_select ON public.sales
  FOR SELECT 
  USING (get_user_role() IN ('admin', 'vendedor', 'contabilidad', 'tester'));

CREATE POLICY sales_insert ON public.sales
  FOR INSERT 
  WITH CHECK (get_user_role() IN ('admin', 'vendedor', 'tester') AND NOT is_test_user_func());

CREATE POLICY sales_update_admin ON public.sales
  FOR UPDATE 
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY sales_delete_admin ON public.sales
  FOR DELETE 
  USING (get_user_role() = 'admin');

-----------------------------
-- 7) PURCHASES Policies
-----------------------------
DROP POLICY IF EXISTS purchases_select ON public.purchases;
DROP POLICY IF EXISTS purchases_insert ON public.purchases;
DROP POLICY IF EXISTS purchases_update_admin ON public.purchases;
DROP POLICY IF EXISTS purchases_delete_admin ON public.purchases;

CREATE POLICY purchases_select ON public.purchases
  FOR SELECT 
  USING (get_user_role() IN ('admin', 'contabilidad', 'tester'));

CREATE POLICY purchases_insert ON public.purchases
  FOR INSERT 
  WITH CHECK (get_user_role() IN ('admin', 'tester') AND NOT is_test_user_func());

CREATE POLICY purchases_update_admin ON public.purchases
  FOR UPDATE 
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY purchases_delete_admin ON public.purchases
  FOR DELETE 
  USING (get_user_role() = 'admin');

-----------------------------
-- 8) STOCK_MOVEMENTS Policies
-----------------------------
DROP POLICY IF EXISTS stock_movements_select ON public.stock_movements;
DROP POLICY IF EXISTS stock_movements_insert ON public.stock_movements;
DROP POLICY IF EXISTS stock_movements_delete_admin ON public.stock_movements;

CREATE POLICY stock_movements_select ON public.stock_movements
  FOR SELECT 
  USING (get_user_role() IN ('admin', 'vendedor', 'contabilidad', 'tester'));

CREATE POLICY stock_movements_insert ON public.stock_movements
  FOR INSERT 
  WITH CHECK (get_user_role() IN ('admin', 'tester') AND NOT is_test_user_func());

CREATE POLICY stock_movements_delete_admin ON public.stock_movements
  FOR DELETE 
  USING (get_user_role() = 'admin');

-----------------------------
-- 9) PROFILES Policies
-----------------------------
DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
DROP POLICY IF EXISTS profiles_update_self ON public.profiles;

CREATE POLICY profiles_select_self ON public.profiles
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY profiles_update_self ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = user_id AND NOT is_test_user)
  WITH CHECK (auth.uid() = user_id AND NOT is_test_user);

-----------------------------
-- 10) Seed test accounts
-----------------------------
INSERT INTO public.profiles (user_id, role, is_test_user, full_name, avatar_url)
VALUES
  ('ebc9cb8a-d045-4c1d-b367-8d634a99aac9', 'contabilidad', TRUE,  'Contabilidad Demo', NULL),
  ('fe1a3b9e-f55c-4ff1-b8e0-91a801b6c68e', 'tester',       FALSE, 'Tester Demo',       NULL),
  ('957f599a-795a-4de8-837b-7747194cde0a', 'admin',        FALSE, 'Tomás Escobar',     NULL),
  ('e2362388-4aed-4b72-a3c8-1891c87feb4d', 'vendedor',     TRUE,  'Vendedor Demo',     NULL)
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  is_test_user = EXCLUDED.is_test_user,
  full_name = EXCLUDED.full_name;

-----------------------------
-- Done! Notes for frontend:
-----------------------------
-- Use profile.role to control UI:
-- - Admin: all actions visible
-- - Vendedor: hide purchases/users; show sales
-- - Contabilidad: read-only (hide create/edit/delete)
-- - Tester: hide delete buttons, allow create/update
-- Use profile.is_test_user to disable profile edit form
