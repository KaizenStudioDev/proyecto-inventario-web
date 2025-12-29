package com.inventario.persistence;

import com.inventario.model.Compra;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public interface CompraDao {
    List<Compra> findAll() throws SQLException;
    Optional<Compra> findById(int id) throws SQLException;
    Compra save(Compra c) throws SQLException;
    boolean delete(int id) throws SQLException;
}
