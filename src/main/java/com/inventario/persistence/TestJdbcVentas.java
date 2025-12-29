package com.inventario.persistence;

import com.inventario.model.Venta;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

public class TestJdbcVentas {
    public static void main(String[] args) {
        System.setProperty("jdbc.url", System.getProperty("jdbc.url", "jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false"));
        System.setProperty("jdbc.user", System.getProperty("jdbc.user", "root"));
        System.setProperty("jdbc.pass", System.getProperty("jdbc.pass", ""));

        System.out.println("TestJdbcVentas starting...");
        DataSource ds = DataSourceFactory.getDataSource();
        JdbcVentaDao dao = new JdbcVentaDao(ds);

        try {
            List<Venta> all = dao.findAll();
            System.out.println("Ventas found: " + all.size());
            for (Venta v : all) System.out.printf("- [%d] %s %s %s\n", v.getId(), v.getFecha(), v.getCliente(), v.getTotal());

            Venta nuevo = new Venta(null, LocalDateTime.now(), "Prueba Cliente", "Producto X x1", new java.math.BigDecimal("100.00"), "Completada");
            dao.save(nuevo);
            System.out.println("Inserted venta id=" + nuevo.getId());

            boolean deleted = dao.delete(nuevo.getId());
            System.out.println("Deleted inserted: " + deleted);
        } catch (SQLException ex) {
            System.err.println("JDBC operation failed: " + ex.getMessage());
            ex.printStackTrace(System.err);
        } finally {
            try { DataSourceFactory.close(); } catch (Exception e) { }
        }

        System.out.println("TestJdbcVentas finished.");
    }
}
