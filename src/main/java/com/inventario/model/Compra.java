package com.inventario.model;

public class Compra {
    private Integer id;
    private java.time.LocalDateTime fecha;
    private String proveedor;
    private String productos;
    private java.math.BigDecimal total;

    protected Compra() {}

    public Compra(Integer id, java.time.LocalDateTime fecha, String proveedor, String productos, java.math.BigDecimal total) {
        this.id = id;
        this.fecha = fecha;
        this.proveedor = proveedor;
        this.productos = productos;
        this.total = total;
    }

    public Integer getId() { return id; }
    public java.time.LocalDateTime getFecha() { return fecha; }
    public String getProveedor() { return proveedor; }
    public String getProductos() { return productos; }
    public java.math.BigDecimal getTotal() { return total; }

    // Setters
    public void setFecha(java.time.LocalDateTime fecha) { this.fecha = fecha; }
    public void setProveedor(String proveedor) { this.proveedor = proveedor; }
    public void setProductos(String productos) { this.productos = productos; }
    public void setTotal(java.math.BigDecimal total) { this.total = total; }
}
