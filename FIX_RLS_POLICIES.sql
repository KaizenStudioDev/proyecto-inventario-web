-- Fix RLS Policies for Sales and Purchases Tables
-- Run this in Supabase SQL Editor

-- 1. Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated users to insert sales" ON sales;
DROP POLICY IF EXISTS "Allow authenticated users to view sales" ON sales;
DROP POLICY IF EXISTS "Allow authenticated users to insert purchases" ON purchases;
DROP POLICY IF EXISTS "Allow authenticated users to view purchases" ON purchases;
DROP POLICY IF EXISTS "Allow authenticated users to insert sale_items" ON sale_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert purchase_items" ON purchase_items;

-- 2. Enable RLS on tables (if not already enabled)
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;

-- 3. Create permissive policies for authenticated users
-- SALES TABLE
CREATE POLICY "Allow authenticated users to insert sales"
ON sales FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select sales"
ON sales FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update sales"
ON sales FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete sales"
ON sales FOR DELETE
TO authenticated
USING (true);

-- PURCHASES TABLE
CREATE POLICY "Allow authenticated users to insert purchases"
ON purchases FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select purchases"
ON purchases FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update purchases"
ON purchases FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete purchases"
ON purchases FOR DELETE
TO authenticated
USING (true);

-- SALE_ITEMS TABLE
CREATE POLICY "Allow authenticated users to insert sale_items"
ON sale_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select sale_items"
ON sale_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update sale_items"
ON sale_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete sale_items"
ON sale_items FOR DELETE
TO authenticated
USING (true);

-- PURCHASE_ITEMS TABLE
CREATE POLICY "Allow authenticated users to insert purchase_items"
ON purchase_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select purchase_items"
ON purchase_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update purchase_items"
ON purchase_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete purchase_items"
ON purchase_items FOR DELETE
TO authenticated
USING (true);
