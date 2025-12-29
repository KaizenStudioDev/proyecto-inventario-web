package com.inventario.persistence;

import com.inventario.model.Compra;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

public class TestJdbcCompras {
    public static void main(String[] args) {
        System.setProperty("jdbc.url", System.getProperty("jdbc.url", "jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false"));
        System.setProperty("jdbc.user", System.getProperty("jdbc.user", "root"));
        System.setProperty("jdbc.pass", System.getProperty("jdbc.pass", ""));

        System.out.println("TestJdbcCompras starting...");
        DataSource ds = DataSourceFactory.getDataSource();
        JdbcCompraDao dao = new JdbcCompraDao(ds);

        try {
            List<Compra> all = dao.findAll();
            System.out.println("Compras found: " + all.size());
            for (Compra c : all) System.out.printf("- [%d] %s %s %s\n", c.getId(), c.getFecha(), c.getProveedor(), c.getTotal());

            Compra nuevo = new Compra(null, LocalDateTime.now(), "Prueba Proveedor", "Producto Y x2", new java.math.BigDecimal("200.00"));
            dao.save(nuevo);
            System.out.println("Inserted compra id=" + nuevo.getId());

            boolean deleted = dao.delete(nuevo.getId());
            System.out.println("Deleted inserted: " + deleted);
        } catch (SQLException ex) {
            System.err.println("JDBC operation failed: " + ex.getMessage());
            ex.printStackTrace(System.err);
        } finally {
            try { DataSourceFactory.close(); } catch (Exception e) { }
        }

        System.out.println("TestJdbcCompras finished.");
    }
}
