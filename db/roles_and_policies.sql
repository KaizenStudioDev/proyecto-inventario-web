-- Roles & RLS hardening for Inventory app
-- Run in Supabase SQL editor (public schema). Adjust UUIDs/emails for your tenants.

-----------------------------
-- 0) Prereqs: profiles table
-----------------------------
alter table public.profiles
  add column if not exists role text check (role in ('admin','vendedor','contabilidad','tester')) default 'tester';

alter table public.profiles
  add column if not exists is_test_user boolean not null default false;

-- Optional: add basic columns if missing
-- alter table public.profiles add column if not exists full_name text;
-- alter table public.profiles add column if not exists avatar_url text;
-- alter table public.profiles add column if not exists phone text;

-----------------------------
-- 1) Helper functions (read role/test flag securely)
-----------------------------
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where user_id = auth.uid()), 'tester');
$$;

comment on function public.current_role is 'Returns the logical role for the authenticated user (defaults to tester).';

create or replace function public.current_is_test_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_test_user from public.profiles where user_id = auth.uid()), false);
$$;

comment on function public.current_is_test_user is 'True when the current user is one of the fixed test accounts.';

-----------------------------
-- 2) Enforce RLS on key tables
-----------------------------
-- Enable/force RLS
alter table public.products          enable row level security; alter table public.products          force row level security;
alter table public.customers         enable row level security; alter table public.customers         force row level security;
alter table public.suppliers         enable row level security; alter table public.suppliers         force row level security;
alter table public.sales             enable row level security; alter table public.sales             force row level security;
alter table public.purchases         enable row level security; alter table public.purchases         force row level security;
alter table public.stock_movements   enable row level security; alter table public.stock_movements   force row level security;
alter table public.profiles          enable row level security; alter table public.profiles          force row level security;

-----------------------------
-- 3) Policies per table
-----------------------------
-- PRODUCTS
drop policy if exists products_select on public.products;
drop policy if exists products_insert_admin on public.products;
drop policy if exists products_insert_tester on public.products;
drop policy if exists products_update_admin on public.products;
drop policy if exists products_update_tester on public.products;
drop policy if exists products_delete_admin on public.products;

create policy products_select on public.products
  for select using ( current_role() in ('admin','vendedor','contabilidad','tester') );

create policy products_insert_admin on public.products
  for insert with check ( current_role() = 'admin' );

create policy products_insert_tester on public.products
  for insert with check ( current_role() = 'tester' and not current_is_test_user() );

create policy products_update_admin on public.products
  for update using ( current_role() = 'admin' ) with check ( current_role() = 'admin' );

create policy products_update_tester on public.products
  for update using ( current_role() = 'tester' and not current_is_test_user() )
           with check ( current_role() = 'tester' and not current_is_test_user() );

create policy products_delete_admin on public.products
  for delete using ( current_role() = 'admin' );

-- CUSTOMERS
drop policy if exists customers_select on public.customers;
drop policy if exists customers_insert_admin on public.customers;
drop policy if exists customers_insert_tester on public.customers;
drop policy if exists customers_update_admin on public.customers;
drop policy if exists customers_update_tester on public.customers;
drop policy if exists customers_delete_admin on public.customers;

create policy customers_select on public.customers
  for select using ( current_role() in ('admin','vendedor','contabilidad','tester') );

create policy customers_insert_admin on public.customers
  for insert with check ( current_role() = 'admin' );

create policy customers_insert_tester on public.customers
  for insert with check ( current_role() = 'tester' and not current_is_test_user() );

create policy customers_update_admin on public.customers
  for update using ( current_role() = 'admin' ) with check ( current_role() = 'admin' );

create policy customers_update_tester on public.customers
  for update using ( current_role() = 'tester' and not current_is_test_user() )
           with check ( current_role() = 'tester' and not current_is_test_user() );

create policy customers_delete_admin on public.customers
  for delete using ( current_role() = 'admin' );

-- SUPPLIERS
drop policy if exists suppliers_select on public.suppliers;
drop policy if exists suppliers_insert_admin on public.suppliers;
drop policy if exists suppliers_insert_tester on public.suppliers;
drop policy if exists suppliers_update_admin on public.suppliers;
drop policy if exists suppliers_update_tester on public.suppliers;
drop policy if exists suppliers_delete_admin on public.suppliers;

create policy suppliers_select on public.suppliers
  for select using ( current_role() in ('admin','contabilidad','tester','vendedor') );

create policy suppliers_insert_admin on public.suppliers
  for insert with check ( current_role() = 'admin' );

create policy suppliers_insert_tester on public.suppliers
  for insert with check ( current_role() = 'tester' and not current_is_test_user() );

