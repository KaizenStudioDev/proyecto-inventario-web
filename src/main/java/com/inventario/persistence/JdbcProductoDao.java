package com.inventario.persistence;

import com.inventario.model.Producto;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class JdbcProductoDao implements ProductoDao {
    private final DataSource ds;

    public JdbcProductoDao(DataSource ds) {
        this.ds = ds;
    }

    public JdbcProductoDao() {
        this.ds = new DriverManagerDataSource();
    }

    private Producto map(ResultSet rs) throws SQLException {
        Producto p = new Producto(rs.getInt("id"), rs.getString("nombre"), rs.getString("categoria"),
                rs.getBigDecimal("precio_compra"), rs.getBigDecimal("precio_venta"), rs.getInt("stock"), rs.getInt("stock_minimo"));
        return p;
    }

    @Override
    public List<Producto> findAll() throws SQLException {
        String sql = "SELECT id, nombre, categoria, precio_compra, precio_venta, stock, stock_minimo FROM productos ORDER BY id";
        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            List<Producto> list = new ArrayList<>();
            while (rs.next()) list.add(map(rs));
            return list;
        }
    }

    @Override
    public Optional<Producto> findById(int id) throws SQLException {
        String sql = "SELECT id, nombre, categoria, precio_compra, precio_venta, stock, stock_minimo FROM productos WHERE id = ?";
        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(map(rs));
                return Optional.empty();
            }
        }
    }

    @Override
    public Producto save(Producto p) throws SQLException {
        if (p.getId() == null || p.getId() == 0) {
            String sql = "INSERT INTO productos (nombre, categoria, precio_compra, precio_venta, stock, stock_minimo) VALUES (?, ?, ?, ?, ?, ?)";
            try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, p.getNombre());
                ps.setString(2, p.getCategoria());
                ps.setBigDecimal(3, p.getPrecioCompra());
                ps.setBigDecimal(4, p.getPrecioVenta());
                ps.setInt(5, p.getStock());
                ps.setInt(6, p.getStockMinimo());
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) {
                        int id = keys.getInt(1);
                        try {
                            java.lang.reflect.Field f = Producto.class.getDeclaredField("id");
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
            String sql = "UPDATE productos SET nombre=?, categoria=?, precio_compra=?, precio_venta=?, stock=?, stock_minimo=? WHERE id=?";
            try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, p.getNombre());
                ps.setString(2, p.getCategoria());
                ps.setBigDecimal(3, p.getPrecioCompra());
                ps.setBigDecimal(4, p.getPrecioVenta());
                ps.setInt(5, p.getStock());
                ps.setInt(6, p.getStockMinimo());
                ps.setInt(7, p.getId());
                ps.executeUpdate();
                return p;
            }
        }
    }

    @Override
    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM productos WHERE id = ?";
        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }
}
