package com.inventario.persistence;

import com.inventario.model.Cliente;

import java.util.List;
import java.util.Optional;

public interface ClienteDao {
    List<Cliente> findAll() throws Exception;
    Optional<Cliente> findById(int id) throws Exception;
    Cliente save(Cliente c) throws Exception;
    boolean delete(int id) throws Exception;
}
