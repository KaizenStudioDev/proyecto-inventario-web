package com.inventario.persistence;

import com.inventario.model.Producto;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.List;

public class TestJdbcProductos {
    public static void main(String[] args) {
        System.setProperty("jdbc.url", System.getProperty("jdbc.url", "jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false"));
        System.setProperty("jdbc.user", System.getProperty("jdbc.user", "root"));
        System.setProperty("jdbc.pass", System.getProperty("jdbc.pass", ""));

        System.out.println("TestJdbcProductos starting...");
        DataSource ds = DataSourceFactory.getDataSource();
        JdbcProductoDao dao = new JdbcProductoDao(ds);

        try {
            List<Producto> all = dao.findAll();
            System.out.println("Productos found: " + all.size());
            for (Producto p : all) {
                System.out.printf("- [%d] %s (%s) stock=%d\n", p.getId(), p.getNombre(), p.getCategoria(), p.getStock());
            }

            Producto nuevo = new Producto(null, "Prueba Producto", "Categoria Test", new java.math.BigDecimal("10.00"), new java.math.BigDecimal("15.00"), 5, 1);
            dao.save(nuevo);
            System.out.println("Inserted producto id=" + nuevo.getId());

            boolean deleted = dao.delete(nuevo.getId());
            System.out.println("Deleted inserted: " + deleted);
        } catch (SQLException ex) {
            System.err.println("JDBC operation failed: " + ex.getMessage());
            ex.printStackTrace(System.err);
        } finally {
            try { DataSourceFactory.close(); } catch (Exception e) { }
        }

        System.out.println("TestJdbcProductos finished.");
    }
}
