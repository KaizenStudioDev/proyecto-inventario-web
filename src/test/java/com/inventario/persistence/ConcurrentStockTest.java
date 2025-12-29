package com.inventario.persistence;

import com.inventario.model.Producto;
import com.inventario.model.Venta;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.*;

public class ConcurrentStockTest {

    private DataSource ds;
    private JdbcProductoDao productoDao;
    private JdbcVentaDao ventaDao;
    private Producto product;

    @BeforeEach
    public void setup() throws Exception {
        System.setProperty("jdbc.url", System.getProperty("jdbc.url", "jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false"));
        System.setProperty("jdbc.user", System.getProperty("jdbc.user", "root"));
        System.setProperty("jdbc.pass", System.getProperty("jdbc.pass", ""));
        ds = DataSourceFactory.getDataSource();
        productoDao = new JdbcProductoDao(ds);
        ventaDao = new JdbcVentaDao(ds);

        product = new Producto(null, "CONC-PROD-TEST", "Test", new BigDecimal("1.00"), new BigDecimal("2.00"), 5, 1);
        productoDao.save(product);
    }

    @AfterEach
    public void cleanup() throws Exception {
        try {
            // Attempt to remove created ventas referencing this product
            // NOTE: tests may leave venta records; try best-effort cleanup
            productoDao.delete(product.getId());
        } catch (Exception ex) {
            // ignore
        }
        try { DataSourceFactory.close(); } catch (Exception e) { }
    }

    @Test
    public void concurrentSalesShouldNotOversell() throws Exception {
        int initialStock = 5;
        int threads = 10;
        ExecutorService ex = Executors.newFixedThreadPool(threads);
        Queue<Integer> created = new ConcurrentLinkedQueue<>();
        List<Future<?>> futures = new ArrayList<>();

        for (int i = 0; i < threads; i++) {
            futures.add(ex.submit(() -> {
                try {
                    Venta v = new Venta(null, LocalDateTime.now(), "Cliente Test", product.getNombre() + " x1", new BigDecimal("2.00"), "Completada");
                    ventaDao.save(v);
                    if (v.getId() != null) created.add(v.getId());
                } catch (Exception exx) {
                    // expected when stock insufficient
                }
            }));
        }

        for (Future<?> f : futures) f.get(10, TimeUnit.SECONDS);
        ex.shutdown();
        ex.awaitTermination(5, TimeUnit.SECONDS);

        // number of successful ventas must be <= initial stock
        Assertions.assertTrue(created.size() <= initialStock, "More sales recorded than stock available");

        // final stock should be initialStock - created.size()
        Producto after = productoDao.findById(product.getId()).orElseThrow();
        Assertions.assertEquals(initialStock - created.size(), after.getStock());

        // cleanup ventas
        for (Integer id : created) {
            try { ventaDao.delete(id); } catch (Exception ignore) { }
        }
    }
}
