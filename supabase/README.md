# Supabase Setup — Inventory Web

Complete guide to setting up the PostgreSQL schema, functions, views, and RLS policies for the Inventory Web application on Supabase.

## Files Overview

- **schema.sql**: Core tables, relations, constraints, triggers (stock management + auth sync + totals calculation)
- **views.sql**: Business intelligence views (alerts, sales summary, top products, customer profile, etc.)
- **functions.sql**: Utility functions (stock status, currency formatting, stock history, adjustments)
- **policies.sql**: Row Level Security (RLS) policies with role-based access (admin, staff)
- **seed.sql**: Sample data (5 products, 3 suppliers, 3 customers, demo sales/purchases)
- **migration.md**: Guide to migrate from MySQL to Supabase

## Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click "New Project" and choose your region (closer = faster)
3. Set a strong database password and note your **Project URL** and **Anon Key** (from Settings > API)

### 2. Apply Schema

1. In Supabase, open **SQL Editor**
2. Create a new query and paste the contents of `schema.sql`
3. Click **Run** (you should see `CREATE TABLE`, `CREATE FUNCTION`, `CREATE TRIGGER` confirmations)
4. Verify tables exist: open **Table Editor** and check for `products`, `suppliers`, `customers`, etc.

**Tables created:**
- `profiles`: user roles (admin, staff)
- `products`: inventory items
- `suppliers` & `customers`: master data
- `sales` & `sale_items`: customer transactions
- `purchases` & `purchase_items`: supplier orders
- `stock_movements`: audit trail
- `audit_log`: compliance log

**Features:**
- Auto-generate UUIDs
- Cascade deletes (e.g., delete sale → delete items)
- NOT NULL constraints on critical fields
- Check constraints (stock ≥ 0, price ≥ 0, qty > 0)
- Indexes on frequently queried columns (name, sku, customer_id, etc.)
- Triggers for `updated_at` timestamps
- Triggers for auto-profile creation on new auth users
- Triggers for automatic stock updates on sale/purchase completion
- Triggers for auto-calculation of sale/purchase totals

### 3. Apply Views

1. New SQL query, paste `views.sql`
2. Click **Run**

**Views provide:**
- `view_low_stock_products`: Alert dashboard (LOW/OUT status)
- `view_sales_summary`: Daily sales metrics
- `view_purchase_summary`: Spending by supplier
- `view_top_selling_products`: Best-sellers with revenue
- `view_stock_history`: Recent movements per product
- `view_customer_profile`: Lifetime value & purchase behavior
- `view_financial_snapshot`: High-level metrics (total sales, inventory value, out-of-stock count)

### 4. Apply Functions

1. New SQL query, paste `functions.sql`
2. Click **Run**

**Functions include:**
- `get_stock_status(stock, min_stock)`: Returns "OUT_OF_STOCK", "LOW_STOCK", or "OK"
- `format_currency(amount)`: Formats numeric to "$X,XXX.XX"
- `get_pending_sales_total()`: Sum of pending sales
- `get_pending_purchases_total()`: Sum of pending purchases
- `adjust_stock(product_id, delta, notes)`: Manual stock correction (admin-only)
- `get_stock_history(product_id, limit)`: Recent movements
- `calculate_inventory_value()`: Total inventory value
- `count_by_stock_status()`: Breakdown of products by status

### 5. Set Up Authentication

1. In Supabase, go to **Authentication > Providers**
2. Enable **Email** (default) or add OAuth (Google, GitHub, etc.)
3. For testing, you can manually create users via **SQL**:

```sql
-- Create an admin user (replace with your email)
insert into auth.users(email, email_confirmed_at, raw_user_meta_data)
values ('admin@example.com', now(), '{"full_name":"Admin User"}');

-- Insert corresponding profile with admin role
insert into public.profiles(user_id, role, full_name)
select id, 'admin', 'Admin User' from auth.users where email = 'admin@example.com';
```

> Note: In production, use Supabase Auth UI or passwordless flow for real users.

