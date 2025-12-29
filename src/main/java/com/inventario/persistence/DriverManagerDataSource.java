package com.inventario.persistence;

import javax.sql.DataSource;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.SQLFeatureNotSupportedException;
import java.util.logging.Logger;

public class DriverManagerDataSource implements DataSource {
    @Override
    public Connection getConnection() throws SQLException {
        return DBConnection.getConnection();
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        return DBConnection.getConnection();
    }

    @Override
    public PrintWriter getLogWriter() throws SQLException { return null; }

    @Override
    public void setLogWriter(PrintWriter out) throws SQLException { }

    @Override
    public void setLoginTimeout(int seconds) throws SQLException { }

    @Override
    public int getLoginTimeout() throws SQLException { return 0; }

    @Override
    public Logger getParentLogger() throws SQLFeatureNotSupportedException { throw new SQLFeatureNotSupportedException(); }

    @Override
    public <T> T unwrap(Class<T> iface) throws SQLException { throw new SQLException("Not a wrapper"); }

    @Override
    public boolean isWrapperFor(Class<?> iface) throws SQLException { return false; }
}
