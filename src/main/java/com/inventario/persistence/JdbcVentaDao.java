package com.inventario.persistence;

import com.inventario.model.Venta;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.math.BigDecimal;

public class JdbcVentaDao implements VentaDao {
    private final DataSource ds;

    public JdbcVentaDao(DataSource ds) { this.ds = ds; }
    public JdbcVentaDao() { this.ds = new DriverManagerDataSource(); }

    private Venta map(ResultSet rs) throws SQLException {
        Venta v = new Venta(null, null, rs.getString("cliente"), rs.getString("productos"), rs.getBigDecimal("total"), rs.getString("estado"));
        Timestamp ts = rs.getTimestamp("fecha");
        if (ts != null) v.setFecha(ts.toLocalDateTime());
        try {
            java.lang.reflect.Field f = Venta.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(v, rs.getInt("id"));
        } catch (Exception e) {
            // ignore
        }
        return v;
    }

    @Override
    public List<Venta> findAll() throws SQLException {
        String simple = "SELECT id, fecha, cliente, productos, total, estado FROM ventas ORDER BY id DESC";
        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(simple); ResultSet rs = ps.executeQuery()) {
            List<Venta> list = new ArrayList<>();
            while (rs.next()) list.add(map(rs));
            return list;
        } catch (SQLSyntaxErrorException ex) {
            // fallback to join-based query (cliente_id, venta_items schema)
        }

