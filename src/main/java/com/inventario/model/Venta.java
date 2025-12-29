package com.inventario.model;

public class Venta {
    private Integer id;
    private String cliente;
    private String productos;
    private java.time.LocalDateTime fecha;
        private java.math.BigDecimal total;
    private String estado;

    protected Venta() {}

    public Venta(Integer id, java.time.LocalDateTime fecha, String cliente, String productos,
                java.math.BigDecimal total, String estado) {
        this.id = id;
        this.fecha = fecha;
        this.cliente = cliente;
        this.productos = productos;
        this.total = total;
        this.estado = estado;
    }

    public Integer getId() { return id; }
    public java.time.LocalDateTime getFecha() { return fecha; }
    public String getCliente() { return cliente; }
    public String getProductos() { return productos; }
    public java.math.BigDecimal getTotal() { return total; }
    public String getEstado() { return estado; }

    // Setters
    public void setFecha(java.time.LocalDateTime fecha) { this.fecha = fecha; }
    public void setCliente(String cliente) { this.cliente = cliente; }
    public void setProductos(String productos) { this.productos = productos; }
    public void setTotal(java.math.BigDecimal total) { this.total = total; }
    public void setEstado(String estado) { this.estado = estado; }
}
