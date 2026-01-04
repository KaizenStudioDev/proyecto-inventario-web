# Database Migrations Required

## IMPORTANT: Execute these migrations in Supabase SQL Editor

Your Supabase database is missing some columns and tables that the application needs. Follow these steps in order:

### Step 1: Add Product Category and Supplier Fields
Run this in Supabase SQL Editor:
```sql
-- File: supabase/migrations/01_add_product_category_supplier.sql

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
```

### Step 2: Create Product Movements Table
Run this in Supabase SQL Editor (after Step 1):
```sql
-- File: supabase/migrations/02_create_product_movements.sql
-- See full content in: supabase/migrations/02_create_product_movements.sql

CREATE TABLE IF NOT EXISTS public.product_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'initial', 'return', 'damage')),
  quantity integer NOT NULL CHECK (quantity != 0),
  stock_before integer NOT NULL CHECK (stock_before >= 0),
  stock_after integer NOT NULL CHECK (stock_after >= 0),
  reference_type text CHECK (reference_type IN ('sale', 'purchase', 'manual')),
  reference_id uuid,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Plus indexes, RLS policies, triggers...
-- See complete SQL in supabase/migrations/02_create_product_movements.sql
```

### Step 3: Verify Migration
After running both migrations, verify in Supabase Table Editor:
1. **products** table should have: `category`, `supplier_id` columns
2. **product_movements** table should exist with all columns
3. Test adding a product - should auto-create movement record

## What These Migrations Enable

✅ **Product Category** - Classify products (Electronics, Office, etc.)
✅ **Product Supplier** - Link products to their primary supplier
✅ **Movement Tracking** - Complete audit trail of all stock changes
✅ **Stock Charts** - Visual graphs of inventory over time
✅ **Reports** - Detailed analytics and CSV exports

## Without These Migrations

❌ Product detail modal won't show supplier
❌ Stock charts will be empty
❌ Movement history won't track changes
❌ Some reports may fail

## Files Location
- Migration 1: `supabase/migrations/01_add_product_category_supplier.sql`
- Migration 2: `supabase/migrations/02_create_product_movements.sql`