        String joinSql = "SELECT v.id, v.fecha, COALESCE(c.nombre, '(Sin cliente)') AS cliente, " +
                "GROUP_CONCAT(CONCAT(p.nombre, ' x', vi.cantidad) SEPARATOR ', ') AS productos, v.total, v.estado " +
                "FROM ventas v " +
                "LEFT JOIN clientes c ON v.cliente_id = c.id " +
                "LEFT JOIN venta_items vi ON vi.venta_id = v.id " +
                "LEFT JOIN productos p ON vi.producto_id = p.id " +
                "GROUP BY v.id ORDER BY v.id DESC";

        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(joinSql); ResultSet rs = ps.executeQuery()) {
            List<Venta> list = new ArrayList<>();
            while (rs.next()) list.add(map(rs));
            return list;
        }
    }

    @Override
    public Optional<Venta> findById(int id) throws SQLException {
        String simple = "SELECT id, fecha, cliente, productos, total, estado FROM ventas WHERE id = ?";
        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(simple)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(map(rs));
                return Optional.empty();
            }
        } catch (SQLSyntaxErrorException ex) {
            // fall through to join query
        }

        String joinSql = "SELECT v.id, v.fecha, COALESCE(c.nombre, '(Sin cliente)') AS cliente, " +
                "GROUP_CONCAT(CONCAT(p.nombre, ' x', vi.cantidad) SEPARATOR ', ') AS productos, v.total, v.estado " +
                "FROM ventas v " +
                "LEFT JOIN clientes c ON v.cliente_id = c.id " +
                "LEFT JOIN venta_items vi ON vi.venta_id = v.id " +
                "LEFT JOIN productos p ON vi.producto_id = p.id " +
                "WHERE v.id = ? GROUP BY v.id";

        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(joinSql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(map(rs));
                return Optional.empty();
            }
        }
    }

    @Override
    public Venta save(Venta v) throws SQLException {
        // Validate minimal rules: no negative total
        if (v.getTotal() != null && v.getTotal().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Total cannot be negative");
        }

        boolean isInsert = (v.getId() == null || v.getId() == 0);

        // Try legacy schema first (columns 'cliente' and 'productos')
        try {
            if (isInsert) {
                String sql = "INSERT INTO ventas (fecha, cliente, productos, total, estado) VALUES (?, ?, ?, ?, ?)";
                try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setTimestamp(1, v.getFecha() == null ? new Timestamp(System.currentTimeMillis()) : Timestamp.valueOf(v.getFecha()));
                    ps.setString(2, v.getCliente());
                    ps.setString(3, v.getProductos());
                    ps.setBigDecimal(4, v.getTotal());
                    ps.setString(5, v.getEstado());
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        if (keys.next()) {
                            int id = keys.getInt(1);
                            try {
                                java.lang.reflect.Field f = Venta.class.getDeclaredField("id");
                                f.setAccessible(true);
                                f.set(v, id);
                            } catch (Exception ex) { }
                        }
                    }
                    return v;
                }
            } else {
                String sql = "UPDATE ventas SET fecha=?, cliente=?, productos=?, total=?, estado=? WHERE id=?";
                try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setTimestamp(1, v.getFecha() == null ? new Timestamp(System.currentTimeMillis()) : Timestamp.valueOf(v.getFecha()));
                    ps.setString(2, v.getCliente());
                    ps.setString(3, v.getProductos());
                    ps.setBigDecimal(4, v.getTotal());
                    ps.setString(5, v.getEstado());
                    ps.setInt(6, v.getId());
                    ps.executeUpdate();
                    return v;
                }
            }
        } catch (SQLSyntaxErrorException ex) {
            // Legacy columns not present. If this is an update (not insert), perform a simple
            // UPDATE against the modern `ventas` table to persist fields such as total/fecha/estado.
            if (!isInsert) {
                String upd = "UPDATE ventas SET fecha = ?, total = ?, estado = ? WHERE id = ?";
                try (Connection conn = ds.getConnection(); PreparedStatement psu = conn.prepareStatement(upd)) {
                    psu.setTimestamp(1, v.getFecha() == null ? new Timestamp(System.currentTimeMillis()) : Timestamp.valueOf(v.getFecha()));
                    psu.setBigDecimal(2, v.getTotal() == null ? BigDecimal.ZERO : v.getTotal());
                    psu.setString(3, v.getEstado());
                    psu.setInt(4, v.getId());
                    psu.executeUpdate();
                    return v;
                }
            }
            // otherwise fall through to modern insert handling
        }

        // Modern schema handling: ventas(cliente_id, total, estado) + venta_items
        // We need to map cliente name -> cliente_id (if possible) and parse productos string into items
        try (Connection conn = ds.getConnection()) {
            conn.setAutoCommit(false);
            try {
                Integer clienteId = null;
                if (v.getCliente() != null && !v.getCliente().trim().isEmpty() && !v.getCliente().startsWith("(Sin cliente)")) {
                    String q = "SELECT id FROM clientes WHERE nombre = ? LIMIT 1";
                    try (PreparedStatement ps = conn.prepareStatement(q)) {
                        ps.setString(1, v.getCliente());
                        try (ResultSet rs = ps.executeQuery()) { if (rs.next()) clienteId = rs.getInt("id"); }
                    }
                }

                String ins = "INSERT INTO ventas (fecha, cliente_id, total, estado) VALUES (?, ?, ?, ?)";
                try (PreparedStatement ps = conn.prepareStatement(ins, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setTimestamp(1, v.getFecha() == null ? new Timestamp(System.currentTimeMillis()) : Timestamp.valueOf(v.getFecha()));
                    if (clienteId == null) ps.setNull(2, Types.INTEGER); else ps.setInt(2, clienteId);
                    ps.setBigDecimal(3, v.getTotal() == null ? BigDecimal.ZERO : v.getTotal());
                    ps.setString(4, v.getEstado());
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        if (keys.next()) {
                            int id = keys.getInt(1);
                            try { java.lang.reflect.Field f = Venta.class.getDeclaredField("id"); f.setAccessible(true); f.set(v, id); } catch (Exception ex) { }
                        }
                    }
                }

                // Parse productos string into items and insert into venta_items
                String productosStr = v.getProductos() == null ? "" : v.getProductos();
                if (!productosStr.trim().isEmpty()) {
                    // expected item format: "Product Name x<qty> (...)" separated by ", "
                    String[] items = productosStr.split(",\\s*");
                    Pattern p = Pattern.compile("^(.+) x(\\d+).*$");
                    for (String it : items) {
                        Matcher m = p.matcher(it);
                        if (!m.matches()) continue;
                        String prodName = m.group(1).trim();
                        int qty = Integer.parseInt(m.group(2));
                        if (qty <= 0) {
                            conn.rollback();
                            throw new IllegalArgumentException("Cantidad inválida para producto: " + prodName);
                        }

                        // lookup product id and price (do NOT rely on separate stock check)
                        Integer prodId = null;
                        BigDecimal precioUnit = BigDecimal.ZERO;
                        String find = "SELECT id, precio_venta FROM productos WHERE nombre = ? LIMIT 1";
                        try (PreparedStatement psf = conn.prepareStatement(find)) {
                            psf.setString(1, prodName);
                            try (ResultSet rs = psf.executeQuery()) {
                                if (rs.next()) {
                                    prodId = rs.getInt("id");
                                    precioUnit = rs.getBigDecimal("precio_venta");
                                }
                            }
                        }
                        if (prodId == null) continue; // skip unknown products

                        String insItem = "INSERT INTO venta_items (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)";
                        try (PreparedStatement psi = conn.prepareStatement(insItem)) {
                            psi.setInt(1, v.getId());
                            psi.setInt(2, prodId);
                            psi.setInt(3, qty);
                            psi.setBigDecimal(4, precioUnit == null ? BigDecimal.ZERO : precioUnit);
                            psi.executeUpdate();
                        }

                        // decrement stock atomically with conditional update to avoid race conditions
                        String updStock = "UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?";
                        try (PreparedStatement psu = conn.prepareStatement(updStock)) {
                            psu.setInt(1, qty);
                            psu.setInt(2, prodId);
                            psu.setInt(3, qty);
                            int updated = psu.executeUpdate();
                            if (updated == 0) {
                                conn.rollback();
                                throw new IllegalStateException("Stock insuficiente para producto: " + prodName);
                            }
                        }
                    }
                }

                conn.commit();
                return v;
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
        String sql = "DELETE FROM ventas WHERE id = ?";
        try (Connection conn = ds.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }
}
