-- ============================================================================
-- SEED DATA FOR TESTING & DEMO
-- ============================================================================
-- This file provides realistic sample data to test the inventory system
-- Execute after schema.sql and functions.sql, but BEFORE policies.sql if possible
-- or ensure you have an admin profile set up first

-- Sample products
insert into public.products(name, sku, description, unit_price, stock, min_stock, active)
values
  ('Laptop Pro 16"', 'SKU-LAPTOP-001', 'High-performance laptop', 1299.99, 5, 2, true),
  ('USB-C Cable', 'SKU-USB-001', 'Durable 2m cable', 9.99, 50, 10, true),
  ('Wireless Mouse', 'SKU-MOUSE-001', 'Ergonomic 2.4GHz', 24.99, 0, 5, true),
  ('Mechanical Keyboard', 'SKU-KB-001', 'RGB LED backlit', 89.99, 3, 2, true),
  ('Monitor 4K 27"', 'SKU-MON-001', 'Ultra HD resolution', 399.99, 8, 1, true)
on conflict (sku) do nothing;

-- Sample suppliers
insert into public.suppliers(name, email, phone, address, city, postal_code, country, active)
values
  ('TechCorp Industries', 'contact@techcorp.com', '+1-555-0101', '123 Tech Avenue', 'San Jose', '95110', 'USA', true),
  ('Global Electronics Ltd', 'sales@gelec.com', '+44-20-7946-0958', '45 Oxford Street', 'London', 'W1D 1BS', 'UK', true),
  ('Asia Supply Chain Co', 'procurement@asiasc.cn', '+86-10-1234-5678', 'Beijing Tech Park', 'Beijing', '100000', 'China', true)
on conflict do nothing;

-- Sample customers
insert into public.customers(name, email, phone, address, city, postal_code, country, active)
values
  ('Acme Corp', 'orders@acmecorp.com', '+1-555-0201', '789 Business Blvd', 'New York', '10001', 'USA', true),
  ('Creative Studio Inc', 'hello@creativestudio.com', '+1-555-0202', '456 Design Lane', 'Los Angeles', '90001', 'USA', true),
  ('StartUp Hub', 'supply@startuphub.io', '+1-555-0203', '321 Innovation Drive', 'Austin', '78701', 'USA', true)
on conflict do nothing;

-- Sample completed sales
do $$
declare
  v_customer_id uuid;
  v_product_id uuid;
  v_sale_id uuid;
begin
  -- Get first customer and product
  select id into v_customer_id from public.customers limit 1;
  select id into v_product_id from public.products where sku = 'SKU-LAPTOP-001' limit 1;
  
  if v_customer_id is not null and v_product_id is not null then
    -- Create sale
    insert into public.sales(customer_id, status, notes)
    values (v_customer_id, 'COMPLETED', 'Sample completed sale')
    returning id into v_sale_id;
    
    -- Add sale item
    insert into public.sale_items(sale_id, product_id, qty, unit_price)
    values (v_sale_id, v_product_id, 1, 1299.99);
  end if;
end $$;

-- Sample completed purchase
do $$
declare
  v_supplier_id uuid;
  v_product_id uuid;
  v_purchase_id uuid;
begin
  select id into v_supplier_id from public.suppliers limit 1;
  select id into v_product_id from public.products where sku = 'SKU-USB-001' limit 1;
  
  if v_supplier_id is not null and v_product_id is not null then
    insert into public.purchases(supplier_id, status, notes)
    values (v_supplier_id, 'RECEIVED', 'Sample received shipment')
    returning id into v_purchase_id;
    
    insert into public.purchase_items(purchase_id, product_id, qty, unit_price)
    values (v_purchase_id, v_product_id, 100, 5.00);
  end if;
end $$;

-- Verify data loaded
select 'Products loaded:' as msg, count(*) as count from public.products
union all
select 'Suppliers loaded:', count(*) from public.suppliers
union all
select 'Customers loaded:', count(*) from public.customers
union all
select 'Sales created:', count(*) from public.sales
union all
select 'Stock movements:', count(*) from public.stock_movements;
