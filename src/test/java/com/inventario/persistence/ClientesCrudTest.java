package com.inventario.persistence;

import com.inventario.model.Cliente;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import javax.sql.DataSource;
import java.util.List;

public class ClientesCrudTest {

    @AfterEach
    public void tearDown() {
        try { DataSourceFactory.close(); } catch (Exception ignore) {}
    }

    @Test
    public void crudCliente() throws Exception {
        DataSource ds = DataSourceFactory.getDataSource();
        JdbcClienteDao dao = new JdbcClienteDao(ds);

        Cliente c = new Cliente(null, "TEST-CLIENTE", "DNI-123", "600000000", "t@test.local", "Calle Test 1");
        c = dao.save(c);
        Assertions.assertNotNull(c.getId(), "ID should be assigned after save");
        Integer id = c.getId();

        List<Cliente> all = dao.findAll();
        Assertions.assertTrue(all.stream().anyMatch(x -> x.getId().equals(id)), "Saved cliente must be in findAll");

        boolean deleted = dao.delete(id);
        Assertions.assertTrue(deleted, "Should delete the client");
    }
}
