-- Complete RLS Policy Fix for All Transaction Tables
-- Run this in Supabase SQL Editor

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Allow authenticated users to insert sales" ON sales;
DROP POLICY IF EXISTS "Allow authenticated users to select sales" ON sales;
DROP POLICY IF EXISTS "Allow authenticated users to update sales" ON sales;
DROP POLICY IF EXISTS "Allow authenticated users to delete sales" ON sales;
DROP POLICY IF EXISTS "Allow authenticated users to insert purchases" ON purchases;
DROP POLICY IF EXISTS "Allow authenticated users to select purchases" ON purchases;
DROP POLICY IF EXISTS "Allow authenticated users to update purchases" ON purchases;
DROP POLICY IF EXISTS "Allow authenticated users to delete purchases" ON purchases;
DROP POLICY IF EXISTS "Allow authenticated users to insert sale_items" ON sale_items;
DROP POLICY IF EXISTS "Allow authenticated users to select sale_items" ON sale_items;
DROP POLICY IF EXISTS "Allow authenticated users to update sale_items" ON sale_items;
DROP POLICY IF EXISTS "Allow authenticated users to delete sale_items" ON sale_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert purchase_items" ON purchase_items;
DROP POLICY IF EXISTS "Allow authenticated users to select purchase_items" ON purchase_items;
DROP POLICY IF EXISTS "Allow authenticated users to update purchase_items" ON purchase_items;
DROP POLICY IF EXISTS "Allow authenticated users to delete purchase_items" ON purchase_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert stock_movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to select stock_movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to update stock_movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to delete stock_movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to select products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;

-- Enable RLS on all tables
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for authenticated users (no restrictions)
-- This allows any authenticated user to perform all operations

-- SALES TABLE
CREATE POLICY "Allow authenticated insert/select/update sales"
ON sales FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated select sales"
ON sales FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated update sales"
ON sales FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete sales"
ON sales FOR DELETE
TO authenticated
USING (true);

-- PURCHASES TABLE
CREATE POLICY "Allow authenticated insert purchases"
ON purchases FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated select purchases"
ON purchases FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated update purchases"
ON purchases FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete purchases"
ON purchases FOR DELETE
TO authenticated
USING (true);

-- SALE_ITEMS TABLE
CREATE POLICY "Allow authenticated insert sale_items"
ON sale_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated select sale_items"
ON sale_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated update sale_items"
ON sale_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete sale_items"
ON sale_items FOR DELETE
TO authenticated
USING (true);

-- PURCHASE_ITEMS TABLE
CREATE POLICY "Allow authenticated insert purchase_items"
ON purchase_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated select purchase_items"
ON purchase_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated update purchase_items"
ON purchase_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete purchase_items"
ON purchase_items FOR DELETE
TO authenticated
USING (true);

-- STOCK_MOVEMENTS TABLE (This is the one causing the error!)
CREATE POLICY "Allow authenticated insert stock_movements"
ON stock_movements FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated select stock_movements"
ON stock_movements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated update stock_movements"
ON stock_movements FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete stock_movements"
ON stock_movements FOR DELETE
TO authenticated
USING (true);

-- PRODUCTS TABLE
CREATE POLICY "Allow authenticated select products"
ON products FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update products"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- CUSTOMERS TABLE
CREATE POLICY "Allow authenticated select customers"
ON customers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert customers"
ON customers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update customers"
ON customers FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- SUPPLIERS TABLE
CREATE POLICY "Allow authenticated select suppliers"
ON suppliers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert suppliers"
ON suppliers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update suppliers"
ON suppliers FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
