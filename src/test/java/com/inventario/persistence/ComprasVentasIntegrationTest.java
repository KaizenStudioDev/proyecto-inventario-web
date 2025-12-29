package com.inventario.persistence;

import com.inventario.model.Compra;
import com.inventario.model.Producto;
import com.inventario.model.Venta;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ComprasVentasIntegrationTest {

    @AfterEach
    public void tearDown() {
        try { DataSourceFactory.close(); } catch (Exception ignore) {}
    }

    @Test
    public void compraThenVentaStockBehavior() throws Exception {
        DataSource ds = DataSourceFactory.getDataSource();
        JdbcProductoDao productoDao = new JdbcProductoDao(ds);
        JdbcCompraDao compraDao = new JdbcCompraDao(ds);
        JdbcVentaDao ventaDao = new JdbcVentaDao(ds);

        String name = "INT-PROD-" + System.currentTimeMillis();
        Producto p = new Producto(null, name, "IntTest", new BigDecimal("1.00"), new BigDecimal("2.00"), 0, 1);
        p = productoDao.save(p);
        Integer pid = p.getId();

        // Compra: add 5 units via productos string
        Compra c = new Compra(null, LocalDateTime.now(), null, name + " x5", new BigDecimal("5.00"));
        compraDao.save(c);

        Producto afterCompra = productoDao.findById(pid).orElseThrow();
        Assertions.assertEquals(5, afterCompra.getStock().intValue(), "Stock should increase by 5 after compra");

        // Venta: sell 3 units
        Venta v = new Venta(null, LocalDateTime.now(), "Cliente Test", name + " x3", new BigDecimal("6.00"), "Completada");
        ventaDao.save(v);

        Producto afterVenta = productoDao.findById(pid).orElseThrow();
        Assertions.assertEquals(2, afterVenta.getStock().intValue(), "Stock should be reduced correctly after venta");

        // cleanup
        try { ventaDao.delete(v.getId()); } catch (Exception ignore) {}
        try { compraDao.delete(c.getId()); } catch (Exception ignore) {}
        try { productoDao.delete(pid); } catch (Exception ignore) {}
    }
}
