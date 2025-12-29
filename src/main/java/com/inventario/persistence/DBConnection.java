package com.inventario.persistence;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException ignored) {
        }
        // Load defaults from classpath db.properties if no system props provided
        try (java.io.InputStream in = DBConnection.class.getResourceAsStream("/db.properties")) {
            if (in != null) {
                java.util.Properties p = new java.util.Properties();
                p.load(in);
                if (System.getProperty("jdbc.url") == null) System.setProperty("jdbc.url", p.getProperty("jdbc.url", ""));
                if (System.getProperty("jdbc.user") == null) System.setProperty("jdbc.user", p.getProperty("jdbc.user", ""));
                if (System.getProperty("jdbc.pass") == null) System.setProperty("jdbc.pass", p.getProperty("jdbc.pass", ""));
            }
        } catch (Exception ignored) {
        }
    }

    public static Connection getConnection() throws SQLException {
        String url = System.getProperty("jdbc.url", "jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false");
        String user = System.getProperty("jdbc.user", "root");
        String pass = System.getProperty("jdbc.pass", "");
        return DriverManager.getConnection(url, user, pass);
    }
}
