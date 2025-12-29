package com.inventario.model;

public class Proveedor {
    private Integer id;
    private String empresa;
    private String nit;
    private String contacto;
    private String telefono;
    private String email;

    protected Proveedor() {}

    public Proveedor(Integer id, String empresa, String nit, String contacto,
                    String telefono, String email) {
        this.id = id;
        this.empresa = empresa;
        this.nit = nit;
        this.contacto = contacto;
        this.telefono = telefono;
        this.email = email;
    }

    public Integer getId() { return id; }
    public String getEmpresa() { return empresa; }
    public String getNit() { return nit; }
    public String getContacto() { return contacto; }
    public String getTelefono() { return telefono; }
    public String getEmail() { return email; }

    // Setters
    public void setEmpresa(String empresa) { this.empresa = empresa; }
    public void setNit(String nit) { this.nit = nit; }
    public void setContacto(String contacto) { this.contacto = contacto; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public void setEmail(String email) { this.email = email; }
}
