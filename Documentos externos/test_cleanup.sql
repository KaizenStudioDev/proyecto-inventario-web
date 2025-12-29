-- Test cleanup script: remove records created by automated tests
-- Run on the 'inventario' database

DELETE FROM venta_items WHERE venta_id IN (SELECT id FROM ventas WHERE cliente LIKE 'Cliente Test' OR cliente LIKE 'TEST-CLIENTE');
DELETE FROM ventas WHERE cliente LIKE 'Cliente Test' OR cliente LIKE 'TEST-CLIENTE';

DELETE FROM compra_items WHERE compra_id IN (SELECT id FROM compras WHERE proveedor IS NULL OR proveedor LIKE '%TEST%');
DELETE FROM compras WHERE proveedor IS NULL OR proveedor LIKE '%TEST%';

DELETE FROM productos WHERE nombre LIKE 'TEST-PROD-%' OR nombre LIKE 'INT-PROD-%' OR nombre LIKE 'CONC-PROD-%';
DELETE FROM proveedores WHERE empresa LIKE 'TEST-PROV-%';
DELETE FROM clientes WHERE nombre LIKE 'TEST-CLIENTE' OR nombre LIKE 'TEST-CLIENTE%';

-- Note: adjust conditions according to your test naming conventions before running.
