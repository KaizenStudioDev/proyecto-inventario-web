package com.inventario.persistence;

import com.inventario.model.Producto;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.util.List;

public class ProductosCrudTest {

    @AfterEach
    public void tearDown() {
        try { DataSourceFactory.close(); } catch (Exception ignore) {}
    }

    @Test
    public void crudProducto() throws Exception {
        DataSource ds = DataSourceFactory.getDataSource();
        JdbcProductoDao dao = new JdbcProductoDao(ds);

        String name = "TEST-PROD-" + System.currentTimeMillis();
        Producto p = new Producto(null, name, "TestCat", new BigDecimal("1.00"), new BigDecimal("2.00"), 10, 1);
        p = dao.save(p);
        Assertions.assertNotNull(p.getId());
        Integer id = p.getId();

        List<Producto> all = dao.findAll();
        Assertions.assertTrue(all.stream().anyMatch(x -> x.getId().equals(id)));

        boolean deleted = dao.delete(id);
        Assertions.assertTrue(deleted);
    }
}
