package com.inventario.persistence;

import com.inventario.model.Proveedor;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.List;

public class TestJdbcProveedores {
    public static void main(String[] args) {
        System.setProperty("jdbc.url", System.getProperty("jdbc.url", "jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false"));
        System.setProperty("jdbc.user", System.getProperty("jdbc.user", "root"));
        System.setProperty("jdbc.pass", System.getProperty("jdbc.pass", ""));

        System.out.println("TestJdbcProveedores starting...");
        DataSource ds = DataSourceFactory.getDataSource();
        JdbcProveedorDao dao = new JdbcProveedorDao(ds);

        try {
            List<Proveedor> all = dao.findAll();
            System.out.println("Proveedores found: " + all.size());
            for (Proveedor p : all) {
                System.out.printf("- [%d] %s (%s) contacto=%s\n", p.getId(), p.getEmpresa(), p.getNit(), p.getContacto());
            }

            Proveedor nuevo = new Proveedor(null, "Empresa Prueba", "NIT-TEST-1", "Contacto Test", "3000000000", "proveedor@dao.local");
            dao.save(nuevo);
            System.out.println("Inserted proveedor id=" + nuevo.getId());

            boolean deleted = dao.delete(nuevo.getId());
            System.out.println("Deleted inserted: " + deleted);
        } catch (SQLException ex) {
            System.err.println("JDBC operation failed: " + ex.getMessage());
            ex.printStackTrace(System.err);
        } finally {
            try { DataSourceFactory.close(); } catch (Exception e) { }
        }

        System.out.println("TestJdbcProveedores finished.");
    }
}
