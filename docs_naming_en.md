# English Naming — Inventory Domain

Spanish → English mapping for web adaptation:

- Producto → Product
  - nombre → name
  - precio → unit_price
  - stock → stock
  - stock_minimo → min_stock
  - sku → sku
- Proveedor → Supplier
  - nombre → name
  - correo → email
  - telefono → phone
  - direccion → address
- Cliente → Customer
  - nombre → name
  - correo → email
  - telefono → phone
  - direccion → address
- Venta → Sale
  - total → total
  - estado → status
  - items → sale_items (qty, unit_price)
- Compra → Purchase
  - total → total
  - items → purchase_items (qty, unit_price)
- MovimientoStock → StockMovement
  - tipo → type (SALE, PURCHASE, ADJUST)
  - delta → delta
  - referencia → ref_type, ref_id

UI labels:
- Products, Suppliers, Customers, Sales, Purchases, Alerts
- Low Stock, Out of Stock, OK
- Add Product, Edit Product, Delete
