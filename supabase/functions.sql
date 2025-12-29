-- ============================================================================
-- UTILITY FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Get stock status text
create or replace function public.get_stock_status(p_stock integer, p_min_stock integer)
returns text as $$
begin
  if p_stock <= 0 then return 'OUT_OF_STOCK';
  elsif p_stock <= p_min_stock then return 'LOW_STOCK';
  else return 'OK';
  end if;
end;
$$ language plpgsql immutable;

comment on function public.get_stock_status is 'Returns stock status string for UI display';

-- Format currency as USD
create or replace function public.format_currency(p_amount numeric)
returns text as $$
begin
  return '$' || to_char(p_amount, 'FM999,999,999.00');
end;
$$ language plpgsql immutable;

comment on function public.format_currency is 'Format numeric amount to USD currency string';

-- Get total outstanding (pending) sales
create or replace function public.get_pending_sales_total()
returns numeric as $$
begin
  return coalesce((select sum(total) from public.sales where status = 'PENDING'), 0);
end;
$$ language plpgsql stable;

comment on function public.get_pending_sales_total is 'Sum of all pending (not yet completed) sales';

-- Get total outstanding (pending) purchases
create or replace function public.get_pending_purchases_total()
returns numeric as $$
begin
  return coalesce((select sum(total) from public.purchases where status = 'PENDING'), 0);
end;
$$ language plpgsql stable;

comment on function public.get_pending_purchases_total is 'Sum of all pending (not yet received) purchases';

-- Record stock adjustment (admin-only in RLS)
create or replace function public.adjust_stock(
  p_product_id uuid,
  p_delta integer,
  p_notes text default null
)
returns table(product_id uuid, new_stock integer, movement_id uuid) as $$
declare
  v_previous_stock int;
  v_new_stock int;
  v_movement_id uuid;
begin
  -- Get current stock
  select stock into v_previous_stock from public.products where id = p_product_id;
  
  if v_previous_stock is null then
    raise exception 'Product % not found', p_product_id;
  end if;
  
  -- Update stock
  update public.products
  set stock = stock + p_delta
  where id = p_product_id
  returning stock into v_new_stock;
  
  -- Record adjustment
  insert into public.stock_movements(product_id, type, delta, previous_stock, new_stock, notes)
  values (p_product_id, 'ADJUST', p_delta, v_previous_stock, v_new_stock, p_notes)
  returning id into v_movement_id;
  
  return query select p_product_id, v_new_stock, v_movement_id;
end;
$$ language plpgsql;

comment on function public.adjust_stock is 'Manual stock correction (admin-only, requires INSERT into stock_movements)';

-- Get stock movement history for a product (last N movements)
create or replace function public.get_stock_history(
  p_product_id uuid,
  p_limit integer default 10
)
returns table(
  movement_id uuid,
  movement_type text,
  delta integer,
  previous_stock integer,
  new_stock integer,
  notes text,
  created_at timestamptz
) as $$
begin
  return query
  select 
    sm.id,
    sm.type,
    sm.delta,
    sm.previous_stock,
    sm.new_stock,
    sm.notes,
    sm.created_at
  from public.stock_movements sm
  where sm.product_id = p_product_id
  order by sm.created_at desc
  limit p_limit;
end;
$$ language plpgsql stable;

comment on function public.get_stock_history is 'Return recent stock movements for a product';

-- Calculate total inventory value
create or replace function public.calculate_inventory_value()
returns numeric as $$
begin
  return coalesce((select sum(stock::numeric * unit_price) from public.products where active = true), 0);
end;
$$ language plpgsql stable;

comment on function public.calculate_inventory_value is 'Total value of current inventory at unit prices';

-- Count products by stock status
create or replace function public.count_by_stock_status()
returns table(status text, count bigint) as $$
begin
  return query
  select 'OUT_OF_STOCK'::text, count(*) from public.products where active = true and stock = 0
  union all
  select 'LOW_STOCK'::text, count(*) from public.products where active = true and stock > 0 and stock <= min_stock
  union all
  select 'OK'::text, count(*) from public.products where active = true and stock > min_stock;
end;
$$ language plpgsql stable;

comment on function public.count_by_stock_status is 'Breakdown of products by stock status (OUT, LOW, OK)';
