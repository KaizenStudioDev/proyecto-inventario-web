package com.inventario.persistence;

import com.inventario.model.Proveedor;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public interface ProveedorDao {
    List<Proveedor> findAll() throws SQLException;
    Optional<Proveedor> findById(int id) throws SQLException;
    Proveedor save(Proveedor p) throws SQLException;
    boolean delete(int id) throws SQLException;
}
