package com.inventario.persistence;

import com.inventario.model.Cliente;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class JdbcClienteDao implements ClienteDao {
    private final DataSource ds;

    public JdbcClienteDao(DataSource ds) {
        this.ds = ds;
    }

    /**
     * Convenience constructor that uses a DriverManager-backed DataSource (DBConnection) for quick tests.
     */
    public JdbcClienteDao() {
        this.ds = new DriverManagerDataSource();
    }

    private Cliente map(ResultSet rs) throws SQLException {
        Cliente c = new Cliente(null,
                rs.getString("nombre"),
                rs.getString("documento"),
                rs.getString("telefono"),
                rs.getString("email"),
                rs.getString("direccion")
        );
        try {
            java.lang.reflect.Field f = Cliente.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(c, rs.getInt("id"));
        } catch (Exception e) {
            // ignore
        }
        return c;
    }

    @Override
    public List<Cliente> findAll() throws SQLException {
        String sql = "SELECT id, nombre, documento, telefono, email, direccion FROM clientes ORDER BY id";
        try (Connection conn = ds.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<Cliente> list = new ArrayList<>();
            while (rs.next()) list.add(map(rs));
            return list;
        }
    }

    @Override
    public Optional<Cliente> findById(int id) throws SQLException {
        String sql = "SELECT id, nombre, documento, telefono, email, direccion FROM clientes WHERE id = ?";
        try (Connection conn = ds.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(map(rs));
                return Optional.empty();
            }
        }
    }

    @Override
    public Cliente save(Cliente c) throws SQLException {
        if (c.getId() == null || c.getId() == 0) {
            String sql = "INSERT INTO clientes (nombre, documento, telefono, email, direccion) VALUES (?, ?, ?, ?, ?)";
            try (Connection conn = ds.getConnection();
                 PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, c.getNombre());
                ps.setString(2, c.getDocumento());
                ps.setString(3, c.getTelefono());
                ps.setString(4, c.getEmail());
                ps.setString(5, c.getDireccion());
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) {
                        int id = keys.getInt(1);
                        try {
                            java.lang.reflect.Field f = Cliente.class.getDeclaredField("id");
                            f.setAccessible(true);
                            f.set(c, id);
                        } catch (Exception ex) {
                            // ignore
                        }
                    }
                }
                return c;
            }
        } else {
            String sql = "UPDATE clientes SET nombre=?, documento=?, telefono=?, email=?, direccion=? WHERE id=?";
            try (Connection conn = ds.getConnection();
                 PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, c.getNombre());
                ps.setString(2, c.getDocumento());
                ps.setString(3, c.getTelefono());
                ps.setString(4, c.getEmail());
                ps.setString(5, c.getDireccion());
                ps.setInt(6, c.getId());
                ps.executeUpdate();
                return c;
            }
        }
    }

    @Override
    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM clientes WHERE id = ?";
        try (Connection conn = ds.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }
}
