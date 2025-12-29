# Data Migration — MySQL to Supabase (PostgreSQL)

This guide helps you move existing data from your MySQL inventory to Supabase.

## 1) Export from MySQL
Use CSV exports per table. Example (PowerShell):

```powershell
# Replace credentials and database name
# Export products
mysql -h 127.0.0.1 -P 3306 -u root -p -e "SELECT id, nombre AS name, sku, precio AS unit_price, stock, min_stock FROM productos" inventario_db > products.csv

# Export suppliers, customers, sales & items similarly
```

Alternatively, use any GUI (MySQL Workbench) to export CSV per table.

## 2) Prepare CSVs for Postgres
- Ensure headers match the target columns (see `schema.sql`).
- Convert decimal separators to `.` and dates to ISO (YYYY-MM-DD HH:MM:SS).
- Map Spanish columns to English:
  - `productos.nombre` → `products.name`
  - `productos.precio` → `products.unit_price`
  - `proveedores.nombre` → `suppliers.name`
  - `clientes.nombre` → `customers.name`

## 3) Import into Supabase
Use the Table Editor's Import CSV feature or SQL `COPY`:

```sql
-- Example: import products
COPY public.products(name, sku, unit_price, stock, min_stock)
FROM 'products.csv' WITH (FORMAT csv, HEADER true);
```

> Supabase's SQL `COPY` supports remote files via storage/public URLs. For local files, prefer Table Editor import.

## 4) Rebuild relations
Insert customers/suppliers first, then sales/purchases, then items with foreign keys set.

## 5) Verify stock
After importing purchase and sale items, verify stock via:

```sql
select id, name, stock, min_stock from public.products order by name;
```

If needed, perform manual adjustments (admin) and record in `stock_movements`.