### 6. Enable RLS (Row Level Security)

1. New SQL query, paste `policies.sql`
2. Click **Run**

This enables RLS on all tables with policies:
- **`authenticated`** users can read all master data (products, suppliers, customers)
- Only **`admin`** role can create, update, delete
- **Staff** role inherits read-only rules (no deletes)
- `audit_log` is immutable (read-only for admins)
- Unauthenticated requests are blocked (except for views if configured)

**Role-based access:**
- **Admin**: Full CRUD on all tables, view audit logs, adjust stock manually
- **Staff**: Read all, no write (can view products, sales, purchases, alerts)

### 7. Load Sample Data (Optional)

1. New SQL query, paste `seed.sql`
2. Click **Run**

This inserts:
- 5 sample products (laptops, cables, mice, keyboards, monitors)
- 3 sample suppliers (TechCorp, Global Electronics, Asia Supply Chain)
- 3 sample customers (Acme Corp, Creative Studio, StartUp Hub)
- 2 completed sales and purchases with line items
- Automatic stock movements recorded

**Verify:** In **Table Editor**, check `products` and `stock_movements` to see sample data.

### 8. Obtain API Keys

1. Go to Supabase **Settings > API**
2. Copy:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon / public** key

3. Add to React app's `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Testing the Setup

### Via SQL Editor

Test a query:
```sql
-- View all products with stock status
select id, name, sku, stock, min_stock, 
       public.get_stock_status(stock, min_stock) as status
from public.products
order by name;
```

Test a view:
```sql
select * from public.view_low_stock_products;
```

Test a function:
```sql
select public.format_currency(1234.56);  -- Returns: $1,234.56
select public.calculate_inventory_value();  -- Total inventory value
```

### From React App

Once `inventory-web/.env` is configured:
```powershell
npm run dev
```

Open `http://localhost:5173` → Products page should load and display sample data.

## Stock Management Flow

1. **Create Sale**: Insert a `sale` with status `PENDING`
2. **Add Items**: Insert `sale_items` (qty, price)
   - Trigger auto-calculates `sales.total`
3. **Complete Sale**: Update `sales.status = 'COMPLETED'`
   - Trigger decrements `products.stock` by qty
   - Trigger records movement in `stock_movements`
4. **Create Purchase**: Insert `purchase` with status `PENDING`
5. **Receive**: Update `purchases.status = 'RECEIVED'`
   - Trigger increments `products.stock` by qty
   - Trigger records movement in `stock_movements`

**Alerts**: Use `view_low_stock_products` to identify LOW/OUT items.

## Common Tasks

### View Low Stock Alerts
```sql
select * from public.view_low_stock_products;
```

### Get Sales Dashboard for Today
```sql
select * from public.view_sales_summary 
where sale_date = current_date;
```

### Get Customer Lifetime Value
```sql
select * from public.view_customer_profile 
where total_spent > 0
order by total_spent desc;
```

### Adjust Stock Manually (Admin)
```sql
select public.adjust_stock(
  'product-uuid-here'::uuid, 
  10,  -- add 10 units
  'Inventory correction due to recount'
);
```

### View Stock History for a Product
```sql
select * from public.get_stock_history('product-uuid-here'::uuid, 20);
```

## Troubleshooting

### RLS Policy Errors
- Ensure you have an `admin` profile (see step 5)
- Check that the user making the request is authenticated (`auth.uid()` is set)

### Trigger Not Firing
- Verify trigger is enabled: `SELECT * FROM information_schema.triggers WHERE table_name = 'sale_items';`
- Check function compile errors in SQL Editor

### NULL values in calculated fields
- Ensure parent records exist (customer for sale, supplier for purchase)
- Check foreign key constraints are satisfied

### Stock went negative
- Review `stock_movements` audit log to find the culprit
- Use `adjust_stock()` to correct

## Next: Deploy React App

Once Supabase is set up, proceed to `inventory-web/` and follow `README.md` to deploy on Vercel.

