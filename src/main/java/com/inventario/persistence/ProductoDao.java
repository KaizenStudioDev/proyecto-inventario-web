package com.inventario.persistence;

import com.inventario.model.Producto;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public interface ProductoDao {
    List<Producto> findAll() throws SQLException;
    Optional<Producto> findById(int id) throws SQLException;
    Producto save(Producto p) throws SQLException;
    boolean delete(int id) throws SQLException;
}
