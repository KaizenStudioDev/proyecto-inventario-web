-- Migration: Create product_movements table for inventory tracking
-- Date: 2026-01-04
-- Description: Track all stock changes (purchases, sales, adjustments) for complete audit trail

-- Create product_movements table
CREATE TABLE IF NOT EXISTS public.product_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'initial', 'return')),
  quantity integer NOT NULL CHECK (quantity != 0),
  stock_before integer NOT NULL CHECK (stock_before >= 0),
  stock_after integer NOT NULL CHECK (stock_after >= 0),
  reference_type text CHECK (reference_type IN ('sale', 'purchase', 'manual')),
  reference_id uuid,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_movements_product ON public.product_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_type ON public.product_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_movements_created ON public.product_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movements_reference ON public.product_movements(reference_type, reference_id);

-- Add table and column comments
COMMENT ON TABLE public.product_movements IS 'Audit trail of all product stock changes';
COMMENT ON COLUMN public.product_movements.movement_type IS 'Type: purchase (stock in), sale (stock out), adjustment (manual), initial (first stock), return (reversal)';
COMMENT ON COLUMN public.product_movements.quantity IS 'Change amount: positive for stock in, negative for stock out';
COMMENT ON COLUMN public.product_movements.stock_before IS 'Stock level before this movement';
COMMENT ON COLUMN public.product_movements.stock_after IS 'Stock level after this movement';
COMMENT ON COLUMN public.product_movements.reference_type IS 'Source document type (sale, purchase, manual)';
COMMENT ON COLUMN public.product_movements.reference_id IS 'Source document ID (sale_id, purchase_id, etc.)';

-- RLS Policies for product_movements
ALTER TABLE public.product_movements ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read movements
CREATE POLICY "Allow authenticated users to read movements" 
  ON public.product_movements FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow admin to insert movements
CREATE POLICY "Allow admin to insert movements" 
  ON public.product_movements FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically create movement when product stock changes
CREATE OR REPLACE FUNCTION public.track_product_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if stock actually changed
  IF OLD.stock IS DISTINCT FROM NEW.stock THEN
    INSERT INTO public.product_movements (
      product_id,
      movement_type,
      quantity,
      stock_before,
      stock_after,
      reference_type,
      notes,
      created_by
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.stock > OLD.stock THEN 'adjustment'
        WHEN NEW.stock < OLD.stock THEN 'adjustment'
        ELSE 'adjustment'
      END,
      NEW.stock - OLD.stock,
      OLD.stock,
      NEW.stock,
      'manual',
      'Stock updated via product edit',
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to track stock changes on product updates
DROP TRIGGER IF EXISTS trigger_track_stock_change ON public.products;
CREATE TRIGGER trigger_track_stock_change
  AFTER UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.track_product_stock_change();

-- Function to record initial stock on product creation
CREATE OR REPLACE FUNCTION public.track_initial_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Only if stock > 0
  IF NEW.stock > 0 THEN
    INSERT INTO public.product_movements (
      product_id,
      movement_type,
      quantity,
      stock_before,
      stock_after,
      reference_type,
      notes,
      created_by
    ) VALUES (
      NEW.id,
      'initial',
      NEW.stock,
      0,
      NEW.stock,
      'manual',
      'Initial stock on product creation',
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to track initial stock on product creation
DROP TRIGGER IF EXISTS trigger_initial_stock ON public.products;
CREATE TRIGGER trigger_initial_stock
  AFTER INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.track_initial_stock();
