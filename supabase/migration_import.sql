-- ============================================================================
-- MIGRATION: MySQL to Supabase
-- Script para importar datos de MySQL a Postgres (Supabase)
-- IMPORTANTE: Ejecutar en este orden:
-- 1. Disable RLS policies (temporarily)
-- 2. Disable triggers
-- 3. Import data with UUID mapping
-- 4. Re-enable triggers
-- 5. Re-enable RLS policies
-- ============================================================================

-- STEP 1: Temporarily disable RLS policies
ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log DISABLE ROW LEVEL SECURITY;

-- STEP 2: Clear existing data
TRUNCATE public.sale_items CASCADE;
TRUNCATE public.sales CASCADE;
TRUNCATE public.purchase_items CASCADE;
TRUNCATE public.purchases CASCADE;
TRUNCATE public.stock_movements CASCADE;
TRUNCATE public.audit_log CASCADE;
TRUNCATE public.products CASCADE;
TRUNCATE public.customers CASCADE;
TRUNCATE public.suppliers CASCADE;

-- STEP 4: Insert Suppliers (with new UUIDs)
INSERT INTO public.suppliers (name, phone, email, address, active)
VALUES
    ('Distribuciones ABC', '3112223333', 'ana.torres@abc.com', 'Bogotá, Colombia', true),
    ('ProveeTech', '3114445555', 'luis@proveetech.com', 'Medellín, Colombia', true),
    ('TecnoImport S.A.S', '3205567890', 'contacto@tecnoimport.com', 'Cali, Colombia', true),
    ('ElectroAndes LTDA', '3217788990', 'ventas@electroandes.com', 'Barranquilla, Colombia', true),
    ('RedCom Distribuciones', '3106654433', 'sergio@redcom.co', 'Bogotá, Colombia', true),
    ('Infinity Tech Colombia', '3128004455', 'diana.paez@infinitytech.co', 'Bogotá, Colombia', true);

-- STEP 5: Insert Customers (with new UUIDs)
INSERT INTO public.customers (name, phone, email, address, active)
VALUES
    ('Juan Pérez', '3001112222', 'juan.perez@example.com', 'Calle 1 #10-20, Bogotá', true),
    ('María Gómez', '3003334444', 'maria.gomez@example.com', 'Calle 2 #15-30, Bogotá', true),
    ('Carlos Ruiz', '3005556666', 'carlos.ruiz@example.com', 'Calle 3 #5-10, Bogotá', true),
    ('Laura Restrepo', '3024458899', 'laura.restrepo@gmail.com', 'Cra 45 # 120-30, Bogotá', true),
    ('Andrés Cárdenas', '3157789901', 'andres.cardenas@yahoo.com', 'Av Caracas # 50-12, Bogotá', true),
    ('Sofía Hernández', '3115698741', 'sofia.hdz@hotmail.com', 'Cl 80 # 25-60, Medellín', true),
    ('Julián Ramírez', '3009987412', 'julian.ramirez@outlook.com', 'Cll 30 # 18-55, Cali', true),
    ('Valentina Torres', '3167841223', 'valentina.torres@gmail.com', 'Cra 7 # 98-20, Bogotá', true);

-- STEP 6: Insert Products (with new UUIDs)
INSERT INTO public.products (name, sku, description, unit_price, stock, min_stock, active)
VALUES
    ('Laptop Modelo A', 'SKU_LAPTOP_001', 'Laptop high-performance', 3000000, 30, 1, true),
    ('Mouse Óptico', 'SKU_MOUSE_001', 'Optical mouse', 300000, 100, 1, true),
    ('Teclado Mecánico', 'SKU_KEYBOARD_001', 'Mechanical keyboard', 400000, 200, 1, true),
    ('Monitor 24"', 'SKU_MONITOR_001', '24-inch monitor', 1500000, 100, 1, true),
    ('Impresora HP DeskJet 2700', 'SKU_PRINTER_001', 'HP inkjet printer', 450000, 25, 2, true),
    ('Audífonos Bluetooth Xiaomi', 'SKU_HEADPHONES_001', 'Bluetooth headphones', 120000, 80, 5, true),
    ('Disco SSD Kingston 480GB', 'SKU_SSD_001', 'Kingston SSD 480GB', 210000, 50, 3, true),
    ('Router TP-Link AC1200', 'SKU_ROUTER_001', 'WiFi router AC1200', 180000, 40, 2, true),
    ('Memoria USB 32GB SanDisk', 'SKU_USB_001', '32GB USB flash drive', 35000, 200, 10, true),
    ('Silla Gamer Reclinable', 'SKU_CHAIR_001', 'Gaming chair reclining', 550000, 10, 1, true),
    ('Cable HDMI 2.0 2m', 'SKU_HDMI_001', 'HDMI 2.0 cable 2m', 20000, 150, 10, true),
    ('Monitor LG 27" IPS 75Hz', 'SKU_MONITOR_LG', 'LG 27-inch IPS monitor', 850000, 40, 2, true),
    ('Portátil HP Ryzen 5 8GB 512GB', 'SKU_LAPTOP_HP', 'HP laptop Ryzen 5', 2100000, 15, 1, true),
    ('Tarjeta Gráfica RTX 3060 12GB', 'SKU_GPU_RTX3060', 'RTX 3060 graphics card', 1900000, 12, 1, true),
    ('Teclado Gamer Redragon Kumara', 'SKU_KBD_REDRAGON', 'Redragon gaming keyboard', 160000, 120, 5, true),
    ('Audífonos Gamer HyperX Stinger', 'SKU_HP_HYPERX', 'HyperX gaming headset', 250000, 50, 3, true),
    ('Silla Gamer Azul-Negro', 'SKU_CHAIR_BLUE', 'Gaming chair blue-black', 550000, 12, 1, true),
    ('Control PS5 DualSense', 'SKU_PS5_CONTROLLER', 'PlayStation 5 controller', 350000, 15, 3, true),
    ('Freidora de Aire 4L', 'SKU_AIRFRYER', 'Air fryer 4L capacity', 240000, 18, 1, true),
    ('Taladro Black+Decker 550W', 'SKU_DRILL_BD', 'Black+Decker drill 550W', 200000, 25, 2, true);

-- STEP 7: Re-enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- STEP 8: Verification queries
SELECT 'Suppliers' as table_name, COUNT(*) as total FROM public.suppliers
UNION ALL
SELECT 'Customers', COUNT(*) FROM public.customers
UNION ALL
SELECT 'Products', COUNT(*) FROM public.products
UNION ALL
SELECT 'Purchases', COUNT(*) FROM public.purchases
UNION ALL
SELECT 'Sales', COUNT(*) FROM public.sales;
