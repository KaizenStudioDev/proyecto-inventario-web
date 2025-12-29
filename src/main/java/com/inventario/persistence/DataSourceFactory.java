package com.inventario.persistence;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;

public class DataSourceFactory {
    private static HikariDataSource ds;

    public static DataSource getDataSource() {
        ensureDefaultPropertiesLoaded();

        if (ds == null) {
            HikariConfig cfg = new HikariConfig();
            String url = System.getProperty("jdbc.url", "jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false");
            String user = System.getProperty("jdbc.user", "root");
            String pass = System.getProperty("jdbc.pass", "");
            cfg.setJdbcUrl(url);
            cfg.setUsername(user);
            cfg.setPassword(pass);
            cfg.setMaximumPoolSize(10);
            cfg.setMinimumIdle(1);
            cfg.setPoolName("inventario-pool");
            cfg.addDataSourceProperty("cachePrepStmts", "true");
            cfg.addDataSourceProperty("prepStmtCacheSize", "250");
            cfg.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
            ds = new HikariDataSource(cfg);
        }
        return ds;
    }

    private static void ensureDefaultPropertiesLoaded() {
        String url = System.getProperty("jdbc.url");
        if (url != null && !url.isEmpty()) return;
        try (java.io.InputStream in = DataSourceFactory.class.getResourceAsStream("/db.properties")) {
            if (in == null) return;
            java.util.Properties p = new java.util.Properties();
            p.load(in);
            p.forEach((k, v) -> {
                String key = String.valueOf(k);
                String val = String.valueOf(v);
                if (System.getProperty(key) == null) System.setProperty(key, val);
            });
        } catch (Exception e) {
            // ignore failures to load defaults
        }
    }

    public static void close() {
        if (ds != null) {
            try { ds.close(); } catch (Exception ex) { }
            ds = null;
            // Try to shutdown MySQL's abandoned connection cleanup thread to avoid warnings
            try {
                com.mysql.cj.jdbc.AbandonedConnectionCleanupThread.checkedShutdown();
            } catch (Throwable t) {
                // ignore if driver not present or method unavailable
            }
        }
    }
}
