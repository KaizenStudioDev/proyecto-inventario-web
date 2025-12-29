package com.inventario.model;

public class Cliente {
    private Integer id;
    private String nombre;
    private String documento;
    private String telefono;
    private String email;
    private String direccion;

    protected Cliente() {}

    public Cliente(Integer id, String nombre, String documento, String telefono,
                   String email, String direccion) {
        this.id = id;
        this.nombre = nombre;
        this.documento = documento;
        this.telefono = telefono;
        this.email = email;
        this.direccion = direccion;
    }

    public Integer getId() { return id; }
    public String getNombre() { return nombre; }
    public String getDocumento() { return documento; }
    public String getTelefono() { return telefono; }
    public String getEmail() { return email; }
    public String getDireccion() { return direccion; }

    // Setters for JPA and updates
    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setDocumento(String documento) { this.documento = documento; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public void setEmail(String email) { this.email = email; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
}
