-- Migration: Add category and supplier_id to products table
-- Execute this in Supabase SQL Editor

-- Add category column to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category text;

-- Add supplier_id column with foreign key to suppliers
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- Create index for category searches
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Create index for supplier lookups
CREATE INDEX IF NOT EXISTS idx_products_supplier ON public.products(supplier_id);

-- Add comments for documentation
COMMENT ON COLUMN public.products.category IS 'Product classification/category (e.g., Electronics, Office, Hardware)';
COMMENT ON COLUMN public.products.supplier_id IS 'Primary supplier for this product (optional)';
