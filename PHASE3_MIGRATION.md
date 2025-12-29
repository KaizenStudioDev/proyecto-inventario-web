# Phase 3: Migración de Datos MySQL → Supabase

## Resumen de la Migración

Este documento guía la migración de datos desde tu base de datos MySQL original a Supabase (PostgreSQL).

### Mapeo de Tablas y Columnas

| MySQL | Supabase | Cambios |
|-------|----------|---------|
| `clientes` | `customers` | id: INT → UUID |
| `proveedores` | `suppliers` | id: INT → UUID |
| `productos` | `products` | id: INT → UUID, precio_compra → cost_price, precio_venta → unit_price |
| `ventas` | `sales` | id: INT → UUID, cliente_id → customer_id (UUID), estado → status |
| `venta_items` | `sale_items` | venta_id → sale_id (UUID), producto_id (UUID) |
| `compras` | `purchases` | id: INT → UUID, proveedor_id → supplier_id (UUID) |
| `compra_items` | `purchase_items` | compra_id → purchase_id (UUID), producto_id (UUID) |

---

## OPCIÓN 1: Importación Rápida (RECOMENDADO)

### Paso 1: Ir a Supabase SQL Editor

1. Abre tu dashboard de Supabase
2. Ve a **SQL Editor**
3. Crea una nueva query (click en "New Query")
4. Copia todo el contenido de **`supabase/migration_import.sql`** de tu proyecto
5. Ejecuta la query

### Paso 2: Verificar Datos Importados

Después de ejecutar, deberías ver en el resumen:

```
table_name     | total
---------------+-------
Suppliers      |     6
Customers      |     8
Products       |    20
Purchases      |     0
Sales          |     0
```

(Los números pueden variar según tu data original)

### Paso 3: Probar la Aplicación

1. Recarga `http://localhost:5175`
2. Ve a **Products** → deberías ver ahora 20 productos en lugar de 5
3. Ve a **Alerts** → verifica los productos sin stock

---

## OPCIÓN 2: Importación Manual desde MySQL (Alternativa)

Si prefieres exportar primero desde MySQL:

### Paso 1: Ejecutar Export en MySQL

```bash
# En tu terminal MySQL o MySQL Workbench:
mysql -u root -p inventario < migration_export.sql
```

Esto generará archivos CSV en `C:/tmp/` (Windows) o `/tmp/` (Linux/Mac)

### Paso 2: Convertir CSV a SQL para Supabase

Una vez tengas los CSVs, puedes usar esta herramienta online para convertirlos:
- https://www.convertcsv.com/csv-to-sql.htm

O manualmente con Python (si tienes Python instalado):

```python
import csv
import uuid

# Leer CSV de productos
with open('C:/tmp/products.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        product_id = str(uuid.uuid4())
        print(f"INSERT INTO products ...")
```

### Paso 3: Ejecutar en Supabase

Pega el SQL generado en el SQL Editor de Supabase y ejecuta.

---

## OPCIÓN 3: Importación con Transacciones (Para Datos Grandes)

Si tienes muchos datos, usa transacciones para seguridad:

```sql
BEGIN;

-- Disable constraints
ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;
-- ... más imports aquí ...

-- Enable constraints
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

COMMIT;
```

---

## Verificación Post-Migración

### 1. Conteo de Registros

```sql
-- En Supabase SQL Editor
SELECT 'Suppliers' as table_name, COUNT(*) as count FROM suppliers
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers;
```

### 2. Verificar Integridad Referencial

```sql
-- Buscar compras huérfanas (sin proveedor)
SELECT COUNT(*) FROM purchases WHERE supplier_id IS NULL;

-- Buscar ventas huérfanas (sin cliente)
SELECT COUNT(*) FROM sales WHERE customer_id IS NULL;
```

### 3. Verificar Stock Mínimo

```sql
-- Ver productos con stock bajo
SELECT name, stock, min_stock 
FROM products 
WHERE stock <= min_stock 
ORDER BY stock ASC;
```

---

## Solución de Problemas

### Problema: "Violación de restricción de clave única"

**Causa**: Documentos duplicados (documento_id en customers o tax_id en suppliers)

**Solución**: 
```sql
-- Añadir TIMESTAMP único a duplicados
SELECT name, document_id, COUNT(*) 
FROM customers 
GROUP BY name, document_id 
HAVING COUNT(*) > 1;
```

### Problema: "Restricción de clave ajena violada"

**Causa**: Una venta/compra referencia un cliente/proveedor que no existe

**Solución**:
```sql
-- Encontrar referencias rotas
SELECT * FROM sales 
WHERE customer_id NOT IN (SELECT id FROM customers);

-- Eliminarlas o reasignarlas
DELETE FROM sales WHERE customer_id NOT IN (SELECT id FROM customers);
```

### Problema: RLS policy bloqueando inserciones

**Solución**: El script `migration_import.sql` ya deshabilita RLS durante la migración.

---

## Rollback (Si Algo Sale Mal)

Si necesitas revertir la migración:

```sql
-- Opción 1: Limpiar todo y reimportar
TRUNCATE public.sale_items CASCADE;
TRUNCATE public.sales CASCADE;
TRUNCATE public.purchase_items CASCADE;
TRUNCATE public.purchases CASCADE;
TRUNCATE public.products CASCADE;
TRUNCATE public.customers CASCADE;
TRUNCATE public.suppliers CASCADE;

-- Luego re-ejecuta migration_import.sql
```

---

## Próximos Pasos

Una vez que la migración sea exitosa:

1. ✅ **Fase 3 Completada**: Datos migrados
2. 🔄 **Fase 4**: Deployment a Vercel
3. 📊 **Fase 5**: Testing y optimización

Para la Fase 4, necesitaremos:
- Crear repositorio en GitHub
- Conectar Vercel a GitHub
- Configurar variables de entorno en Vercel
- Deploy automático

¿Ejecutaste el script de migración exitosamente?
