package com.inventario.persistence;

import com.inventario.model.Proveedor;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class JdbcProveedorDao implements ProveedorDao {
    private final DataSource ds;

    public JdbcProveedorDao(DataSource ds) {
        this.ds = ds;
    }

    public JdbcProveedorDao() {
        this.ds = new DriverManagerDataSource();
    }

    private Proveedor map(ResultSet rs) throws SQLException {
        Proveedor p = new Proveedor(rs.getInt("id"), rs.getString("empresa"), rs.getString("nit"), rs.getString("contacto"), rs.getString("telefono"), rs.getString("email"));
        return p;
    }

    @Override
    public List<Proveedor> findAll() throws SQLException {
        String sql = "SELECT id, empresa, nit, contacto, telefono, email FROM proveedores ORDER BY id";
        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            List<Proveedor> list = new ArrayList<>();
            while (rs.next()) list.add(map(rs));
            return list;
        }
    }

    @Override
    public Optional<Proveedor> findById(int id) throws SQLException {
        String sql = "SELECT id, empresa, nit, contacto, telefono, email FROM proveedores WHERE id = ?";
        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(map(rs));
                return Optional.empty();
            }
        }
    }

    @Override
    public Proveedor save(Proveedor p) throws SQLException {
        if (p.getId() == null || p.getId() == 0) {
            String sql = "INSERT INTO proveedores (empresa, nit, contacto, telefono, email) VALUES (?, ?, ?, ?, ?)";
            try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, p.getEmpresa());
                ps.setString(2, p.getNit());
                ps.setString(3, p.getContacto());
                ps.setString(4, p.getTelefono());
                ps.setString(5, p.getEmail());
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) {
                        int id = keys.getInt(1);
                        try {
                            java.lang.reflect.Field f = Proveedor.class.getDeclaredField("id");
                            f.setAccessible(true);
                            f.set(p, id);
                        } catch (Exception ex) {
                            // ignore
                        }
                    }
                }
                return p;
            }
        } else {
            String sql = "UPDATE proveedores SET empresa=?, nit=?, contacto=?, telefono=?, email=? WHERE id=?";
            try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, p.getEmpresa());
                ps.setString(2, p.getNit());
                ps.setString(3, p.getContacto());
                ps.setString(4, p.getTelefono());
                ps.setString(5, p.getEmail());
                ps.setInt(6, p.getId());
                ps.executeUpdate();
                return p;
            }
        }
    }

    @Override
    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM proveedores WHERE id = ?";
        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }
}
