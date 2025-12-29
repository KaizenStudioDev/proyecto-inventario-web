package com.inventario.persistence;

import com.inventario.model.Proveedor;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import javax.sql.DataSource;
import java.util.List;

public class ProveedoresCrudTest {

    @AfterEach
    public void tearDown() {
        try { DataSourceFactory.close(); } catch (Exception ignore) {}
    }

    @Test
    public void crudProveedor() throws Exception {
        DataSource ds = DataSourceFactory.getDataSource();
        JdbcProveedorDao dao = new JdbcProveedorDao(ds);

        String name = "TEST-PROV-" + System.currentTimeMillis();
        Proveedor p = new Proveedor(null, name, "NIT-123", "Contacto", "6000000", "p@test.local");
        p = dao.save(p);
        Assertions.assertNotNull(p.getId());
        Integer id = p.getId();

        List<Proveedor> all = dao.findAll();
        Assertions.assertTrue(all.stream().anyMatch(x -> x.getId().equals(id)));

        boolean deleted = dao.delete(id);
        Assertions.assertTrue(deleted);
    }
}
