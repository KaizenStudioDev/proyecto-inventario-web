package com.inventario.persistence;

import com.inventario.model.Venta;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public interface VentaDao {
    List<Venta> findAll() throws SQLException;
    Optional<Venta> findById(int id) throws SQLException;
    Venta save(Venta v) throws SQLException;
    boolean delete(int id) throws SQLException;
}
