package com.inventario.persistence;

import com.inventario.model.Producto;
import com.inventario.model.Compra;
import com.inventario.model.Venta;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDateTime;

public class TestStockBehavior {
    public static void main(String[] args) {
        System.setProperty("jdbc.url", System.getProperty("jdbc.url", "jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false"));
        System.setProperty("jdbc.user", System.getProperty("jdbc.user", "root"));
        System.setProperty("jdbc.pass", System.getProperty("jdbc.pass", ""));

        DataSource ds = DataSourceFactory.getDataSource();
        JdbcProductoDao productoDao = new JdbcProductoDao(ds);
        JdbcCompraDao compraDao = new JdbcCompraDao(ds);
        JdbcVentaDao ventaDao = new JdbcVentaDao(ds);

        try {
            // Create unique product
            String prodName = "TEST-STOCK-PROD-" + System.currentTimeMillis();
            Producto p = new Producto(null, prodName, "TestCat", new BigDecimal("1.00"), new BigDecimal("2.00"), 10, 1);
            productoDao.save(p);
            System.out.println("Created product id=" + p.getId() + " name=" + p.getNombre() + " stock=" + p.getStock());

            // Do a purchase +5
            String productosCompra = prodName + " x5";
            Compra c = new Compra(null, LocalDateTime.now(), "Proveedor Test", productosCompra, new BigDecimal("5.00"));
            compraDao.save(c);
            System.out.println("Inserted compra id=" + c.getId());

            // Refresh product
            Producto afterCompra = productoDao.findById(p.getId()).orElseThrow();
            System.out.println("Stock after compra: " + afterCompra.getStock());
            if (afterCompra.getStock() != 15) {
                System.err.println("Unexpected stock after compra: expected 15");
            }

            // Do a sale -3
            String productosVenta = prodName + " x3";
            Venta v = new Venta(null, LocalDateTime.now(), "Cliente Test", productosVenta, new BigDecimal("6.00"), "Completada");
            ventaDao.save(v);
            System.out.println("Inserted venta id=" + v.getId());

            Producto afterVenta = productoDao.findById(p.getId()).orElseThrow();
            System.out.println("Stock after venta: " + afterVenta.getStock());
            if (afterVenta.getStock() != 12) {
                System.err.println("Unexpected stock after venta: expected 12");
            }

            // Cleanup: set stock back to original and delete created compra/venta and product
            p.setStock(10);
            productoDao.save(p);
            System.out.println("Reset product stock to 10");

            // Optionally delete compra and venta records to keep DB clean
            try { compraDao.delete(c.getId()); } catch (Exception ex) { }
            try { ventaDao.delete(v.getId()); } catch (Exception ex) { }

            // delete product
            try { productoDao.delete(p.getId()); } catch (Exception ex) { }
            System.out.println("Cleanup done.");
        } catch (SQLException ex) {
            System.err.println("JDBC operation failed: " + ex.getMessage());
            ex.printStackTrace(System.err);
        } finally {
            try { DataSourceFactory.close(); } catch (Exception e) { }
        }
    }
}