create policy suppliers_update_admin on public.suppliers
  for update using ( current_role() = 'admin' ) with check ( current_role() = 'admin' );

create policy suppliers_update_tester on public.suppliers
  for update using ( current_role() = 'tester' and not current_is_test_user() )
           with check ( current_role() = 'tester' and not current_is_test_user() );

create policy suppliers_delete_admin on public.suppliers
  for delete using ( current_role() = 'admin' );

-- SALES
drop policy if exists sales_select on public.sales;
drop policy if exists sales_insert on public.sales;
drop policy if exists sales_update_admin on public.sales;
drop policy if exists sales_delete_admin on public.sales;

create policy sales_select on public.sales
  for select using ( current_role() in ('admin','vendedor','contabilidad','tester') );

create policy sales_insert on public.sales
  for insert with check ( current_role() in ('admin','vendedor','tester') and not current_is_test_user() );

create policy sales_update_admin on public.sales
  for update using ( current_role() = 'admin' ) with check ( current_role() = 'admin' );

create policy sales_delete_admin on public.sales
  for delete using ( current_role() = 'admin' );

-- PURCHASES
drop policy if exists purchases_select on public.purchases;
drop policy if exists purchases_insert on public.purchases;
drop policy if exists purchases_update_admin on public.purchases;
drop policy if exists purchases_delete_admin on public.purchases;

create policy purchases_select on public.purchases
  for select using ( current_role() in ('admin','contabilidad','tester') );

create policy purchases_insert on public.purchases
  for insert with check ( current_role() in ('admin','tester') and not current_is_test_user() );

create policy purchases_update_admin on public.purchases
  for update using ( current_role() = 'admin' ) with check ( current_role() = 'admin' );

create policy purchases_delete_admin on public.purchases
  for delete using ( current_role() = 'admin' );

-- STOCK MOVEMENTS (readable by all, write by admin/tester non-test)
drop policy if exists stock_movements_select on public.stock_movements;
drop policy if exists stock_movements_insert on public.stock_movements;
drop policy if exists stock_movements_delete_admin on public.stock_movements;

create policy stock_movements_select on public.stock_movements
  for select using ( current_role() in ('admin','vendedor','contabilidad','tester') );

create policy stock_movements_insert on public.stock_movements
  for insert with check ( current_role() in ('admin','tester') and not current_is_test_user() );

create policy stock_movements_delete_admin on public.stock_movements
  for delete using ( current_role() = 'admin' );

-- PROFILES (self-service, block edits on test accounts)
drop policy if exists profiles_select_self on public.profiles;
drop policy if exists profiles_update_self on public.profiles;

create policy profiles_select_self on public.profiles
  for select using ( auth.uid() = user_id );

create policy profiles_update_self on public.profiles
  for update using ( auth.uid() = user_id and not is_test_user )
           with check ( auth.uid() = user_id and not is_test_user );

-- Optional: Admin can read all profiles
-- create policy profiles_select_admin on public.profiles
--   for select using ( current_role() = 'admin' );

-----------------------------
-- 4) Seed test accounts
-----------------------------
-- delete from public.profiles where user_id in ('ebc9cb8a-d045-4c1d-b367-8d634a99aac9','fe1a3b9e-f55c-4ff1-b8e0-91a801b6c68e','957f599a-795a-4de8-837b-7747194cde0a','e2362388-4aed-4b72-a3c8-1891c87feb4d'); -- optional reset

insert into public.profiles (user_id, role, is_test_user, full_name, avatar_url)
values
  ('ebc9cb8a-d045-4c1d-b367-8d634a99aac9', 'contabilidad', true,  'Contabilidad Demo', null),
  ('fe1a3b9e-f55c-4ff1-b8e0-91a801b6c68e', 'tester',       false, 'Tester Demo',       null),
  ('957f599a-795a-4de8-837b-7747194cde0a', 'admin',        false, 'Tomás Escobar',     null),
  ('e2362388-4aed-4b72-a3c8-1891c87feb4d', 'vendedor',     true,  'Vendedor Demo',     null)
on conflict (user_id) do update set
  role = excluded.role,
  is_test_user = excluded.is_test_user,
  full_name = excluded.full_name;

-----------------------------
-- 5) Notes for frontend guards
-----------------------------
-- Use profile.role to drive UI visibility:
-- - Admin: show all actions
-- - Vendedor: hide purchases/users; disable delete buttons
-- - Contabilidad: read-only; hide create/edit/delete
-- - Tester: hide destructive actions (delete), allow create/update where policies permit
-- Use profile.is_test_user to disable the Profile edit form.
