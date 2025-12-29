-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Access control: 
-- - admin: full read/write on all tables
-- - staff: read all, write restricted
-- - public: read-only on views (no auth required)

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  );
$$;

-- Helper: check if user is authenticated
create or replace function public.is_authenticated()
returns boolean language sql stable as $$
  select auth.uid() is not null;
$$;

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
alter table public.profiles enable row level security;

create policy profiles_read_own on public.profiles
for select to authenticated
using (user_id = auth.uid());

create policy profiles_read_admin on public.profiles
for select to authenticated
using (public.is_admin());

-- Note: Profile creation handled by trigger on auth.users
-- No insert policy needed for regular users

create policy profiles_update_own on public.profiles
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy profiles_update_admin on public.profiles
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
alter table public.products enable row level security;

-- Anyone authenticated can read products
create policy products_read on public.products
for select to authenticated
using (true);

-- Only admins can create, update, delete products
create policy products_create on public.products
for insert to authenticated
with check (public.is_admin());

create policy products_update on public.products
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy products_delete on public.products
for delete to authenticated
using (public.is_admin());

-- ============================================================================
-- SUPPLIERS TABLE
-- ============================================================================
alter table public.suppliers enable row level security;

create policy suppliers_read on public.suppliers
for select to authenticated using (true);

create policy suppliers_create on public.suppliers
for insert to authenticated with check (public.is_admin());

create policy suppliers_update on public.suppliers
for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy suppliers_delete on public.suppliers
for delete to authenticated using (public.is_admin());

-- ============================================================================
-- CUSTOMERS TABLE
-- ============================================================================
alter table public.customers enable row level security;

create policy customers_read on public.customers
for select to authenticated using (true);

create policy customers_create on public.customers
for insert to authenticated with check (public.is_admin());

create policy customers_update on public.customers
for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy customers_delete on public.customers
for delete to authenticated using (public.is_admin());

-- ============================================================================
-- SALES TABLE
-- ============================================================================
alter table public.sales enable row level security;

create policy sales_read on public.sales
for select to authenticated using (true);

create policy sales_create on public.sales
for insert to authenticated
with check (public.is_admin());

create policy sales_update on public.sales
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy sales_delete on public.sales
for delete to authenticated
using (public.is_admin());

-- ============================================================================
-- SALE_ITEMS TABLE
-- ============================================================================
alter table public.sale_items enable row level security;

create policy sale_items_read on public.sale_items
for select to authenticated using (true);

create policy sale_items_create on public.sale_items
for insert to authenticated
with check (public.is_admin());

create policy sale_items_update on public.sale_items
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy sale_items_delete on public.sale_items
for delete to authenticated
using (public.is_admin());

-- ============================================================================
-- PURCHASES TABLE
-- ============================================================================
alter table public.purchases enable row level security;

create policy purchases_read on public.purchases
for select to authenticated using (true);

create policy purchases_create on public.purchases
for insert to authenticated
with check (public.is_admin());

create policy purchases_update on public.purchases
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy purchases_delete on public.purchases
for delete to authenticated
using (public.is_admin());

-- ============================================================================
-- PURCHASE_ITEMS TABLE
-- ============================================================================
alter table public.purchase_items enable row level security;

create policy purchase_items_read on public.purchase_items
for select to authenticated using (true);

create policy purchase_items_create on public.purchase_items
for insert to authenticated
with check (public.is_admin());

create policy purchase_items_update on public.purchase_items
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy purchase_items_delete on public.purchase_items
for delete to authenticated
using (public.is_admin());

-- ============================================================================
-- STOCK_MOVEMENTS TABLE (audit log)
-- ============================================================================
alter table public.stock_movements enable row level security;

create policy movements_read on public.stock_movements
for select to authenticated using (true);

create policy movements_create_admin on public.stock_movements
for insert to authenticated
with check (public.is_admin());

-- Prevent deletion of audit log
create policy movements_no_delete on public.stock_movements
for delete to authenticated
using (false);

-- ============================================================================
-- AUDIT_LOG TABLE (immutable)
-- ============================================================================
alter table public.audit_log enable row level security;

create policy audit_log_read_admin on public.audit_log
for select to authenticated
using (public.is_admin());

-- Prevent modification of audit log (INSERT happens via triggers only)
create policy audit_log_no_insert on public.audit_log
for insert to authenticated
with check (false);

create policy audit_log_no_update on public.audit_log
for update to authenticated
using (false);

create policy audit_log_no_delete on public.audit_log
for delete to authenticated
using (false);

