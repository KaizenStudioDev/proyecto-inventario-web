-- Supabase/Postgres Schema for Inventory Web
-- Full-featured inventory management with auth, RLS, triggers, and audit
-- Designed for portfolio MVP: clean, scalable, production-ready

-- ============================================================================
-- AUTHENTICATION & AUTHORIZATION
-- ============================================================================

-- Profiles: linked to auth.users, tracks role & metadata
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','staff')) default 'staff',
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_profiles_role on public.profiles(role);
comment on table public.profiles is 'User profiles with role-based access control (admin, staff)';
comment on column public.profiles.role is 'admin: full access; staff: read all, write own data';

-- ============================================================================
-- CORE MASTER DATA
-- ============================================================================

-- Products: inventory items with stock tracking
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  description text,
  unit_price numeric(12,2) not null check (unit_price >= 0) default 0,
  stock integer not null check (stock >= 0) default 0,
  min_stock integer not null check (min_stock >= 0) default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_name on public.products (name);
create index if not exists idx_products_sku on public.products (sku);
create index if not exists idx_products_active on public.products (active);
comment on table public.products is 'Inventory products with stock management';
comment on column public.products.sku is 'Unique Stock Keeping Unit identifier';
comment on column public.products.min_stock is 'Alert threshold for low stock';

-- Suppliers: vendor management
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_suppliers_name on public.suppliers (name);
create index if not exists idx_suppliers_active on public.suppliers (active);
comment on table public.suppliers is 'Vendor/supplier contact information';

-- Customers: buyer management
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_customers_name on public.customers (name);
create index if not exists idx_customers_email on public.customers (email);
create index if not exists idx_customers_active on public.customers (active);
comment on table public.customers is 'Customer/buyer information';

-- ============================================================================
-- TRANSACTIONS: SALES & PURCHASES
-- ============================================================================

-- Sales: customer transactions
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  status text not null check (status in ('PENDING','COMPLETED','CANCELLED')) default 'PENDING',
  total numeric(12,2) not null check (total >= 0) default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_sales_customer on public.sales(customer_id);
create index if not exists idx_sales_status on public.sales(status);
create index if not exists idx_sales_created on public.sales(created_at desc);
comment on table public.sales is 'Sales transactions with line items';
comment on column public.sales.status is 'PENDING: in progress, COMPLETED: finalized, CANCELLED: voided';

-- Sale items: line items of a sale
create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  qty integer not null check (qty > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  created_at timestamptz not null default now(),
  unique(sale_id, product_id)
);
create index if not exists idx_sale_items_product on public.sale_items(product_id);
comment on table public.sale_items is 'Line items for each sale';

-- Purchases: supplier transactions
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  status text not null check (status in ('PENDING','RECEIVED','CANCELLED')) default 'PENDING',
  total numeric(12,2) not null check (total >= 0) default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_purchases_supplier on public.purchases(supplier_id);
create index if not exists idx_purchases_status on public.purchases(status);
create index if not exists idx_purchases_created on public.purchases(created_at desc);
comment on table public.purchases is 'Purchase orders from suppliers';
comment on column public.purchases.status is 'PENDING: ordered, RECEIVED: received, CANCELLED: cancelled';

-- Purchase items: line items of a purchase
create table if not exists public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  qty integer not null check (qty > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  created_at timestamptz not null default now(),
  unique(purchase_id, product_id)
);
create index if not exists idx_purchase_items_product on public.purchase_items(product_id);
comment on table public.purchase_items is 'Line items for each purchase order';

-- ============================================================================
-- AUDIT & HISTORY
-- ============================================================================

-- Stock movements: complete audit trail for debugging/compliance
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  type text not null check (type in ('SALE','PURCHASE','ADJUST','RETURN','DAMAGE')),
  delta integer not null,
  previous_stock integer not null,
  new_stock integer not null,
  ref_type text,
  ref_id uuid,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_movements_product on public.stock_movements(product_id);
create index if not exists idx_movements_type on public.stock_movements(type);
create index if not exists idx_movements_created on public.stock_movements(created_at desc);
comment on table public.stock_movements is 'Complete stock transaction history for audit';
comment on column public.stock_movements.type is 'SALE: decrements stock, PURCHASE: increments, ADJUST: manual correction, RETURN: customer return, DAMAGE: waste';

-- Audit log: track all data changes (optional, for advanced compliance)
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  operation text not null check (operation in ('INSERT','UPDATE','DELETE')),
  record_id uuid not null,
  changes jsonb,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_log_table on public.audit_log(table_name);
