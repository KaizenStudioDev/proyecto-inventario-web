package com.inventario.model;

public class Producto {
    private Integer id;
    private String nombre;
    private String categoria;
    private java.math.BigDecimal precioCompra;
    private java.math.BigDecimal precioVenta;
    private Integer stock;
    private Integer stockMinimo;

    protected Producto() {}

    public Producto(Integer id, String nombre, String categoria, java.math.BigDecimal precioCompra,
                   java.math.BigDecimal precioVenta, Integer stock, Integer stockMinimo) {
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precioCompra = precioCompra;
        this.precioVenta = precioVenta;
        this.stock = stock;
        this.stockMinimo = stockMinimo;
    }

    public Integer getId() { return id; }
    public String getNombre() { return nombre; }
    public String getCategoria() { return categoria; }
    public java.math.BigDecimal getPrecioCompra() { return precioCompra; }
    public java.math.BigDecimal getPrecioVenta() { return precioVenta; }
    public Integer getStock() { return stock; }
    public Integer getStockMinimo() { return stockMinimo; }

    // Setters
    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public void setPrecioCompra(java.math.BigDecimal precioCompra) { this.precioCompra = precioCompra; }
    public void setPrecioVenta(java.math.BigDecimal precioVenta) { this.precioVenta = precioVenta; }
    public void setStock(Integer stock) { this.stock = stock; }
    public void setStockMinimo(Integer stockMinimo) { this.stockMinimo = stockMinimo; }
}
