-- ============================================================================
-- VIEWS FOR BUSINESS INSIGHTS
-- ============================================================================

-- Low-stock products alert view
create or replace view public.view_low_stock_products as
select 
  p.id,
  p.name,
  p.sku,
  p.stock,
  p.min_stock,
  p.unit_price,
  case when p.stock <= 0 then 'OUT_OF_STOCK'
       when p.stock <= p.min_stock then 'LOW_STOCK'
       else 'OK' end as stock_status,
  p.updated_at
from public.products p
where p.active = true and p.stock <= p.min_stock
order by p.stock asc;

comment on view public.view_low_stock_products is 'Products with LOW or OUT status for alerts/dashboard';

-- Sales dashboard: summary by date
create or replace view public.view_sales_summary as
select 
  date_trunc('day', s.created_at)::date as sale_date,
  count(*) as total_sales,
  count(distinct s.customer_id) as unique_customers,
  sum(s.total) as total_revenue,
  avg(s.total) as avg_sale_value,
  min(s.created_at) as first_sale_time,
  max(s.created_at) as last_sale_time
from public.sales s
where s.status = 'COMPLETED'
group by date_trunc('day', s.created_at)::date
order by sale_date desc;

comment on view public.view_sales_summary is 'Daily sales metrics for dashboard';

-- Purchase dashboard: summary by supplier
create or replace view public.view_purchase_summary as
select 
  sup.id as supplier_id,
  sup.name as supplier_name,
  count(*) as total_purchases,
  sum(p.total) as total_spent,
  avg(p.total) as avg_purchase_value,
  max(p.created_at) as latest_purchase_date
from public.purchases p
join public.suppliers sup on p.supplier_id = sup.id
where p.status = 'RECEIVED'
group by sup.id, sup.name
order by total_spent desc;

comment on view public.view_purchase_summary is 'Purchase spending by supplier';

-- Products by popularity (sold quantity)
create or replace view public.view_top_selling_products as
select 
  p.id,
  p.name,
  p.sku,
  p.unit_price,
  sum(si.qty) as total_sold,
  count(distinct si.sale_id) as num_sales,
  sum(si.qty * si.unit_price) as total_revenue
from public.products p
left join public.sale_items si on p.id = si.product_id
left join public.sales s on si.sale_id = s.id and s.status = 'COMPLETED'
where p.active = true
group by p.id, p.name, p.sku, p.unit_price
having sum(si.qty) > 0
order by total_sold desc;

comment on view public.view_top_selling_products is 'Best-selling products with revenue metrics';

-- Stock history: recent movements per product
create or replace view public.view_stock_history as
select 
  p.id,
  p.name,
  p.sku,
  sm.type as movement_type,
  sm.delta,
  sm.previous_stock,
  sm.new_stock,
  sm.notes,
  sm.created_at
from public.products p
left join public.stock_movements sm on p.id = sm.product_id
order by p.name, sm.created_at desc;

comment on view public.view_stock_history is 'Stock transaction history per product for audit';

-- Customer spending profile
create or replace view public.view_customer_profile as
select 
  c.id,
  c.name,
  c.email,
  c.phone,
  count(distinct s.id) as total_purchases,
  sum(s.total) as total_spent,
  avg(s.total) as avg_purchase_value,
  max(s.created_at) as last_purchase_date,
  min(s.created_at) as first_purchase_date
from public.customers c
left join public.sales s on c.id = s.customer_id and s.status = 'COMPLETED'
group by c.id, c.name, c.email, c.phone
order by total_spent desc nulls last;

comment on view public.view_customer_profile is 'Customer purchase behavior and lifetime value';

-- Financial snapshot: current state
create or replace view public.view_financial_snapshot as
select 
  (select coalesce(sum(total), 0) from public.sales where status = 'COMPLETED')::numeric as total_sales_completed,
  (select coalesce(sum(total), 0) from public.purchases where status = 'RECEIVED')::numeric as total_purchases_received,
  (select coalesce(sum(stock * unit_price), 0) from public.products where active = true)::numeric as inventory_value,
  (select count(*) from public.products where active = true and stock = 0) as out_of_stock_count,
  (select count(*) from public.products where active = true and stock > 0) as available_product_count;

comment on view public.view_financial_snapshot is 'High-level financial metrics snapshot';
