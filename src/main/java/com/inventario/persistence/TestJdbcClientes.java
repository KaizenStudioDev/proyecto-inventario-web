package com.inventario.persistence;

import com.inventario.model.Cliente;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.List;

public class TestJdbcClientes {
    public static void main(String[] args) {
        // Use system props with safe defaults (no hardcoded password)
        System.setProperty("jdbc.url", System.getProperty("jdbc.url", "jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false"));
        System.setProperty("jdbc.user", System.getProperty("jdbc.user", "root"));
        System.setProperty("jdbc.pass", System.getProperty("jdbc.pass", ""));

        System.out.println("TestJdbcClientes starting...");
        DataSource ds = DataSourceFactory.getDataSource();
        JdbcClienteDao dao = new JdbcClienteDao(ds);

        try {
            List<Cliente> all = dao.findAll();
            System.out.println("Clientes found: " + all.size());
            for (Cliente c : all) {
                System.out.printf("- [%d] %s (%s)\n", c.getId(), c.getNombre(), c.getDocumento());
            }

            // Test insert
            Cliente newC = new Cliente(null, "Prueba DAO", "CC-DAO-1", "3000000000", "prueba@dao.local", "Direccion prueba");
            dao.save(newC);
            System.out.println("Inserted new cliente id=" + newC.getId());

            // Clean up (delete the inserted)
            boolean deleted = dao.delete(newC.getId());
            System.out.println("Deleted inserted: " + deleted);
        } catch (SQLException ex) {
            System.err.println("JDBC operation failed: " + ex.getMessage());
            ex.printStackTrace(System.err);
        } finally {
            try { DataSourceFactory.close(); } catch (Exception e) { }
        }

        System.out.println("TestJdbcClientes finished.");
    }
}
