package com.inventario.persistence;

import com.inventario.model.Compra;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.math.BigDecimal;

public class JdbcCompraDao implements CompraDao {
    private final DataSource ds;

    public JdbcCompraDao(DataSource ds) { this.ds = ds; }
    public JdbcCompraDao() { this.ds = new DriverManagerDataSource(); }

    private Compra map(ResultSet rs) throws SQLException {
        Compra c = new Compra(null, null, rs.getString("proveedor"), rs.getString("productos"), rs.getBigDecimal("total"));
        Timestamp ts = rs.getTimestamp("fecha");
        if (ts != null) c.setFecha(ts.toLocalDateTime());
        try {
            java.lang.reflect.Field f = Compra.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(c, rs.getInt("id"));
        } catch (Exception e) {
            // ignore
        }
        return c;
    }

    @Override
    public List<Compra> findAll() throws SQLException {
        String simple = "SELECT id, fecha, proveedor, productos, total FROM compras ORDER BY id DESC";
        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(simple); ResultSet rs = ps.executeQuery()) {
            List<Compra> list = new ArrayList<>();
            while (rs.next()) list.add(map(rs));
            return list;
        } catch (SQLSyntaxErrorException ex) {
            // fallback to join schema
        }

        String joinSql = "SELECT c.id, c.fecha, COALESCE(pv.empresa, '(Sin proveedor)') AS proveedor, " +
                "GROUP_CONCAT(CONCAT(pr.nombre, ' x', ci.cantidad) SEPARATOR ', ') AS productos, c.total " +
                "FROM compras c " +
                "LEFT JOIN proveedores pv ON c.proveedor_id = pv.id " +
                "LEFT JOIN compra_items ci ON ci.compra_id = c.id " +
                "LEFT JOIN productos pr ON ci.producto_id = pr.id " +
                "GROUP BY c.id ORDER BY c.id DESC";

        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(joinSql); ResultSet rs = ps.executeQuery()) {
            List<Compra> list = new ArrayList<>();
            while (rs.next()) list.add(map(rs));
            return list;
        }
    }

    @Override
    public Optional<Compra> findById(int id) throws SQLException {
        String simple = "SELECT id, fecha, proveedor, productos, total FROM compras WHERE id = ?";
        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(simple)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(map(rs));
                return Optional.empty();
            }
        } catch (SQLSyntaxErrorException ex) {
            // fall through to join
        }

        String joinSql = "SELECT c.id, c.fecha, COALESCE(pv.empresa, '(Sin proveedor)') AS proveedor, " +
                "GROUP_CONCAT(CONCAT(pr.nombre, ' x', ci.cantidad) SEPARATOR ', ') AS productos, c.total " +
                "FROM compras c " +
                "LEFT JOIN proveedores pv ON c.proveedor_id = pv.id " +
                "LEFT JOIN compra_items ci ON ci.compra_id = c.id " +
                "LEFT JOIN productos pr ON ci.producto_id = pr.id " +
                "WHERE c.id = ? GROUP BY c.id";

        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(joinSql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(map(rs));
                return Optional.empty();
            }
        }
    }

    @Override
    public Compra save(Compra c) throws SQLException {
        boolean isInsert = (c.getId() == null || c.getId() == 0);

        // Try legacy schema first
        try {
            if (isInsert) {
                String sql = "INSERT INTO compras (fecha, proveedor, productos, total) VALUES (?, ?, ?, ?)";
                try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setTimestamp(1, c.getFecha() == null ? new Timestamp(System.currentTimeMillis()) : Timestamp.valueOf(c.getFecha()));
                    ps.setString(2, c.getProveedor());
                    ps.setString(3, c.getProductos());
                    ps.setBigDecimal(4, c.getTotal());
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        if (keys.next()) {
                            int id = keys.getInt(1);
                            try {
                                java.lang.reflect.Field f = Compra.class.getDeclaredField("id");
                                f.setAccessible(true);
                                f.set(c, id);
                            } catch (Exception ex) { }
                        }
                    }
                    return c;
                }
            } else {
                String sql = "UPDATE compras SET fecha=?, proveedor=?, productos=?, total=? WHERE id=?";
                try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setTimestamp(1, c.getFecha() == null ? new Timestamp(System.currentTimeMillis()) : Timestamp.valueOf(c.getFecha()));
                    ps.setString(2, c.getProveedor());
                    ps.setString(3, c.getProductos());
                    ps.setBigDecimal(4, c.getTotal());
                    ps.setInt(5, c.getId());
                    ps.executeUpdate();
                    return c;
                }
            }
        } catch (SQLSyntaxErrorException ex) {
            // Legacy columns not present. If this is an update (not insert), persist total/fecha into modern `compras`.
            if (!isInsert) {
                String upd = "UPDATE compras SET fecha = ?, total = ? WHERE id = ?";
                try (Connection conn = ds.getConnection(); PreparedStatement psu = conn.prepareStatement(upd)) {
                    psu.setTimestamp(1, c.getFecha() == null ? new Timestamp(System.currentTimeMillis()) : Timestamp.valueOf(c.getFecha()));
                    psu.setBigDecimal(2, c.getTotal() == null ? BigDecimal.ZERO : c.getTotal());
                    psu.setInt(3, c.getId());
                    psu.executeUpdate();
                    return c;
                }
            }
            // otherwise fall through to modern insert handling
        }

        // Modern schema: compras(proveedor_id, total) + compra_items; increase product stock
        try (Connection conn = ds.getConnection()) {
            conn.setAutoCommit(false);
            try {
                Integer proveedorId = null;
                if (c.getProveedor() != null && !c.getProveedor().trim().isEmpty() && !c.getProveedor().startsWith("(Sin proveedor)")) {
                    String q = "SELECT id FROM proveedores WHERE empresa = ? LIMIT 1";
                    try (PreparedStatement ps = conn.prepareStatement(q)) {
                        ps.setString(1, c.getProveedor());
                        try (ResultSet rs = ps.executeQuery()) { if (rs.next()) proveedorId = rs.getInt("id"); }
                    }
                }

                String ins = "INSERT INTO compras (fecha, proveedor_id, total) VALUES (?, ?, ?)";
                try (PreparedStatement ps = conn.prepareStatement(ins, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setTimestamp(1, c.getFecha() == null ? new Timestamp(System.currentTimeMillis()) : Timestamp.valueOf(c.getFecha()));
                    if (proveedorId == null) ps.setNull(2, Types.INTEGER); else ps.setInt(2, proveedorId);
                    ps.setBigDecimal(3, c.getTotal() == null ? BigDecimal.ZERO : c.getTotal());
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        if (keys.next()) {
                            int id = keys.getInt(1);
                            try { java.lang.reflect.Field f = Compra.class.getDeclaredField("id"); f.setAccessible(true); f.set(c, id); } catch (Exception ex) { }
                        }
                    }
                }

                // Parse productos and insert compra_items, increment stock
                String productosStr = c.getProductos() == null ? "" : c.getProductos();
                if (!productosStr.trim().isEmpty()) {
                    String[] items = productosStr.split(",\\s*");
                    Pattern p = Pattern.compile("^(.+) x(\\d+).*$");
                    for (String it : items) {
                        Matcher m = p.matcher(it);
                        if (!m.matches()) continue;
                        String prodName = m.group(1).trim();
                        int qty = Integer.parseInt(m.group(2));
                        if (qty <= 0) { conn.rollback(); throw new IllegalArgumentException("Cantidad inválida para producto: " + prodName); }

                        Integer prodId = null;
                        BigDecimal precioUnit = BigDecimal.ZERO;
                        String find = "SELECT id, precio_compra FROM productos WHERE nombre = ? LIMIT 1";
                        try (PreparedStatement psf = conn.prepareStatement(find)) {
                            psf.setString(1, prodName);
                            try (ResultSet rs = psf.executeQuery()) {
                                if (rs.next()) { prodId = rs.getInt("id"); precioUnit = rs.getBigDecimal("precio_compra"); }
                            }
                        }
                        if (prodId == null) continue;

                        String insItem = "INSERT INTO compra_items (compra_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)";
                        try (PreparedStatement psi = conn.prepareStatement(insItem)) {
                            psi.setInt(1, c.getId());
                            psi.setInt(2, prodId);
                            psi.setInt(3, qty);
                            psi.setBigDecimal(4, precioUnit == null ? BigDecimal.ZERO : precioUnit);
                            psi.executeUpdate();
                        }

                        // increment stock
                        String updStock = "UPDATE productos SET stock = stock + ? WHERE id = ?";
                        try (PreparedStatement psu = conn.prepareStatement(updStock)) {
                            psu.setInt(1, qty);
                            psu.setInt(2, prodId);
                            psu.executeUpdate();
                        }
                    }
                }

                conn.commit();
                return c;
            } catch (Exception ex) {
                conn.rollback();
                if (ex instanceof SQLException) throw (SQLException) ex;
                throw new SQLException(ex);
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    @Override
    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM compras WHERE id = ?";
        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }
}