create index if not exists idx_audit_log_user on public.audit_log(user_id);
comment on table public.audit_log is 'Immutable change log for compliance and debugging';

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Helper: Update timestamp on any table change
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

-- Apply touch_updated_at to all master tables
create trigger products_touch_updated before update on public.products for each row execute function public.touch_updated_at();
create trigger suppliers_touch_updated before update on public.suppliers for each row execute function public.touch_updated_at();
create trigger customers_touch_updated before update on public.customers for each row execute function public.touch_updated_at();
create trigger sales_touch_updated before update on public.sales for each row execute function public.touch_updated_at();
create trigger purchases_touch_updated before update on public.purchases for each row execute function public.touch_updated_at();
create trigger profiles_touch_updated before update on public.profiles for each row execute function public.touch_updated_at();

-- ============================================================================
-- STOCK MANAGEMENT TRIGGERS
-- ============================================================================

-- Auto-sync profiles for new auth users (set default staff role)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles(user_id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'staff');
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Decrement stock on sale item insert (only if COMPLETED status)
create or replace function public.handle_sale_item_insert()
returns trigger language plpgsql as $$
declare
  v_previous_stock int;
  v_new_stock int;
begin
  -- Check parent sale status
  if (select status from public.sales where id = new.sale_id) = 'COMPLETED' then
    -- Get current stock
    select stock into v_previous_stock from public.products where id = new.product_id;
    
    -- Update stock (will be validated by constraint)
    update public.products
    set stock = stock - new.qty
    where id = new.product_id;
    
    -- Get new stock value
    select stock into v_new_stock from public.products where id = new.product_id;
    
    -- Record movement
    insert into public.stock_movements(product_id, type, delta, previous_stock, new_stock, ref_type, ref_id)
    values (new.product_id, 'SALE', -new.qty, v_previous_stock, v_new_stock, 'sale', new.sale_id);
  end if;
  return new;
end; $$;

create trigger sale_items_after_insert
after insert on public.sale_items
for each row execute function public.handle_sale_item_insert();

-- Increment stock on purchase item insert (only if RECEIVED status)
create or replace function public.handle_purchase_item_insert()
returns trigger language plpgsql as $$
declare
  v_previous_stock int;
  v_new_stock int;
begin
  -- Check parent purchase status
  if (select status from public.purchases where id = new.purchase_id) = 'RECEIVED' then
    -- Get current stock
    select stock into v_previous_stock from public.products where id = new.product_id;
    
    -- Update stock
    update public.products
    set stock = stock + new.qty
    where id = new.product_id;
    
    -- Get new stock value
    select stock into v_new_stock from public.products where id = new.product_id;
    
    -- Record movement
    insert into public.stock_movements(product_id, type, delta, previous_stock, new_stock, ref_type, ref_id)
    values (new.product_id, 'PURCHASE', new.qty, v_previous_stock, v_new_stock, 'purchase', new.purchase_id);
  end if;
  return new;
end; $$;

create trigger purchase_items_after_insert
after insert on public.purchase_items
for each row execute function public.handle_purchase_item_insert();

-- ============================================================================
-- TOTALS & CALCULATED FIELDS
-- ============================================================================

-- Auto-calculate sale total when items are added/removed
create or replace function public.update_sale_total()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    update public.sales
    set total = (select coalesce(sum(qty * unit_price), 0) from public.sale_items where sale_id = old.sale_id)
    where id = old.sale_id;
  else
    update public.sales
    set total = (select coalesce(sum(qty * unit_price), 0) from public.sale_items where sale_id = new.sale_id)
    where id = new.sale_id;
  end if;
  return null;
end; $$;

create trigger sale_items_update_total_after_insert
after insert on public.sale_items
for each row execute function public.update_sale_total();

create trigger sale_items_update_total_after_delete
after delete on public.sale_items
for each row execute function public.update_sale_total();

-- Auto-calculate purchase total when items are added/removed
create or replace function public.update_purchase_total()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    update public.purchases
    set total = (select coalesce(sum(qty * unit_price), 0) from public.purchase_items where purchase_id = old.purchase_id)
    where id = old.purchase_id;
  else
    update public.purchases
    set total = (select coalesce(sum(qty * unit_price), 0) from public.purchase_items where purchase_id = new.purchase_id)
    where id = new.purchase_id;
  end if;
  return null;
end; $$;

create trigger purchase_items_update_total_after_insert
after insert on public.purchase_items
for each row execute function public.update_purchase_total();

create trigger purchase_items_update_total_after_delete
after delete on public.purchase_items
for each row execute function public.update_purchase_total();
