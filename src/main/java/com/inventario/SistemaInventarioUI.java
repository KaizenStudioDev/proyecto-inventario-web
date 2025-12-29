package com.inventario;

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.Stage;
import javafx.stage.Modality;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.collections.transformation.FilteredList;
import javafx.collections.ListChangeListener;
import java.time.DayOfWeek;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.EnumMap;
import java.util.Map;
import java.util.Comparator;
import javafx.beans.binding.Bindings;
import com.inventario.model.Cliente;
import com.inventario.model.Producto;
import com.inventario.model.Venta;
import com.inventario.model.Proveedor;
import com.inventario.model.Compra;
import com.inventario.persistence.ClienteDao;
import com.inventario.persistence.JdbcClienteDao;
import com.inventario.persistence.DataSourceFactory;
import com.inventario.persistence.ProductoDao;
import com.inventario.persistence.ProveedorDao;
import com.inventario.persistence.JdbcProductoDao;
import com.inventario.persistence.JdbcProveedorDao;
import com.inventario.persistence.VentaDao;
import com.inventario.persistence.CompraDao;
import com.inventario.persistence.JdbcVentaDao;
import com.inventario.persistence.JdbcCompraDao;

/**
 * Sistema de Gestión de Inventarios - JavaFX
 * UI Prototype para Documentación (Sprint 1)
 * @author Sistema de Inventarios
 * @version 1.0
 */
public class SistemaInventarioUI extends Application {

    // Thresholds used for stock classification and coloring
    private static final int STOCK_THRESHOLD_LOW = 10;   // red: sin stock or very low
    private static final int STOCK_THRESHOLD_MED = 20;   // yellow: low

    private enum StockStatus { SIN_STOCK, BAJO, ALTO }

    /**
     * Classify stock using product-specific threshold.
     * New rule (requested):
     * - SIN_STOCK: stock == 0
     * - STOCK BAJO: stock <= stockMinimo + 15 (i.e. "near" the minimum)
     * - STOCK NORMAL: stock > stockMinimo + 15
     *
     * If `stockMinimo` is missing, fall back to the previous constants
     * (>= STOCK_THRESHOLD_MED -> ALTO, else BAJO).
     */
    private StockStatus classifyStock(Producto p) {
        if (p == null) return StockStatus.SIN_STOCK;
        Integer stockObj = p.getStock();
        int stock = stockObj == null ? 0 : stockObj;
        if (stock == 0) return StockStatus.SIN_STOCK;
        Integer stockMinObj = p.getStockMinimo();
        if (stockMinObj != null) {
            int threshold = stockMinObj + 15; // near minimum
            if (stock <= threshold) return StockStatus.BAJO;
            else return StockStatus.ALTO;
        }
        // fallback when no stockMinimo is available
        if (stock >= STOCK_THRESHOLD_MED) return StockStatus.ALTO;
        return StockStatus.BAJO;
    }

    // Format BigDecimal as integer with dot as thousands separator: 1000000 -> "1.000.000"
    private String formatWithDots(java.math.BigDecimal amount) {
        if (amount == null) return "0";
        java.math.BigDecimal rounded = amount.setScale(0, java.math.RoundingMode.HALF_UP);
        long val = 0L;
        try { val = rounded.longValueExact(); } catch (Exception ex) { val = rounded.longValue(); }
        DecimalFormatSymbols symbols = new DecimalFormatSymbols();
        symbols.setGroupingSeparator('.');
        symbols.setDecimalSeparator(',');
        DecimalFormat df = new DecimalFormat("#,##0", symbols);
        return df.format(val);
    }

    // For table cells (ventas/compras) show full formatted amount with $ and dots
    private String formatCurrencyForCell(java.math.BigDecimal amount) {
        return "$" + formatWithDots(amount);
    }

    // For dashboard: compact formatting when >= 1_000_000 (K, M, B). Under 1M show full with dots.
    private String formatCurrencyCompact(java.math.BigDecimal amount) {
        if (amount == null) return "$0";
        java.math.BigDecimal abs = amount.abs();
        java.math.BigDecimal million = java.math.BigDecimal.valueOf(1_000_000L);
        if (abs.compareTo(million) < 0) {
            return "$" + formatWithDots(amount);
        }
        // suffixes in thousands
        String[] suffix = new String[] {"", "K", "M", "B", "T"};
        double val = amount.doubleValue();
        int exp = (int) Math.floor(Math.log10(Math.abs(val)) / 3.0);
        if (exp < 1) exp = 1;
        if (exp >= suffix.length) exp = suffix.length - 1;
        double scaled = val / Math.pow(1000, exp);
        String fmt;
        if (scaled >= 10 || Math.abs(scaled - Math.round(scaled)) < 0.01) fmt = String.format("%.0f", scaled);
        else fmt = String.format("%.1f", scaled);
        return "$" + fmt + suffix[exp];
    }


    private BorderPane mainLayout;
    private Stage primaryStage;
    private Button btnDashboard, btnClientes, btnProveedores, btnProductos, btnVentas, btnCompras;
    // Datos en memoria (Sprint 1): listas observables para clientes, proveedores y productos
    private ObservableList<Cliente> clientesList = FXCollections.observableArrayList();
    private ObservableList<Proveedor> proveedoresList = FXCollections.observableArrayList();
    private ObservableList<Producto> productosList = FXCollections.observableArrayList();
    private ObservableList<Venta> ventasList = FXCollections.observableArrayList();
    private ObservableList<Compra> comprasList = FXCollections.observableArrayList();

    private TableView<Cliente> tablaClientes;
    private TableView<Proveedor> tablaProveedores;
    private TableView<Producto> tablaProductos;
    // DAOs are initialized in start() to avoid connecting to the DB during class construction
    private ClienteDao clienteDao;
    private ProductoDao productoDao;
    private ProveedorDao proveedorDao;
    private VentaDao ventaDao;
    private CompraDao compraDao;

    @Override
    public void start(Stage stage) {
        this.primaryStage = stage;
        primaryStage.setTitle("Sistema de Gestión de Inventarios");
        // Initialize DAOs now (after JVM properties are available). If pool init fails,
        // fall back to DriverManager-backed DAOs or leave demo data in-memory.
        try {
            javax.sql.DataSource ds = DataSourceFactory.getDataSource();
            clienteDao = new JdbcClienteDao(ds);
            productoDao = new JdbcProductoDao(ds);
            proveedorDao = new JdbcProveedorDao(ds);
            ventaDao = new JdbcVentaDao(ds);
            compraDao = new JdbcCompraDao(ds);
        } catch (Throwable t) {
            // Pool initialization failed (likely DB credentials). Use DriverManager fallback DAOs.
            clienteDao = new JdbcClienteDao();
            productoDao = new JdbcProductoDao();
            proveedorDao = new JdbcProveedorDao();
            ventaDao = new JdbcVentaDao();
            compraDao = new JdbcCompraDao();
        }

        // Load data from persistence; if DB is unavailable, keep demo data.
        try {
            if (clienteDao != null) {
                clientesList.setAll(clienteDao.findAll());
                System.out.println("[DEBUG] Loaded clientes from DB: " + clientesList.size());
            }
            if (proveedorDao != null) {
                try { proveedoresList.setAll(proveedorDao.findAll()); } catch (Exception _e) { /* ignore */ }
            }
            if (productoDao != null) {
                try { productosList.setAll(productoDao.findAll()); } catch (Exception _e) { /* ignore */ }
            }
            if (ventaDao != null) {
                try { ventasList.setAll(ventaDao.findAll()); } catch (Exception _e) { /* ignore */ }
            }
            if (compraDao != null) {
                try { comprasList.setAll(compraDao.findAll()); } catch (Exception _e) { /* ignore */ }
            }
        } catch (Exception ex) {
            System.err.println("[DEBUG] Error loading clientes from DB: " + ex.getMessage());
            ex.printStackTrace(System.err);
        }
        // Initial recompute and automatic updates: whenever productosList changes, recompute totals
        try {
            recalcAllTotals();
        } catch (Exception ignore) {}
        productosList.addListener((ListChangeListener<Producto>) c -> recalcAllTotals());
        
        mainLayout = new BorderPane();
        mainLayout.setTop(crearBarraSuperior());
        activarBotonMenu(btnDashboard);
        mainLayout.setCenter(crearDashboard());
        
        Scene scene = new Scene(mainLayout, 1400, 800);
        primaryStage.setScene(scene);
        primaryStage.setMaximized(true);
        primaryStage.show();
    }

    private VBox crearBarraSuperior() {
        VBox topBar = new VBox();
        topBar.setStyle("-fx-background-color: #2C3E50;");
        topBar.setPadding(new Insets(0));
        
        Label titulo = new Label("SISTEMA DE GESTIÓN DE INVENTARIOS");
        titulo.setFont(Font.font("Arial", FontWeight.BOLD, 20));
        titulo.setTextFill(Color.WHITE);
        titulo.setPadding(new Insets(15, 20, 15, 20));
        
        HBox menuBar = new HBox(10);
        menuBar.setAlignment(Pos.CENTER_LEFT);
        menuBar.setPadding(new Insets(10, 20, 10, 20));
        menuBar.setStyle("-fx-background-color: #34495E;");
        
        btnDashboard = crearBotonMenu("📊 Dashboard", true);
        btnClientes = crearBotonMenu("👥 Clientes", false);
        btnProveedores = crearBotonMenu("🏢 Proveedores", false);
        btnProductos = crearBotonMenu("📦 Productos", false);
        btnVentas = crearBotonMenu("💰 Ventas", false);
        btnCompras = crearBotonMenu("🛒 Compras", false);
        
        btnDashboard.setOnAction(e -> {
            activarBotonMenu(btnDashboard);
            mainLayout.setCenter(crearDashboard());
        });
        btnClientes.setOnAction(e -> {
            activarBotonMenu(btnClientes);
            mainLayout.setCenter(crearModuloClientes());
        });
        btnProveedores.setOnAction(e -> {
            activarBotonMenu(btnProveedores);
            mainLayout.setCenter(crearModuloProveedores());
        });
        btnProductos.setOnAction(e -> {
            activarBotonMenu(btnProductos);
            mainLayout.setCenter(crearModuloProductos());
        });
        btnVentas.setOnAction(e -> {
            activarBotonMenu(btnVentas);
            mainLayout.setCenter(crearModuloVentas());
        });
        btnCompras.setOnAction(e -> {
            activarBotonMenu(btnCompras);
            mainLayout.setCenter(crearModuloCompras());
        });
        
        menuBar.getChildren().addAll(btnDashboard, btnClientes, btnProveedores, 
                                    btnProductos, btnVentas, btnCompras);
        
        topBar.getChildren().addAll(titulo, menuBar);
        return topBar;
    }

    private void activarBotonMenu(Button botonActivo) {
        // Desactivar todos los botones
        desactivarBotonMenu(btnDashboard);
        desactivarBotonMenu(btnClientes);
        desactivarBotonMenu(btnProveedores);
        desactivarBotonMenu(btnProductos);
        desactivarBotonMenu(btnVentas);
        desactivarBotonMenu(btnCompras);
        
        // Activar el botón seleccionado con estilo fijo
        botonActivo.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white; " +
                            "-fx-background-radius: 5; -fx-cursor: hand; " +
                            "-fx-font-size: 14px; -fx-padding: 10 20;");
    }

    private void desactivarBotonMenu(Button boton) {
        boton.setStyle("-fx-background-color: transparent; -fx-text-fill: white; " +
                    "-fx-background-radius: 5; -fx-cursor: hand; " +
                    "-fx-font-size: 14px; -fx-padding: 10 20;");
        
        // Volver a configurar eventos hover
        boton.setOnMouseEntered(e -> {
            if (!boton.getStyle().contains("#3498DB") || boton.getStyle().contains("transparent")) {
                boton.setStyle("-fx-background-color: #34495EDD; -fx-text-fill: white; " +
                            "-fx-background-radius: 5; -fx-cursor: hand; " +
                            "-fx-font-size: 14px; -fx-padding: 10 20;");
            }
        });
        boton.setOnMouseExited(e -> {
            if (!boton.getStyle().contains("#3498DB") || boton.getStyle().contains("#34495EDD")) {
                boton.setStyle("-fx-background-color: transparent; -fx-text-fill: white; " +
                            "-fx-background-radius: 5; -fx-cursor: hand; " +
                            "-fx-font-size: 14px; -fx-padding: 10 20;");
            }
        });
    }

    private Button crearBotonMenu(String texto, boolean activo) {
        Button btn = new Button(texto);
        btn.setFont(Font.font("Arial", FontWeight.NORMAL, 14));
        btn.setPrefHeight(40);
        btn.setPadding(new Insets(10, 20, 10, 20));
        btn.setStyle("-fx-background-color: transparent; -fx-text-fill: white; " +
                    "-fx-background-radius: 5; -fx-cursor: hand;");
        
        btn.setOnMouseEntered(e -> {
            if (!btn.getStyle().contains("#3498DB")) {
                btn.setStyle("-fx-background-color: #34495EDD; -fx-text-fill: white; " +
                            "-fx-background-radius: 5; -fx-cursor: hand;");
            }
        });
        btn.setOnMouseExited(e -> {
            if (!btn.getStyle().contains("#3498DB")) {
                btn.setStyle("-fx-background-color: transparent; -fx-text-fill: white; " +
                            "-fx-background-radius: 5; -fx-cursor: hand;");
            }
        });
        
        return btn;
    }

    private VBox crearDashboard() {
        VBox dashboard = new VBox(20);
        dashboard.setPadding(new Insets(30));
        dashboard.setStyle("-fx-background-color: #ECF0F1;");
        
        Label lblTitulo = new Label("📊 DASHBOARD - PANEL DE CONTROL");
        lblTitulo.setFont(Font.font("Arial", FontWeight.BOLD, 24));
        lblTitulo.setTextFill(Color.web("#2C3E50"));
        
        HBox statsCards = new HBox(20);
        statsCards.setAlignment(Pos.CENTER);

        // Productos: mostrar conteo dinámico
        VBox cardProductos = new VBox(10);
        cardProductos.setAlignment(Pos.CENTER);
        cardProductos.setPrefSize(250, 150);
        cardProductos.setStyle("-fx-background-color: white; -fx-background-radius: 10; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        cardProductos.setPadding(new Insets(20));
        Label iconProd = new Label("📦"); iconProd.setFont(Font.font(40));
        Label lblProdValor = new Label(); lblProdValor.setFont(Font.font("Arial", FontWeight.BOLD, 32)); lblProdValor.setTextFill(Color.web("#3498DB"));
        lblProdValor.textProperty().bind(Bindings.size(productosList).asString("%d"));
        Label lblProdLabel = new Label("Productos"); lblProdLabel.setFont(Font.font("Arial", FontWeight.NORMAL, 14)); lblProdLabel.setTextFill(Color.web("#7F8C8D"));
        cardProductos.getChildren().addAll(iconProd, lblProdValor, lblProdLabel);

        // Ventas: total dinámico
        VBox cardVentas = new VBox(10);
        cardVentas.setAlignment(Pos.CENTER);
        cardVentas.setPrefSize(250, 150);
        cardVentas.setStyle("-fx-background-color: white; -fx-background-radius: 10; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        cardVentas.setPadding(new Insets(20));
        Label iconVentas = new Label("💰"); iconVentas.setFont(Font.font(40));
        Label lblVentasValor = new Label(); lblVentasValor.setFont(Font.font("Arial", FontWeight.BOLD, 32)); lblVentasValor.setTextFill(Color.web("#2ECC71"));
        javafx.beans.binding.StringBinding ventasTotalBinding = Bindings.createStringBinding(() -> {
            java.math.BigDecimal total = ventasList.stream().map(v -> {
                try {
                    java.math.BigDecimal recomputed = recomputeTotalFromProductos(v.getProductos(), true);
                    if (recomputed != null) return recomputed;
                } catch (Exception ex) {
                    // swallow and fall back to stored total
                }
                return v.getTotal() == null ? java.math.BigDecimal.ZERO : v.getTotal();
            }).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            return formatCurrencyCompact(total);
        }, ventasList, productosList);
        lblVentasValor.textProperty().bind(ventasTotalBinding);
        Label lblVentasLabel = new Label("Ventas (total)"); lblVentasLabel.setFont(Font.font("Arial", FontWeight.NORMAL, 14)); lblVentasLabel.setTextFill(Color.web("#7F8C8D"));
        cardVentas.getChildren().addAll(iconVentas, lblVentasValor, lblVentasLabel);

        // Stock bajo: contar productos con stock < stockMinimo
        VBox cardStockBajo = new VBox(10);
        cardStockBajo.setAlignment(Pos.CENTER);
        cardStockBajo.setPrefSize(250, 150);
        cardStockBajo.setStyle("-fx-background-color: white; -fx-background-radius: 10; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        cardStockBajo.setPadding(new Insets(20));
        Label iconStock = new Label("⚠"); iconStock.setFont(Font.font(40));
        Label lblStockValor = new Label(); lblStockValor.setFont(Font.font("Arial", FontWeight.BOLD, 32)); lblStockValor.setTextFill(Color.web("#E74C3C"));
        javafx.beans.binding.StringBinding stockBajoBinding = Bindings.createStringBinding(() -> {
            long count = productosList.stream().filter(p -> {
                if (p == null) return false;
                return classifyStock(p) == StockStatus.BAJO;
            }).count();
            return String.valueOf(count);
        }, productosList);
        lblStockValor.textProperty().bind(stockBajoBinding);
        Label lblStockLabel = new Label("Stock Bajo"); lblStockLabel.setFont(Font.font("Arial", FontWeight.NORMAL, 14)); lblStockLabel.setTextFill(Color.web("#7F8C8D"));
        cardStockBajo.getChildren().addAll(iconStock, lblStockValor, lblStockLabel);

        // Clientes: conteo dinámico
        VBox cardClientes = new VBox(10);
        cardClientes.setAlignment(Pos.CENTER);
        cardClientes.setPrefSize(250, 150);
        cardClientes.setStyle("-fx-background-color: white; -fx-background-radius: 10; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        cardClientes.setPadding(new Insets(20));
        Label iconClientes = new Label("👥"); iconClientes.setFont(Font.font(40));
        Label lblClientesValor = new Label(); lblClientesValor.setFont(Font.font("Arial", FontWeight.BOLD, 32)); lblClientesValor.setTextFill(Color.web("#9B59B6"));
        lblClientesValor.textProperty().bind(Bindings.size(clientesList).asString("%d"));
        Label lblClientesLabel = new Label("Clientes"); lblClientesLabel.setFont(Font.font("Arial", FontWeight.NORMAL, 14)); lblClientesLabel.setTextFill(Color.web("#7F8C8D"));
        cardClientes.getChildren().addAll(iconClientes, lblClientesValor, lblClientesLabel);

        statsCards.getChildren().addAll(cardProductos, cardVentas, cardStockBajo, cardClientes);
        
        VBox graficoVentas = crearGraficoVentas();
        VBox alertasStock = crearAlertasStock();

        HBox topRow = new HBox(10, lblTitulo);
        topRow.setAlignment(Pos.CENTER_LEFT);
        
        dashboard.getChildren().addAll(topRow, statsCards, graficoVentas, alertasStock);
        return dashboard;
    }

    private VBox crearCardEstadistica(String icono, String valor, String label, String color) {
        VBox card = new VBox(10);
        card.setAlignment(Pos.CENTER);
        card.setPrefSize(250, 150);
        card.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                     "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        card.setPadding(new Insets(20));
        
        Label lblIcono = new Label(icono);
        lblIcono.setFont(Font.font(40));
        
        Label lblValor = new Label(valor);
        lblValor.setFont(Font.font("Arial", FontWeight.BOLD, 32));
        lblValor.setTextFill(Color.web(color));
        
        Label lblLabel = new Label(label);
        lblLabel.setFont(Font.font("Arial", FontWeight.NORMAL, 14));
        lblLabel.setTextFill(Color.web("#7F8C8D"));
        
        card.getChildren().addAll(lblIcono, lblValor, lblLabel);
        return card;
    }

    private VBox crearGraficoVentas() {
        VBox container = new VBox(15);
        container.setPadding(new Insets(20));
        container.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");

        Label titulo = new Label("📈 Ventas del Mes");
        titulo.setFont(Font.font("Arial", FontWeight.BOLD, 18));

        HBox grafico = new HBox(20);
        grafico.setAlignment(Pos.BOTTOM_CENTER);
        grafico.setPadding(new Insets(20));
        grafico.setStyle("-fx-background-color: #F8F9FA; -fx-background-radius: 5;");
        grafico.setPrefHeight(Region.USE_COMPUTED_SIZE);
        grafico.setMaxHeight(Double.MAX_VALUE);
        HBox.setHgrow(grafico, Priority.ALWAYS);

        // Function to refresh the chart based on ventasList totals by day of week
        Runnable refreshGrafico = () -> {
            grafico.getChildren().clear();
            // initialize totals for each day
            Map<DayOfWeek, BigDecimal> totals = new EnumMap<>(DayOfWeek.class);
            for (DayOfWeek d : DayOfWeek.values()) totals.put(d, BigDecimal.ZERO);

            for (Venta v : ventasList) {
                if (v != null && v.getFecha() != null && v.getTotal() != null) {
                    DayOfWeek dow = v.getFecha().getDayOfWeek();
                    totals.put(dow, totals.get(dow).add(v.getTotal()));
                }
            }

            BigDecimal max = totals.values().stream().max(Comparator.naturalOrder()).orElse(BigDecimal.ONE);
            if (max.compareTo(BigDecimal.ZERO) == 0) max = BigDecimal.ONE;

            DayOfWeek[] order = new DayOfWeek[] { DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                    DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY };
            String[] labels = new String[] { "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom" };

            for (int i = 0; i < order.length; i++) {
                BigDecimal val = totals.get(order[i]);
                double ratio = val.divide(max, 4, RoundingMode.HALF_UP).doubleValue();
                double height = 20 + ratio * 260; // scale between 20 and ~280
                grafico.getChildren().add(crearBarra(labels[i], height, "#3498DB"));
            }
        };

        // Render incial y actualizaciones en vivo
        refreshGrafico.run();
        ventasList.addListener((ListChangeListener<Venta>) c -> refreshGrafico.run());

        container.getChildren().addAll(titulo, grafico);
        return container;
    }

    private VBox crearBarra(String dia, double altura, String color) {
        VBox barra = new VBox(5);
        barra.setAlignment(Pos.BOTTOM_CENTER);
        
        Region bar = new Region();
        bar.setPrefSize(60, altura);
        bar.setStyle("-fx-background-color: " + color + "; -fx-background-radius: 5 5 0 0;");
        
        Label lblDia = new Label(dia);
        lblDia.setFont(Font.font("Arial", FontWeight.NORMAL, 12));
        
        barra.getChildren().addAll(bar, lblDia);
        return barra;
    }

    private VBox crearAlertasStock() {
        VBox alertas = new VBox(15);
        alertas.setPadding(new Insets(20));
        alertas.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");

        Label titulo = new Label("⚠️ Alertas de Stock Bajo");
        titulo.setFont(Font.font("Arial", FontWeight.BOLD, 18));

        VBox container = new VBox(8);

        Runnable refreshAlerts = () -> {
            container.getChildren().clear();
            for (Producto p : productosList) {
                if (p == null) continue;
                StockStatus status = classifyStock(p);
                int stock = p.getStock() == null ? 0 : p.getStock();
                if (status == StockStatus.SIN_STOCK) {
                    container.getChildren().add(crearAlerta(p.getNombre(), stock + " unidades", "#E74C3C"));
                } else if (status == StockStatus.BAJO) {
                    container.getChildren().add(crearAlerta(p.getNombre(), stock + " unidades", "#F39C12"));
                }
            }
            if (container.getChildren().isEmpty()) {
                Label none = new Label("No hay alertas de stock bajo");
                none.setFont(Font.font("Arial", FontWeight.NORMAL, 14));
                none.setTextFill(Color.web("#2C3E50"));
                container.getChildren().add(none);
            }
        };

        // Render incial y actualizaciones en vivo
        refreshAlerts.run();
        productosList.addListener((ListChangeListener<Producto>) c -> refreshAlerts.run());

        // Wrap alerts container in a ScrollPane so the user can scroll with mouse wheel
        ScrollPane scroll = new ScrollPane(container);
        scroll.setFitToWidth(true);
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scroll.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);
        scroll.setPrefViewportHeight(160);

        alertas.getChildren().addAll(titulo, scroll);
        return alertas;
    }

    private HBox crearAlerta(String producto, String stock, String color) {
        HBox alerta = new HBox(15);
        alerta.setAlignment(Pos.CENTER_LEFT);
        alerta.setPadding(new Insets(10));
        alerta.setStyle("-fx-background-color: " + color + "20; -fx-background-radius: 5;");
        
        Label lblProducto = new Label("• " + producto);
        lblProducto.setFont(Font.font("Arial", FontWeight.NORMAL, 14));
        lblProducto.setPrefWidth(300);
        
        Label lblStock = new Label("Stock: " + stock);
        lblStock.setFont(Font.font("Arial", FontWeight.BOLD, 14));
        lblStock.setTextFill(Color.web(color));
        
        alerta.getChildren().addAll(lblProducto, lblStock);
        return alerta;
    }

    private VBox crearModuloClientes() {
        VBox modulo = new VBox(20);
        modulo.setPadding(new Insets(30));
        modulo.setStyle("-fx-background-color: #ECF0F1;");
        
        HBox header = new HBox(20);
        header.setAlignment(Pos.CENTER_LEFT);
        
        Label titulo = new Label("👥 GESTIÓN DE CLIENTES");
        titulo.setFont(Font.font("Arial", FontWeight.BOLD, 24));
        titulo.setTextFill(Color.web("#2C3E50"));
        
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        Button btnNuevo = new Button("+ Nuevo Cliente");
        btnNuevo.setStyle("-fx-background-color: #2ECC71; -fx-text-fill: white; " +
                         "-fx-font-size: 14px; -fx-font-weight: bold; -fx-padding: 10 20; " +
                         "-fx-background-radius: 5; -fx-cursor: hand;");
        btnNuevo.setOnAction(e -> mostrarFormularioCliente(null));
        
        header.getChildren().addAll(titulo, spacer, btnNuevo);
        
        // Banner y controles: mostrar número de clientes y proporcionar una acción de Refrescar
        HBox infoBar = new HBox(10);
        infoBar.setAlignment(Pos.CENTER_LEFT);
        infoBar.setPadding(new Insets(5, 0, 0, 0));

        Label lblBanner = new Label();
        lblBanner.setFont(Font.font("Arial", FontWeight.NORMAL, 14));
        lblBanner.setTextFill(Color.web("#2C3E50"));
        lblBanner.textProperty().bind(Bindings.size(clientesList).asString("Clientes cargados: %d"));

        Region spacerInfo = new Region();
        HBox.setHgrow(spacerInfo, Priority.ALWAYS);

        Button btnRefrescar = new Button("Refrescar");
        btnRefrescar.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white; " +
                            "-fx-font-size: 13px; -fx-padding: 6 14; -fx-background-radius: 4;");
        btnRefrescar.setOnAction(e -> {
            try {
                if (clienteDao != null) clientesList.setAll(clienteDao.findAll());
            } catch (Exception ex) {
                ex.printStackTrace();
                Alert a = new Alert(Alert.AlertType.ERROR);
                a.setTitle("Error al recargar");
                a.setHeaderText(null);
                a.setContentText("No fue posible recargar los clientes: " + ex.getMessage());
                a.showAndWait();
            }
        });

        infoBar.getChildren().addAll(lblBanner, spacerInfo, btnRefrescar);

        HBox searchBar = new HBox(10);
        searchBar.setAlignment(Pos.CENTER_LEFT);
        searchBar.setPadding(new Insets(15));
        searchBar.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                          "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        
        TextField txtBuscar = new TextField();
        txtBuscar.setPromptText("🔍 Buscar por nombre, documento o teléfono...");
        txtBuscar.setPrefWidth(500);
        txtBuscar.setStyle("-fx-font-size: 14px; -fx-padding: 10;");
        
        Button btnBuscar = new Button("Buscar");
        btnBuscar.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white; " +
                          "-fx-font-size: 14px; -fx-padding: 10 20; -fx-background-radius: 5;");
        btnBuscar.setOnAction(e -> {
            String q = txtBuscar.getText().trim().toLowerCase();
            if (q.isEmpty()) {
                tablaClientes.setItems(clientesList);
            } else {
                java.util.List<Cliente> filtered = new java.util.ArrayList<>();
                for (Cliente c : clientesList) {
                    if (c == null) continue;
                    if ((c.getNombre() != null && c.getNombre().toLowerCase().contains(q)) ||
                        (c.getDocumento() != null && c.getDocumento().toLowerCase().contains(q)) ||
                        (c.getTelefono() != null && c.getTelefono().toLowerCase().contains(q))) {
                        filtered.add(c);
                    }
                }
                tablaClientes.setItems(FXCollections.observableArrayList(filtered));
            }
        });

        searchBar.getChildren().addAll(txtBuscar, btnBuscar);
        
        TableView<Cliente> tablaClientes = crearTablaClientes();
        
        modulo.getChildren().addAll(header, infoBar, searchBar, tablaClientes);
        return modulo;
    }

    private void mostrarFormularioCliente(Cliente existing) {
        Stage dialog = new Stage();
        dialog.initModality(Modality.APPLICATION_MODAL);
        dialog.initOwner(primaryStage);
        dialog.setTitle(existing == null ? "Nuevo Cliente" : "Editar Cliente");
        
        VBox dialogVbox = new VBox(20);
        dialogVbox.setPadding(new Insets(30));
        dialogVbox.setStyle("-fx-background-color: #ECF0F1;");
        
        Label titulo = new Label("👥 REGISTRAR NUEVO CLIENTE");
        titulo.setFont(Font.font("Arial", FontWeight.BOLD, 20));
        titulo.setTextFill(Color.web("#2C3E50"));
        
        VBox formContainer = new VBox(15);
        formContainer.setPadding(new Insets(25));
        formContainer.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                              "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        
        GridPane form = new GridPane();
        form.setHgap(15);
        form.setVgap(15);
        
        Label lblNombre = new Label("Nombre Completo:*");
        lblNombre.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtNombre = new TextField();
        txtNombre.setPromptText("Ingrese nombre completo");
        txtNombre.setPrefWidth(350);
        
        Label lblDocumento = new Label("Documento:*");
        lblDocumento.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtDocumento = new TextField();
        txtDocumento.setPromptText("Número de documento");
        txtDocumento.setPrefWidth(350);
        
        Label lblTelefono = new Label("Teléfono:*");
        lblTelefono.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtTelefono = new TextField();
        txtTelefono.setPromptText("Número de teléfono");
        
        Label lblEmail = new Label("Email:");
        lblEmail.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtEmail = new TextField();
        txtEmail.setPromptText("correo@ejemplo.com");
        
        Label lblDireccion = new Label("Dirección:");
        lblDireccion.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtDireccion = new TextField();
        txtDireccion.setPromptText("Dirección completa");
        txtDireccion.setPrefWidth(350);
        
        form.add(lblNombre, 0, 0);
        form.add(txtNombre, 1, 0);
        form.add(lblDocumento, 0, 1);
        form.add(txtDocumento, 1, 1);
        form.add(lblTelefono, 0, 2);
        form.add(txtTelefono, 1, 2);
        form.add(lblEmail, 0, 3);
        form.add(txtEmail, 1, 3);
        form.add(lblDireccion, 0, 4);
        form.add(txtDireccion, 1, 4);

        // prellenado si es edición
        if (existing != null) {
            txtNombre.setText(existing.getNombre());
            txtDocumento.setText(existing.getDocumento());
            txtTelefono.setText(existing.getTelefono());
            txtEmail.setText(existing.getEmail());
            txtDireccion.setText(existing.getDireccion());
        }
        
        HBox footer = new HBox(15);
        footer.setAlignment(Pos.CENTER_RIGHT);
        footer.setPadding(new Insets(15, 0, 0, 0));
        
        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setStyle("-fx-background-color: #95A5A6; -fx-text-fill: white; " +
                            "-fx-font-size: 14px; -fx-padding: 10 25; -fx-background-radius: 5;");
        btnCancelar.setOnAction(e -> dialog.close());
        
        Button btnGuardar = new Button("💾 Guardar Cliente");
        btnGuardar.setStyle("-fx-background-color: #2ECC71; -fx-text-fill: white; " +
                           "-fx-font-size: 14px; -fx-font-weight: bold; -fx-padding: 10 25; -fx-background-radius: 5;");
        btnGuardar.setOnAction(e -> {
            String nombreVal = txtNombre.getText().trim();
            String documentoVal = txtDocumento.getText().trim();
            String telefonoVal = txtTelefono.getText().trim();

            if (nombreVal.isEmpty() || documentoVal.isEmpty() || telefonoVal.isEmpty()) {
                Alert err = new Alert(Alert.AlertType.ERROR);
                err.setTitle("Campos requeridos");
                err.setHeaderText(null);
                err.setContentText("Por favor complete los campos obligatorios: Nombre, Documento y Teléfono.");
                err.showAndWait();
                return;
            }

            try {
                if (existing == null) {
                    // Crear con id nulo para que el DAO realice un INSERT y asigne el id generado
                    Cliente nuevo = new Cliente(null, nombreVal, documentoVal, telefonoVal,
                                                txtEmail.getText().trim(), txtDireccion.getText().trim());
                    clienteDao.save(nuevo);
                } else {
                    // actualizar existente
                    existing.setNombre(nombreVal);
                    existing.setDocumento(documentoVal);
                    existing.setTelefono(telefonoVal);
                    existing.setEmail(txtEmail.getText().trim());
                    existing.setDireccion(txtDireccion.getText().trim());
                    clienteDao.save(existing);
                }
                // Actualizar lista desde la base de datos
                clientesList.setAll(clienteDao.findAll());
            } catch (Exception ex) {
                ex.printStackTrace();
                Alert err = new Alert(Alert.AlertType.ERROR);
                err.setTitle("Error al guardar");
                err.setHeaderText(null);
                err.setContentText("No fue posible guardar el cliente: " + ex.getMessage());
                err.showAndWait();
                return;
            }

            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.setTitle("Cliente Registrado");
            alert.setHeaderText(null);
            alert.setContentText("✅ Cliente registrado exitosamente");
            alert.showAndWait();
            dialog.close();
        });
        
        footer.getChildren().addAll(btnCancelar, btnGuardar);
        
        formContainer.getChildren().addAll(form, footer);
        dialogVbox.getChildren().addAll(titulo, formContainer);
        
        Scene dialogScene = new Scene(dialogVbox, 600, 500);
        dialog.setScene(dialogScene);
        dialog.show();
    }

    private void mostrarFormularioProveedor(Proveedor existing) {
        Stage dialog = new Stage();
        dialog.initModality(Modality.APPLICATION_MODAL);
        dialog.initOwner(primaryStage);
        dialog.setTitle(existing == null ? "Nuevo Proveedor" : "Editar Proveedor");
        
        VBox dialogVbox = new VBox(20);
        dialogVbox.setPadding(new Insets(30));
        dialogVbox.setStyle("-fx-background-color: #ECF0F1;");
        
        Label titulo = new Label("🏢 REGISTRAR NUEVO PROVEEDOR");
        titulo.setFont(Font.font("Arial", FontWeight.BOLD, 20));
        titulo.setTextFill(Color.web("#2C3E50"));
        
        VBox formContainer = new VBox(15);
        formContainer.setPadding(new Insets(25));
        formContainer.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                              "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        
        GridPane form = new GridPane();
        form.setHgap(15);
        form.setVgap(15);
        
        Label lblEmpresa = new Label("Nombre Empresa:*");
        lblEmpresa.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtEmpresa = new TextField();
        txtEmpresa.setPromptText("Razón social de la empresa");
        txtEmpresa.setPrefWidth(350);
        
        Label lblNit = new Label("NIT:*");
        lblNit.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtNit = new TextField();
        txtNit.setPromptText("Número de identificación tributaria");
        txtNit.setPrefWidth(350);
        
        Label lblContacto = new Label("Persona de Contacto:*");
        lblContacto.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtContacto = new TextField();
        txtContacto.setPromptText("Nombre del contacto");
        
        Label lblTelefono = new Label("Teléfono:*");
        lblTelefono.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtTelefono = new TextField();
        txtTelefono.setPromptText("Número de teléfono");
        
        Label lblEmail = new Label("Email:");
        lblEmail.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtEmail = new TextField();
        txtEmail.setPromptText("correo@empresa.com");
        
        Label lblDireccion = new Label("Dirección:");
        lblDireccion.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtDireccion = new TextField();
        txtDireccion.setPromptText("Dirección de la empresa");
        txtDireccion.setPrefWidth(350);
        
        form.add(lblEmpresa, 0, 0);
        form.add(txtEmpresa, 1, 0);
        form.add(lblNit, 0, 1);
        form.add(txtNit, 1, 1);
        form.add(lblContacto, 0, 2);
        form.add(txtContacto, 1, 2);
        form.add(lblTelefono, 0, 3);
        form.add(txtTelefono, 1, 3);
        form.add(lblEmail, 0, 4);
        form.add(txtEmail, 1, 4);
        form.add(lblDireccion, 0, 5);
        form.add(txtDireccion, 1, 5);
        // Prefill when editing
        if (existing != null) {
            txtEmpresa.setText(existing.getEmpresa());
            txtNit.setText(existing.getNit());
            txtContacto.setText(existing.getContacto());
            txtTelefono.setText(existing.getTelefono());
            txtEmail.setText(existing.getEmail());
            // direccion field is present in UI but not in model; ignore if absent
        }
        
        HBox footer = new HBox(15);
        footer.setAlignment(Pos.CENTER_RIGHT);
        footer.setPadding(new Insets(15, 0, 0, 0));
        
        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setStyle("-fx-background-color: #95A5A6; -fx-text-fill: white; " +
                            "-fx-font-size: 14px; -fx-padding: 10 25; -fx-background-radius: 5;");
        btnCancelar.setOnAction(e -> dialog.close());
        
        Button btnGuardar = new Button("💾 Guardar Proveedor");
        btnGuardar.setStyle("-fx-background-color: #2ECC71; -fx-text-fill: white; " +
                           "-fx-font-size: 14px; -fx-font-weight: bold; -fx-padding: 10 25; -fx-background-radius: 5;");
        btnGuardar.setOnAction(e -> {
            String empresaVal = txtEmpresa.getText().trim();
            String nitVal = txtNit.getText().trim();
            String contactoVal = txtContacto.getText().trim();
            String telefonoVal = txtTelefono.getText().trim();

            if (empresaVal.isEmpty() || nitVal.isEmpty() || contactoVal.isEmpty() || telefonoVal.isEmpty()) {
                Alert err = new Alert(Alert.AlertType.ERROR);
                err.setTitle("Campos requeridos");
                err.setHeaderText(null);
                err.setContentText("Por favor complete los campos obligatorios: Empresa, NIT, Contacto y Teléfono.");
                err.showAndWait();
                return;
            }

            try {
                if (existing == null) {
                    Proveedor nuevo = new Proveedor(null, empresaVal, nitVal, contactoVal, telefonoVal, txtEmail.getText().trim());
                    proveedorDao.save(nuevo);
                } else {
                    existing.setEmpresa(empresaVal);
                    existing.setNit(nitVal);
                    existing.setContacto(contactoVal);
                    existing.setTelefono(telefonoVal);
                    existing.setEmail(txtEmail.getText().trim());
                    proveedorDao.save(existing);
                }
                // Refresh proveedores list
                proveedoresList.setAll(proveedorDao.findAll());
                dialog.close();
                activarBotonMenu(btnProveedores);
                mainLayout.setCenter(crearModuloProveedores());
                Alert alert = new Alert(Alert.AlertType.INFORMATION);
                alert.setTitle("Proveedor Registrado");
                alert.setHeaderText(null);
                alert.setContentText("✅ Proveedor registrado exitosamente");
                alert.showAndWait();
            } catch (Exception ex) {
                ex.printStackTrace();
                Alert err = new Alert(Alert.AlertType.ERROR);
                err.setTitle("Error al guardar");
                err.setHeaderText(null);
                err.setContentText("No fue posible guardar el proveedor: " + ex.getMessage());
                err.showAndWait();
            }
        });
        
        footer.getChildren().addAll(btnCancelar, btnGuardar);
        
        formContainer.getChildren().addAll(form, footer);
        dialogVbox.getChildren().addAll(titulo, formContainer);
        
        Scene dialogScene = new Scene(dialogVbox, 650, 550);
        dialog.setScene(dialogScene);
        dialog.show();
    }

    private void mostrarFormularioProducto(Producto existing) {
        Stage dialog = new Stage();
        dialog.initModality(Modality.APPLICATION_MODAL);
        dialog.initOwner(primaryStage);
        dialog.setTitle(existing == null ? "Nuevo Producto" : "Editar Producto");
        
        VBox dialogVbox = new VBox(20);
        dialogVbox.setPadding(new Insets(30));
        dialogVbox.setStyle("-fx-background-color: #ECF0F1;");
        
        Label titulo = new Label("📦 REGISTRAR NUEVO PRODUCTO");
        titulo.setFont(Font.font("Arial", FontWeight.BOLD, 20));
        titulo.setTextFill(Color.web("#2C3E50"));
        
        VBox formContainer = new VBox(15);
        formContainer.setPadding(new Insets(25));
        formContainer.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                              "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        
        GridPane form = new GridPane();
        form.setHgap(15);
        form.setVgap(15);
        
        Label lblNombre = new Label("Nombre Producto:*");
        lblNombre.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtNombre = new TextField();
        txtNombre.setPromptText("Nombre del producto");
        txtNombre.setPrefWidth(350);
        
        Label lblCategoria = new Label("Categoría:*");
        lblCategoria.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        ComboBox<String> cbCategoria = new ComboBox<>();
        cbCategoria.getItems().addAll("Electrónica", "Oficina", "Ferretería", "Hogar", "Otros");
        cbCategoria.setPromptText("Seleccionar categoría");
        cbCategoria.setPrefWidth(350);
        
        Label lblDescripcion = new Label("Descripción:");
        lblDescripcion.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextArea txtDescripcion = new TextArea();
        txtDescripcion.setPromptText("Descripción detallada del producto");
        txtDescripcion.setPrefRowCount(3);
        txtDescripcion.setPrefWidth(350);
        
        Label lblPrecioCompra = new Label("Precio Compra:*");
        lblPrecioCompra.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtPrecioCompra = new TextField();
        txtPrecioCompra.setPromptText("$0.00");
        
        Label lblPrecioVenta = new Label("Precio Venta:*");
        lblPrecioVenta.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtPrecioVenta = new TextField();
        txtPrecioVenta.setPromptText("$0.00");
        
        Label lblStock = new Label("Stock Inicial:*");
        lblStock.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtStock = new TextField();
        txtStock.setPromptText("0");
        
        Label lblStockMin = new Label("Stock Mínimo:*");
        lblStockMin.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        TextField txtStockMin = new TextField();
        txtStockMin.setPromptText("0");
        
        form.add(lblNombre, 0, 0);
        form.add(txtNombre, 1, 0);
        form.add(lblCategoria, 0, 1);
        form.add(cbCategoria, 1, 1);
        form.add(lblDescripcion, 0, 2);
        form.add(txtDescripcion, 1, 2);
        form.add(lblPrecioCompra, 0, 3);
        form.add(txtPrecioCompra, 1, 3);
        form.add(lblPrecioVenta, 0, 4);
        form.add(txtPrecioVenta, 1, 4);
        form.add(lblStock, 0, 5);
        form.add(txtStock, 1, 5);
        form.add(lblStockMin, 0, 6);
        form.add(txtStockMin, 1, 6);

        // Prefill fields when editing
        if (existing != null) {
            txtNombre.setText(existing.getNombre());
            cbCategoria.setValue(existing.getCategoria());
            if (existing.getPrecioCompra() != null) txtPrecioCompra.setText(existing.getPrecioCompra().toString());
            if (existing.getPrecioVenta() != null) txtPrecioVenta.setText(existing.getPrecioVenta().toString());
            if (existing.getStock() != null) txtStock.setText(existing.getStock().toString());
            if (existing.getStockMinimo() != null) txtStockMin.setText(existing.getStockMinimo().toString());
        }
        
        HBox footer = new HBox(15);
        footer.setAlignment(Pos.CENTER_RIGHT);
        footer.setPadding(new Insets(15, 0, 0, 0));
        
        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setStyle("-fx-background-color: #95A5A6; -fx-text-fill: white; " +
                            "-fx-font-size: 14px; -fx-padding: 10 25; -fx-background-radius: 5;");
        btnCancelar.setOnAction(e -> dialog.close());
        
        Button btnGuardar = new Button("💾 Guardar Producto");
        btnGuardar.setStyle("-fx-background-color: #2ECC71; -fx-text-fill: white; " +
                           "-fx-font-size: 14px; -fx-font-weight: bold; -fx-padding: 10 25; -fx-background-radius: 5;");
        btnGuardar.setOnAction(e -> {
            String nombreVal = txtNombre.getText().trim();
            String categoriaVal = cbCategoria.getValue();
            String precioCompraVal = txtPrecioCompra.getText().trim();
            String precioVentaVal = txtPrecioVenta.getText().trim();
            String stockVal = txtStock.getText().trim();
            String stockMinVal = txtStockMin.getText().trim();

            if (nombreVal.isEmpty() || categoriaVal == null || precioCompraVal.isEmpty() || precioVentaVal.isEmpty()) {
                Alert err = new Alert(Alert.AlertType.ERROR);
                err.setTitle("Campos requeridos");
                err.setHeaderText(null);
                err.setContentText("Por favor complete los campos obligatorios: Nombre, Categoría y Precios.");
                err.showAndWait();
                return;
            }

            try {
                String pcClean = precioCompraVal.replaceAll("[^\\d.\\-]", "");
                String pvClean = precioVentaVal.replaceAll("[^\\d.\\-]", "");
                java.math.BigDecimal precioCompra = new java.math.BigDecimal(pcClean);
                java.math.BigDecimal precioVenta = new java.math.BigDecimal(pvClean);
                int stock = stockVal.isEmpty() ? 0 : Integer.parseInt(stockVal);
                int stockMin = stockMinVal.isEmpty() ? 0 : Integer.parseInt(stockMinVal);

                Integer idVal = existing == null ? null : existing.getId();
                Producto nuevo = new Producto(idVal, nombreVal, categoriaVal, precioCompra, precioVenta, stock, stockMin);
                productoDao.save(nuevo);
                // Rebuild module to reflect new data
                dialog.close();
                activarBotonMenu(btnProductos);
                mainLayout.setCenter(crearModuloProductos());
                Alert alert = new Alert(Alert.AlertType.INFORMATION);
                alert.setTitle("Producto Registrado");
                alert.setHeaderText(null);
                alert.setContentText("✅ Producto registrado exitosamente");
                alert.showAndWait();
            } catch (NumberFormatException nfe) {
                Alert err = new Alert(Alert.AlertType.ERROR);
                err.setTitle("Error de formato");
                err.setHeaderText(null);
                err.setContentText("Ingrese precios y stocks válidos: " + nfe.getMessage());
                err.showAndWait();
            } catch (Exception ex) {
                ex.printStackTrace();
                Alert err = new Alert(Alert.AlertType.ERROR);
                err.setTitle("Error al guardar");
                err.setHeaderText(null);
                err.setContentText("No fue posible guardar el producto: " + ex.getMessage());
                err.showAndWait();
            }
        });
        
        footer.getChildren().addAll(btnCancelar, btnGuardar);
        
        formContainer.getChildren().addAll(form, footer);
        dialogVbox.getChildren().addAll(titulo, formContainer);
        
        Scene dialogScene = new Scene(dialogVbox, 650, 650);
        dialog.setScene(dialogScene);
        dialog.show();
    }

    private TableView<Cliente> crearTablaClientes() {
        // Reutilizar la tabla y enlazarla a la lista observable para poder actualizarla dinámicamente
        if (tablaClientes == null) {
            tablaClientes = new TableView<>();
            tablaClientes.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                          "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");

            TableColumn<Cliente, Integer> colId = new TableColumn<>("ID");
            colId.setCellValueFactory(new PropertyValueFactory<>("id"));
            colId.setPrefWidth(60);

            TableColumn<Cliente, String> colNombre = new TableColumn<>("Nombre Completo");
            colNombre.setCellValueFactory(new PropertyValueFactory<>("nombre"));
            colNombre.setPrefWidth(200);

            TableColumn<Cliente, String> colDocumento = new TableColumn<>("Documento");
            colDocumento.setCellValueFactory(new PropertyValueFactory<>("documento"));
            colDocumento.setPrefWidth(120);

            TableColumn<Cliente, String> colTelefono = new TableColumn<>("Teléfono");
            colTelefono.setCellValueFactory(new PropertyValueFactory<>("telefono"));
            colTelefono.setPrefWidth(120);

            TableColumn<Cliente, String> colEmail = new TableColumn<>("Email");
            colEmail.setCellValueFactory(new PropertyValueFactory<>("email"));
            colEmail.setPrefWidth(220);

            TableColumn<Cliente, String> colDireccion = new TableColumn<>("Dirección");
            colDireccion.setCellValueFactory(new PropertyValueFactory<>("direccion"));
            colDireccion.setPrefWidth(200);

            TableColumn<Cliente, Void> colAcciones = new TableColumn<>("Acciones");
            colAcciones.setPrefWidth(150);
            colAcciones.setCellFactory(col -> new TableCell<Cliente, Void>() {
                private final Button btnEditar = new Button("✏️ Editar");
                private final Button btnEliminar = new Button("🗑️");
                private final HBox pane = new HBox(5, btnEditar, btnEliminar);

                {
                    btnEditar.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white; " +
                                      "-fx-font-size: 11px; -fx-padding: 5 10; -fx-background-radius: 3;");
                    btnEliminar.setStyle("-fx-background-color: #E74C3C; -fx-text-fill: white; " +
                                        "-fx-font-size: 11px; -fx-padding: 5 10; -fx-background-radius: 3;");
                    pane.setAlignment(Pos.CENTER);
                    // Acción eliminar: quitar del listado en memoria
                    btnEliminar.setOnAction(e -> {
                        Cliente c = getTableView().getItems().get(getIndex());
                        if (c != null) {
                            Alert conf = new Alert(Alert.AlertType.CONFIRMATION);
                            conf.setTitle("Confirmar eliminación");
                            conf.setHeaderText(null);
                            conf.setContentText("¿Eliminar al cliente: " + c.getNombre() + "?");
                            conf.showAndWait().ifPresent(resp -> {
                                    if (resp == ButtonType.OK) {
                                    clientesList.remove(c);
                                    try { clienteDao.delete(c.getId()); } catch (Exception ex) { ex.printStackTrace(); }
                                }
                            });
                        }
                    });
                    btnEditar.setOnAction(e -> {
                        Cliente c = getTableView().getItems().get(getIndex());
                        if (c != null) mostrarFormularioCliente(c);
                    });
                }

                @Override
                protected void updateItem(Void item, boolean empty) {
                    super.updateItem(item, empty);
                    setGraphic(empty ? null : pane);
                }
            });

            tablaClientes.getColumns().addAll(colId, colNombre, colDocumento, colTelefono,
                                      colEmail, colDireccion, colAcciones);

            // No demo data: clients list should reflect DB contents only.

            tablaClientes.setItems(clientesList);
        }

        return tablaClientes;
    }

    private VBox crearModuloProductos() {
        VBox modulo = new VBox(20);
        modulo.setPadding(new Insets(30));
        modulo.setStyle("-fx-background-color: #ECF0F1;");
        
        HBox header = new HBox(20);
        header.setAlignment(Pos.CENTER_LEFT);
        
        Label titulo = new Label("📦 GESTIÓN DE PRODUCTOS");
        titulo.setFont(Font.font("Arial", FontWeight.BOLD, 24));
        titulo.setTextFill(Color.web("#2C3E50"));
        
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        Button btnNuevo = new Button("+ Nuevo Producto");
        btnNuevo.setStyle("-fx-background-color: #2ECC71; -fx-text-fill: white; " +
                         "-fx-font-size: 14px; -fx-font-weight: bold; -fx-padding: 10 20; " +
                         "-fx-background-radius: 5; -fx-cursor: hand;");
        btnNuevo.setOnAction(e -> mostrarFormularioProducto(null));
        
        header.getChildren().addAll(titulo, spacer, btnNuevo);
        
        HBox filtros = new HBox(15);
        filtros.setAlignment(Pos.CENTER_LEFT);
        filtros.setPadding(new Insets(15));
        filtros.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        
        TextField txtBuscar = new TextField();
        txtBuscar.setPromptText("🔍 Buscar producto...");
        txtBuscar.setPrefWidth(300);
        
        ComboBox<String> cbCategoria = new ComboBox<>();
        cbCategoria.setPromptText("Categoría");
        cbCategoria.getItems().addAll("Todas", "Electrónica", "Oficina", "Ferretería", "Hogar");
        cbCategoria.setValue("Todas");
        cbCategoria.setPrefWidth(150);
        
        ComboBox<String> cbStock = new ComboBox<>();
        cbStock.setPromptText("Estado Stock");
        cbStock.getItems().addAll("Todos", "Stock Normal", "Stock Bajo", "Sin Stock");
        cbStock.setValue("Todos");
        cbStock.setPrefWidth(150);
        
        filtros.getChildren().addAll(txtBuscar, cbCategoria, cbStock);
        
        TableView<Producto> tablaProductos = buildProductosTable();

        // Wire search button for products (simple filter on name/category)
        Button btnBuscarProd = new Button("Buscar");
        btnBuscarProd.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white; -fx-font-size: 14px; -fx-padding: 10 20; -fx-background-radius: 5;");
        btnBuscarProd.setOnAction(e -> {
            // Ensure product list is fresh from DAO before applying filters
            try {
                if (productoDao != null) productosList.setAll(productoDao.findAll());
            } catch (Exception _ex) { /* ignore refresh errors */ }
            String q = txtBuscar.getText().trim().toLowerCase();
            String stockOpt = cbStock == null ? "Todos" : cbStock.getValue();
            if (q.isEmpty() && (cbCategoria == null || "Todas".equals(cbCategoria.getValue())) && (stockOpt == null || "Todos".equals(stockOpt))) {
                tablaProductos.setItems(productosList);
            } else {
                java.util.List<Producto> filtered = new java.util.ArrayList<>();
                for (Producto p : productosList) {
                    if (p == null) continue;
                    boolean matchQ = q.isEmpty() || (p.getNombre() != null && p.getNombre().toLowerCase().contains(q)) || (p.getCategoria() != null && p.getCategoria().toLowerCase().contains(q));
                    boolean matchCat = cbCategoria == null || "Todas".equals(cbCategoria.getValue()) || (p.getCategoria() != null && p.getCategoria().equals(cbCategoria.getValue()));

                    // stock filtering using centralized classification
                    StockStatus status = classifyStock(p);
                    boolean matchStock = true;
                    if ("Stock Normal".equals(stockOpt)) {
                        // Only show products classified as ALTO (verde)
                        matchStock = status == StockStatus.ALTO;
                    } else if ("Stock Bajo".equals(stockOpt)) {
                        matchStock = status == StockStatus.BAJO;
                    } else if ("Sin Stock".equals(stockOpt)) {
                        matchStock = status == StockStatus.SIN_STOCK;
                    }

                    if (matchQ && matchCat && matchStock) filtered.add(p);
                }
                tablaProductos.setItems(FXCollections.observableArrayList(filtered));
            }
        });

        // Auto-apply filters when user changes controls
        cbStock.setOnAction(evt -> btnBuscarProd.fire());
        cbCategoria.setOnAction(evt -> btnBuscarProd.fire());
        txtBuscar.setOnKeyReleased(evt -> btnBuscarProd.fire());

        filtros.getChildren().remove(btnBuscarProd); // ensure not duplicated
        filtros.getChildren().add(btnBuscarProd);

        modulo.getChildren().addAll(header, filtros, tablaProductos);

        // Cargar productos desde el DAO si está disponible, o usar la lista observable
        try {
            if (productoDao != null) {
                java.util.List<com.inventario.model.Producto> productos = productoDao.findAll();
                productosList.setAll(productos);
                tablaProductos.setItems(productosList);
            } else {
                tablaProductos.setItems(productosList);
            }
        } catch (Exception ex) {
            tablaProductos.setItems(productosList);
        }

        return modulo;
    }

    // Build products table with actions and coloring
    private TableView<Producto> buildProductosTable() {
        TableView<Producto> tabla = new TableView<>();
        tabla.setStyle("-fx-background-color: white; -fx-background-radius: 10; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");

        TableColumn<Producto, Integer> colId = new TableColumn<>("ID");
        colId.setCellValueFactory(new PropertyValueFactory<>("id"));
        colId.setPrefWidth(50);

        TableColumn<Producto, String> colNombre = new TableColumn<>("Nombre");
        colNombre.setCellValueFactory(new PropertyValueFactory<>("nombre"));
        colNombre.setPrefWidth(200);

        TableColumn<Producto, String> colCategoria = new TableColumn<>("Categoría");
        colCategoria.setCellValueFactory(new PropertyValueFactory<>("categoria"));
        colCategoria.setPrefWidth(120);

        TableColumn<Producto, java.math.BigDecimal> colPrecioCompra = new TableColumn<>("P. Compra");
        colPrecioCompra.setCellValueFactory(new PropertyValueFactory<>("precioCompra"));
        colPrecioCompra.setPrefWidth(100);

        TableColumn<Producto, java.math.BigDecimal> colPrecioVenta = new TableColumn<>("P. Venta");
        colPrecioVenta.setCellValueFactory(new PropertyValueFactory<>("precioVenta"));
        colPrecioVenta.setPrefWidth(100);

        TableColumn<Producto, Integer> colStock = new TableColumn<>("Stock");
        colStock.setCellValueFactory(new PropertyValueFactory<>("stock"));
        colStock.setPrefWidth(80);
        colStock.setCellFactory(col -> new TableCell<Producto, Integer>() {
            @Override
            protected void updateItem(Integer item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("");
                } else {
                    int stock = item == null ? 0 : item;
                    setText(Integer.toString(stock));
                    Producto prod = getTableRow() == null ? null : (Producto) getTableRow().getItem();
                    StockStatus status;
                    if (prod != null) {
                        status = classifyStock(prod);
                    } else {
                        // fallback when row item is not available during cell virtualization
                        if (stock == 0) status = StockStatus.SIN_STOCK;
                        else if (stock >= STOCK_THRESHOLD_MED) status = StockStatus.ALTO;
                        else status = StockStatus.BAJO;
                    }
                    switch (status) {
                        case SIN_STOCK:
                            setStyle("-fx-background-color: #E74C3C30; -fx-text-fill: #E74C3C; -fx-font-weight: bold;");
                            break;
                        case BAJO:
                            setStyle("-fx-background-color: #F39C1230; -fx-text-fill: #F39C12; -fx-font-weight: bold;");
                            break;
                        case ALTO:
                        default:
                            setStyle("-fx-background-color: #2ECC7130; -fx-text-fill: #2ECC71; -fx-font-weight: bold;");
                            break;
                    }
                }
            }
        });

        TableColumn<Producto, Integer> colStockMin = new TableColumn<>("Stock Mín");
        colStockMin.setCellValueFactory(new PropertyValueFactory<>("stockMinimo"));
        colStockMin.setPrefWidth(90);

        TableColumn<Producto, Void> colAcciones = new TableColumn<>("Acciones");
        colAcciones.setPrefWidth(150);
        colAcciones.setCellFactory(col -> new TableCell<Producto, Void>() {
            private final Button btnEditar = new Button("✏️ Editar");
            private final Button btnEliminar = new Button("🗑️");
            private final HBox pane = new HBox(5, btnEditar, btnEliminar);

            {
                btnEditar.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 5 10; -fx-background-radius: 3;");
                btnEliminar.setStyle("-fx-background-color: #E74C3C; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 5 10; -fx-background-radius: 3;");
                pane.setAlignment(Pos.CENTER);
                btnEditar.setOnAction(e -> {
                    Producto p = getTableView().getItems().get(getIndex());
                    if (p != null) mostrarFormularioProducto(p);
                });
                btnEliminar.setOnAction(e -> {
                    Producto p = getTableView().getItems().get(getIndex());
                    if (p != null) {
                        Alert conf = new Alert(Alert.AlertType.CONFIRMATION);
                        conf.setTitle("Confirmar eliminación");
                        conf.setHeaderText(null);
                        conf.setContentText("¿Eliminar el producto: " + p.getNombre() + "?");
                        conf.showAndWait().ifPresent(resp -> {
                            if (resp == ButtonType.OK) {
                                try { productoDao.delete(p.getId()); productosList.setAll(productoDao.findAll()); }
                                catch (Exception ex) { ex.printStackTrace(); }
                            }
                        });
                    }
                });
            }

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                setGraphic(empty ? null : pane);
            }
        });

        tabla.getColumns().addAll(colId, colNombre, colCategoria, colPrecioCompra, colPrecioVenta, colStock, colStockMin, colAcciones);

        try {
            if (productoDao != null) {
                java.util.List<com.inventario.model.Producto> productos = productoDao.findAll();
                productosList.setAll(productos);
                tabla.setItems(productosList);
            } else {
                tabla.setItems(productosList);
            }
        } catch (Exception ex) {
            tabla.setItems(productosList);
        }

        return tabla;
    }

    private VBox crearModuloVentas() {
        VBox modulo = new VBox(20);
        modulo.setPadding(new Insets(30));
        modulo.setStyle("-fx-background-color: #ECF0F1;");
        
        Label titulo = new Label("💰 REGISTRO DE VENTAS");
        titulo.setFont(Font.font("Arial", FontWeight.BOLD, 24));
        titulo.setTextFill(Color.web("#2C3E50"));
        
        VBox formulario = crearFormularioVenta();
        
        VBox ventasRecientes = new VBox(15);
        ventasRecientes.setPadding(new Insets(20));
        ventasRecientes.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                                "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        
        Label lblRecientes = new Label("Ventas Recientes");
        lblRecientes.setFont(Font.font("Arial", FontWeight.BOLD, 18));
        
        TableView<Venta> tablaVentas = crearTablaVentas();
        ventasRecientes.getChildren().addAll(lblRecientes, tablaVentas);
        
        modulo.getChildren().addAll(titulo, formulario, ventasRecientes);
        return modulo;
    }

    // Recompute a total from the stored products string using current prices in productosList.
    // The products string format is expected like: "Mouse Óptico x10, Laptop Modelo A x2" or
    // "NombreProducto xN ($... )". We parse "<name> x<count>" groups separated by commas.
    private java.math.BigDecimal recomputeTotalFromProductos(String products, boolean isVenta) {
        if (products == null || products.trim().isEmpty()) return null;
        java.math.BigDecimal sum = java.math.BigDecimal.ZERO;
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("\\s*([^,]+?)\\s+x\\s*(\\d+)\\s*(?:\\(\\$[^)]*\\))?\\s*(?:,|$)");
        java.util.regex.Matcher m = p.matcher(products + ",");
        boolean any = false;
        while (m.find()) {
            any = true;
            String namePart = m.group(1).trim();
            int qty = 1;
            try { qty = Integer.parseInt(m.group(2)); } catch (Exception ex) { qty = 1; }
            // find product by name in productosList (best-effort: match startsWith or equals)
            com.inventario.model.Producto found = null;
            for (com.inventario.model.Producto pr : productosList) {
                if (pr == null || pr.getNombre() == null) continue;
                if (pr.getNombre().equalsIgnoreCase(namePart) || pr.getNombre().toLowerCase().startsWith(namePart.toLowerCase())) { found = pr; break; }
            }
            if (found != null) {
                java.math.BigDecimal unit = isVenta ? found.getPrecioVenta() : found.getPrecioCompra();
                if (unit != null) sum = sum.add(unit.multiply(new java.math.BigDecimal(qty)));
            } else {
                // fallback: try to read price from the parenthetical in the string (group 3) if present
                String paren = m.groupCount() >= 3 ? m.group(3) : null;
                if (paren != null) {
                    String digits = paren.replaceAll("[^\\d.\\-]", "");
                    try { sum = sum.add(new java.math.BigDecimal(digits).multiply(new java.math.BigDecimal(qty))); } catch (Exception ex) { }
                } else {
                    // cannot determine unit price; give up and return null to indicate no recompute
                    return null;
                }
            }
        }
        return any ? sum : null;
    }

    // Recompute totals for all ventas and compras using current product prices and update lists
    private void recalcAllTotals() {
        try {
                // recompute ventas totals and persist if changed
                if (ventaDao != null) {
                    for (Venta v : new java.util.ArrayList<>(ventasList)) {
                        if (v == null) continue;
                        java.math.BigDecimal recomputed = recomputeTotalFromProductos(v.getProductos(), true);
                        if (recomputed != null && (v.getTotal() == null || recomputed.compareTo(v.getTotal()) != 0)) {
                            v.setTotal(recomputed);
                            try { ventaDao.save(v); } catch (Exception ex) { ex.printStackTrace(); }
                        }
                    }
                    // refresh ventasList from DB to reflect persisted changes
                    try { ventasList.setAll(ventaDao.findAll()); } catch (Exception ignore) { }
                } else {
                    for (Venta v : ventasList) {
                        if (v == null) continue;
                        java.math.BigDecimal recomputed = recomputeTotalFromProductos(v.getProductos(), true);
                        if (recomputed != null) v.setTotal(recomputed);
                    }
                    ventasList.setAll(new java.util.ArrayList<>(ventasList));
                }

                // recompute compras totals and persist if changed
                if (compraDao != null) {
                    for (Compra c : new java.util.ArrayList<>(comprasList)) {
                        if (c == null) continue;
                        java.math.BigDecimal recomputed = recomputeTotalFromProductos(c.getProductos(), false);
                        if (recomputed != null && (c.getTotal() == null || recomputed.compareTo(c.getTotal()) != 0)) {
                            c.setTotal(recomputed);
                            try { compraDao.save(c); } catch (Exception ex) { ex.printStackTrace(); }
                        }
                    }
                    try { comprasList.setAll(compraDao.findAll()); } catch (Exception ignore) { }
                } else {
                    for (Compra c : comprasList) {
                        if (c == null) continue;
                        java.math.BigDecimal recomputed = recomputeTotalFromProductos(c.getProductos(), false);
                        if (recomputed != null) c.setTotal(recomputed);
                    }
                    comprasList.setAll(new java.util.ArrayList<>(comprasList));
                }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    private VBox crearFormularioVenta() {
        VBox form = new VBox(15);
        form.setPadding(new Insets(20));
        form.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                     "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        
        Label titulo = new Label("Nueva Venta");
        titulo.setFont(Font.font("Arial", FontWeight.BOLD, 18));
        
        GridPane grid = new GridPane();
        grid.setHgap(15);
        grid.setVgap(15);
        grid.setPadding(new Insets(10));
        
        Label lblFecha = new Label("Fecha:");
        lblFecha.setFont(Font.font("Arial", FontWeight.NORMAL, 14));
        DatePicker dpFecha = new DatePicker();
        dpFecha.setPrefWidth(200);
        
        Label lblCliente = new Label("Cliente:");
        lblCliente.setFont(Font.font("Arial", FontWeight.NORMAL, 14));
        ComboBox<com.inventario.model.Cliente> cbCliente = new ComboBox<>();
        // bind to clientesList so it stays in sync with DB
        cbCliente.setItems(clientesList);
        cbCliente.setPromptText("Seleccionar cliente");
        cbCliente.setPrefWidth(250);
        cbCliente.setCellFactory(col -> new javafx.scene.control.ListCell<com.inventario.model.Cliente>() {
            @Override
            protected void updateItem(com.inventario.model.Cliente item, boolean empty) {
                super.updateItem(item, empty);
                setText(empty || item == null ? null : item.getNombre());
            }
        });
        cbCliente.setButtonCell(new javafx.scene.control.ListCell<com.inventario.model.Cliente>() {
            @Override
            protected void updateItem(com.inventario.model.Cliente item, boolean empty) {
                super.updateItem(item, empty);
                setText(empty || item == null ? null : item.getNombre());
            }
        });
        
        grid.add(lblFecha, 0, 0);
        grid.add(dpFecha, 1, 0);
        grid.add(lblCliente, 2, 0);
        grid.add(cbCliente, 3, 0);
        
        Label lblProducto = new Label("Producto:");
        lblProducto.setFont(Font.font("Arial", FontWeight.NORMAL, 14));
        ComboBox<com.inventario.model.Producto> cbProducto = new ComboBox<>();
        // bind to productosList so it stays in sync with DB
        cbProducto.setItems(productosList);
        cbProducto.setPromptText("Seleccionar producto");
        cbProducto.setPrefWidth(250);
        cbProducto.setCellFactory(col -> new javafx.scene.control.ListCell<com.inventario.model.Producto>() {
            @Override
            protected void updateItem(com.inventario.model.Producto item, boolean empty) {
                super.updateItem(item, empty);
                setText(empty || item == null ? null : item.getNombre());
            }
        });
        cbProducto.setButtonCell(new javafx.scene.control.ListCell<com.inventario.model.Producto>() {
            @Override
            protected void updateItem(com.inventario.model.Producto item, boolean empty) {
                super.updateItem(item, empty);
                setText(empty || item == null ? null : item.getNombre());
            }
        });
        
        Label lblCantidad = new Label("Cantidad:");
        lblCantidad.setFont(Font.font("Arial", FontWeight.NORMAL, 14));
        TextField txtCantidad = new TextField();
        txtCantidad.setPromptText("0");
        txtCantidad.setPrefWidth(100);
        
        Button btnAgregar = new Button("+ Agregar");
        btnAgregar.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white; " +
                           "-fx-font-size: 13px; -fx-padding: 8 15; -fx-background-radius: 5;");
        
        grid.add(lblProducto, 0, 1);
        grid.add(cbProducto, 1, 1, 2, 1);
        grid.add(lblCantidad, 3, 1);
        grid.add(txtCantidad, 4, 1);
        grid.add(btnAgregar, 5, 1);
        
        // List of line items and running total
        final java.util.List<String> lineItems = new java.util.ArrayList<>();
        final java.math.BigDecimal[] totalRef = new java.math.BigDecimal[]{java.math.BigDecimal.ZERO};

        ListView<String> lvItems = new ListView<>();
        lvItems.setPrefHeight(120);

        HBox footer = new HBox(20);
        footer.setAlignment(Pos.CENTER_RIGHT);
        footer.setPadding(new Insets(15, 0, 0, 0));
        
        final javafx.beans.property.SimpleStringProperty formTotalProp = new javafx.beans.property.SimpleStringProperty("TOTAL: $0.00");
        Label lblTotal = new Label();
        lblTotal.textProperty().bind(formTotalProp);
        lblTotal.setFont(Font.font("Arial", FontWeight.BOLD, 20));
        lblTotal.setTextFill(Color.web("#2ECC71"));
        
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setStyle("-fx-background-color: #95A5A6; -fx-text-fill: white; " +
                            "-fx-font-size: 14px; -fx-padding: 10 25; -fx-background-radius: 5;");
        
        Button btnGuardar = new Button("💾 Guardar Venta");
        btnGuardar.setStyle("-fx-background-color: #2ECC71; -fx-text-fill: white; " +
                           "-fx-font-size: 14px; -fx-font-weight: bold; -fx-padding: 10 25; -fx-background-radius: 5;");
        
        footer.getChildren().addAll(lblTotal, spacer, btnCancelar, btnGuardar);
        
        // Agregar behavior: añadir línea y recalcular total
        btnAgregar.setOnAction(e -> {
            com.inventario.model.Producto selected = cbProducto.getValue();
            if (selected == null) return;
            int qty = 1;
            try { qty = Integer.parseInt(txtCantidad.getText().trim()); } catch (Exception ex) { qty = 1; }
            try {
                com.inventario.model.Producto found = selected;
                // Validation: cantidad positiva
                if (qty <= 0) {
                    Alert a = new Alert(Alert.AlertType.WARNING, "La cantidad debe ser mayor que cero."); a.showAndWait();
                    return;
                }
                // Validation: comprobar stock disponible
                Integer stock = found.getStock() == null ? 0 : found.getStock();
                if (stock < qty) {
                    Alert a = new Alert(Alert.AlertType.WARNING, "Stock insuficiente para '" + found.getNombre() + "'. Stock disponible: " + stock);
                    a.showAndWait();
                    return;
                }

                java.math.BigDecimal lineTotal = found.getPrecioVenta().multiply(new java.math.BigDecimal(qty));
                lineItems.add(found.getNombre() + " x" + qty + " (" + formatCurrencyForCell(lineTotal) + ")");
                lvItems.getItems().setAll(lineItems);
                totalRef[0] = totalRef[0].add(lineTotal);
                formTotalProp.set("TOTAL: " + formatCurrencyForCell(totalRef[0]));
            } catch (Exception ex) {
                ex.printStackTrace();
                Alert a = new Alert(Alert.AlertType.ERROR, "Error al agregar producto: " + ex.getMessage()); a.showAndWait();
            }
        });

        // Si no hay items en el formulario, mostrar el total acumulado de la tabla de ventas
        if (lvItems.getItems().isEmpty()) {
            java.math.BigDecimal sum = java.math.BigDecimal.ZERO;
            for (com.inventario.model.Venta v : ventasList) {
                try {
                    java.math.BigDecimal recomputed = recomputeTotalFromProductos(v.getProductos(), true);
                    if (recomputed != null) { sum = sum.add(recomputed); continue; }
                } catch (Exception ex) { }
                if (v.getTotal() != null) sum = sum.add(v.getTotal());
            }
            formTotalProp.set("TOTAL: " + formatCurrencyForCell(sum));
        }

        ventasList.addListener((javafx.collections.ListChangeListener<com.inventario.model.Venta>) ch -> {
            if (lvItems.getItems().isEmpty()) {
                java.math.BigDecimal sum = java.math.BigDecimal.ZERO;
                for (com.inventario.model.Venta v : ventasList) {
                    try {
                        java.math.BigDecimal recomputed = recomputeTotalFromProductos(v.getProductos(), true);
                        if (recomputed != null) { sum = sum.add(recomputed); continue; }
                    } catch (Exception ex) { }
                    if (v.getTotal() != null) sum = sum.add(v.getTotal());
                }
                formTotalProp.set("TOTAL: " + formatCurrencyForCell(sum));
            }
        });

        // Guardar venta: crear objeto Venta y persistir
        btnGuardar.setOnAction(e -> {
            if (lineItems.isEmpty()) {
                Alert a = new Alert(Alert.AlertType.WARNING, "Agregue al menos un producto a la venta."); a.showAndWait();
                return;
            }
            try {
                java.time.LocalDateTime fechaVal = dpFecha.getValue() == null ? java.time.LocalDateTime.now() : dpFecha.getValue().atStartOfDay();
                com.inventario.model.Cliente cli = cbCliente.getValue();
                String clienteVal = cli == null ? "(Sin cliente)" : cli.getNombre();
                String productosStr = String.join(", ", lineItems);
                java.math.BigDecimal total = totalRef[0];
                com.inventario.model.Venta nuevo = new com.inventario.model.Venta(null, fechaVal, clienteVal, productosStr, total, "Completada");
                ventaDao.save(nuevo);
                ventasList.add(0, nuevo);
                // Refresh productos list from DB so stock and alerts update
                try {
                    productosList.setAll(productoDao.findAll());
                } catch (Exception _ex) {
                    System.err.println("Warning: could not refresh productosList after venta save: " + _ex.getMessage());
                }
                // Recompute dashboard related bindings by forcing list replace where needed
                try { ventasList.setAll(ventaDao.findAll()); } catch (Exception ignore) {}
                // refresh ventas table by rebuilding center module if visible
                Alert ok = new Alert(Alert.AlertType.INFORMATION, "Venta registrada correctamente."); ok.showAndWait();
            } catch (Exception ex) {
                ex.printStackTrace();
                Alert a = new Alert(Alert.AlertType.ERROR, "No fue posible guardar la venta: " + ex.getMessage()); a.showAndWait();
            }
        });

        form.getChildren().addAll(titulo, grid, lvItems, footer);
        return form;
    }

    private TableView<Venta> crearTablaVentas() {
        TableView<Venta> tabla = new TableView<>();
        
        TableColumn<Venta, Integer> colId = new TableColumn<>("ID");
        colId.setCellValueFactory(new PropertyValueFactory<>("id"));
        colId.setPrefWidth(50);
        
        TableColumn<Venta, java.time.LocalDateTime> colFecha = new TableColumn<>("Fecha");
        colFecha.setCellValueFactory(new PropertyValueFactory<>("fecha"));
        colFecha.setPrefWidth(120);
        
        TableColumn<Venta, String> colCliente = new TableColumn<>("Cliente");
        colCliente.setCellValueFactory(new PropertyValueFactory<>("cliente"));
        colCliente.setPrefWidth(200);
        
        TableColumn<Venta, String> colProductos = new TableColumn<>("Productos");
        colProductos.setCellValueFactory(new PropertyValueFactory<>("productos"));
        colProductos.setPrefWidth(250);
        
        TableColumn<Venta, java.math.BigDecimal> colTotal = new TableColumn<>("Total");
        colTotal.setPrefWidth(120);
        colTotal.setCellValueFactory(cell -> {
            Venta v = cell.getValue();
            if (v == null) return new javafx.beans.property.ReadOnlyObjectWrapper<java.math.BigDecimal>(java.math.BigDecimal.ZERO);
            java.math.BigDecimal recomputed = null;
            try { recomputed = recomputeTotalFromProductos(v.getProductos(), true); } catch (Exception ex) { }
            java.math.BigDecimal value = recomputed != null ? recomputed : (v.getTotal() != null ? v.getTotal() : java.math.BigDecimal.ZERO);
            return new javafx.beans.property.ReadOnlyObjectWrapper<java.math.BigDecimal>(value);
        });
        // Format BigDecimal as currency in the cell
        colTotal.setCellFactory(col -> new TableCell<Venta, java.math.BigDecimal>() {
            @Override
            protected void updateItem(java.math.BigDecimal item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    } else {
                        setText(formatCurrencyForCell(item));
                    }
            }
        });
        
        TableColumn<Venta, String> colEstado = new TableColumn<>("Estado");
        colEstado.setCellValueFactory(new PropertyValueFactory<>("estado"));
        colEstado.setPrefWidth(100);
        colEstado.setCellFactory(col -> new TableCell<Venta, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("");
                } else {
                    setText(item);
                    if (item.equals("Completada")) {
                        setStyle("-fx-background-color: #2ECC7130; -fx-text-fill: #2ECC71; -fx-font-weight: bold;");
                    } else {
                        setStyle("-fx-background-color: #F39C1230; -fx-text-fill: #F39C12; -fx-font-weight: bold;");
                    }
                }
            }
        });
        
        TableColumn<Venta, Void> colAcciones = new TableColumn<>("Acciones");
        colAcciones.setPrefWidth(120);
        colAcciones.setCellFactory(col -> new TableCell<Venta, Void>() {
            private final Button btnVer = new Button("👁️ Ver");
            private final Button btnImprimir = new Button("🖨️");
            private final HBox pane = new HBox(5, btnVer, btnImprimir);
            
            {
                btnVer.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white; " +
                               "-fx-font-size: 11px; -fx-padding: 5 10; -fx-background-radius: 3;");
                btnImprimir.setStyle("-fx-background-color: #95A5A6; -fx-text-fill: white; " +
                                    "-fx-font-size: 11px; -fx-padding: 5 10; -fx-background-radius: 3;");
                pane.setAlignment(Pos.CENTER);
            }
            
            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                setGraphic(empty ? null : pane);
            }
        });
        
        tabla.getColumns().addAll(colId, colFecha, colCliente, colProductos, colTotal, colEstado, colAcciones);

        try {
            if (ventaDao != null) {
                java.util.List<com.inventario.model.Venta> ventas = ventaDao.findAll();
                ventasList.setAll(ventas);
                System.out.println("[DEBUG] Loaded ventas from DB: " + ventasList.size());
            }
        } catch (Exception ex) {
            System.err.println("[DEBUG] Error loading ventas from DB: " + ex.getMessage());
            ex.printStackTrace(System.err);
        }

        // If no ventas in DB, populate a small in-memory sample so UI shows content
        if (ventasList.isEmpty()) {
            ventasList.addAll(
                new Venta(1, java.time.LocalDateTime.now().minusDays(1), "Juan Pérez García", "Laptop x1", new java.math.BigDecimal("3200.00"), "Completada"),
                new Venta(2, java.time.LocalDateTime.now().minusDays(2), "Ana María López", "Teclado x1", new java.math.BigDecimal("180.00"), "Completada")
            );
            System.out.println("[DEBUG] Using sample ventas for UI (no DB data)");
        }

        tabla.setItems(ventasList);

        return tabla;
    }

    private VBox crearModuloProveedores() {
        VBox modulo = new VBox(20);
        modulo.setPadding(new Insets(30));
        modulo.setStyle("-fx-background-color: #ECF0F1;");
        
        HBox header = new HBox(20);
        header.setAlignment(Pos.CENTER_LEFT);
        
        Label titulo = new Label("🏢 GESTIÓN DE PROVEEDORES");
        titulo.setFont(Font.font("Arial", FontWeight.BOLD, 24));
        titulo.setTextFill(Color.web("#2C3E50"));
        
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        Button btnNuevo = new Button("+ Nuevo Proveedor");
        btnNuevo.setStyle("-fx-background-color: #2ECC71; -fx-text-fill: white; " +
                         "-fx-font-size: 14px; -fx-font-weight: bold; -fx-padding: 10 20; " +
                         "-fx-background-radius: 5; -fx-cursor: hand;");
        btnNuevo.setOnAction(e -> mostrarFormularioProveedor(null));
        
        header.getChildren().addAll(titulo, spacer, btnNuevo);
        
        HBox searchBar = new HBox(10);
        searchBar.setAlignment(Pos.CENTER_LEFT);
        searchBar.setPadding(new Insets(15));
        searchBar.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                          "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        
        TextField txtBuscar = new TextField();
        txtBuscar.setPromptText("🔍 Buscar por nombre de empresa o NIT...");
        txtBuscar.setPrefWidth(500);
        txtBuscar.setStyle("-fx-font-size: 14px; -fx-padding: 10;");
        
        Button btnBuscar = new Button("Buscar");
        btnBuscar.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white; " +
                          "-fx-font-size: 14px; -fx-padding: 10 20; -fx-background-radius: 5;");
        btnBuscar.setOnAction(e -> {
            String q = txtBuscar.getText().trim().toLowerCase();
            TableView<Proveedor> tabla = crearTablaProveedores();
            if (q.isEmpty()) tabla.setItems(proveedoresList);
            else {
                java.util.List<Proveedor> filtered = new java.util.ArrayList<>();
                for (Proveedor p : proveedoresList) {
                    if ((p.getEmpresa() != null && p.getEmpresa().toLowerCase().contains(q)) ||
                        (p.getNit() != null && p.getNit().toLowerCase().contains(q))) {
                        filtered.add(p);
                    }
                }
                tabla.setItems(FXCollections.observableArrayList(filtered));
            }
        });

        searchBar.getChildren().addAll(txtBuscar, btnBuscar);
        
        TableView<Proveedor> tablaProveedores = crearTablaProveedores();
        
        modulo.getChildren().addAll(header, searchBar, tablaProveedores);
        return modulo;
    }

    private TableView<Proveedor> crearTablaProveedores() {
        TableView<Proveedor> tabla = new TableView<>();
        tabla.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                      "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        
        TableColumn<Proveedor, Integer> colId = new TableColumn<>("ID");
        colId.setCellValueFactory(new PropertyValueFactory<>("id"));
        colId.setPrefWidth(50);
        
        TableColumn<Proveedor, String> colEmpresa = new TableColumn<>("Empresa");
        colEmpresa.setCellValueFactory(new PropertyValueFactory<>("empresa"));
        colEmpresa.setPrefWidth(200);
        
        TableColumn<Proveedor, String> colNit = new TableColumn<>("NIT");
        colNit.setCellValueFactory(new PropertyValueFactory<>("nit"));
        colNit.setPrefWidth(120);
        
        TableColumn<Proveedor, String> colContacto = new TableColumn<>("Contacto");
        colContacto.setCellValueFactory(new PropertyValueFactory<>("contacto"));
        colContacto.setPrefWidth(180);
        
        TableColumn<Proveedor, String> colTelefono = new TableColumn<>("Teléfono");
        colTelefono.setCellValueFactory(new PropertyValueFactory<>("telefono"));
        colTelefono.setPrefWidth(120);
        
        TableColumn<Proveedor, String> colEmail = new TableColumn<>("Email");
        colEmail.setCellValueFactory(new PropertyValueFactory<>("email"));
        colEmail.setPrefWidth(200);
        
        TableColumn<Proveedor, Void> colAcciones = new TableColumn<>("Acciones");
        colAcciones.setPrefWidth(150);
        colAcciones.setCellFactory(col -> new TableCell<Proveedor, Void>() {
            private final Button btnEditar = new Button("✏️ Editar");
            private final Button btnEliminar = new Button("🗑️");
            private final HBox pane = new HBox(5, btnEditar, btnEliminar);

            {
                btnEditar.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 5 10; -fx-background-radius: 3;");
                btnEliminar.setStyle("-fx-background-color: #E74C3C; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 5 10; -fx-background-radius: 3;");
                pane.setAlignment(Pos.CENTER);
                btnEditar.setOnAction(e -> {
                    Proveedor p = getTableView().getItems().get(getIndex());
                    if (p != null) mostrarFormularioProveedor(p);
                });
                btnEliminar.setOnAction(e -> {
                    Proveedor p = getTableView().getItems().get(getIndex());
                    if (p != null) {
                        Alert conf = new Alert(Alert.AlertType.CONFIRMATION);
                        conf.setTitle("Confirmar eliminación");
                        conf.setHeaderText(null);
                        conf.setContentText("¿Eliminar al proveedor: " + p.getEmpresa() + "?");
                        conf.showAndWait().ifPresent(resp -> {
                            if (resp == ButtonType.OK) {
                                try { proveedorDao.delete(p.getId()); proveedoresList.setAll(proveedorDao.findAll()); }
                                catch (Exception ex) { ex.printStackTrace(); }
                            }
                        });
                    }
                });
            }

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                setGraphic(empty ? null : pane);
            }
        });
        
        tabla.getColumns().addAll(colId, colEmpresa, colNit, colContacto, colTelefono, colEmail, colAcciones);

        try {
            java.util.List<com.inventario.model.Proveedor> proveedores = proveedorDao.findAll();
            tabla.setItems(FXCollections.observableArrayList(proveedores));
        } catch (Exception ex) {
            tabla.getItems().addAll(
                new Proveedor(1, "Tech Solutions S.A.S", "900123456-7", "Pedro Gómez", 
                             "601-234-5678", "ventas@techsolutions.com"),
                new Proveedor(2, "Distribuidora Nacional", "800987654-3", "Laura Martínez", 
                             "601-345-6789", "info@distribucionalnacional.com"),
                new Proveedor(3, "Importadora Global", "900456789-1", "Roberto Castro", 
                             "601-456-7890", "compras@importadoraglobal.com"),
                new Proveedor(4, "Suministros Industriales", "800321654-9", "Carmen Ruiz", 
                             "601-567-8901", "ventas@suministrosindustriales.com")
            );
        }

        return tabla;
    }

    private VBox crearModuloCompras() {
        VBox modulo = new VBox(20);
        modulo.setPadding(new Insets(30));
        modulo.setStyle("-fx-background-color: #ECF0F1;");
        
        Label titulo = new Label("🛒 REGISTRO DE COMPRAS");
        titulo.setFont(Font.font("Arial", FontWeight.BOLD, 24));
        titulo.setTextFill(Color.web("#2C3E50"));
        
        VBox formulario = crearFormularioCompra();
        
        VBox comprasRecientes = new VBox(15);
        comprasRecientes.setPadding(new Insets(20));
        comprasRecientes.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                                 "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        
        Label lblRecientes = new Label("Compras Recientes");
        lblRecientes.setFont(Font.font("Arial", FontWeight.BOLD, 18));
        
        TableView<Compra> tablaCompras = crearTablaCompras();
        comprasRecientes.getChildren().addAll(lblRecientes, tablaCompras);
        
        modulo.getChildren().addAll(titulo, formulario, comprasRecientes);
        return modulo;
    }

    private VBox crearFormularioCompra() {
        VBox form = new VBox(15);
        form.setPadding(new Insets(20));
        form.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                     "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        
        Label titulo = new Label("Nueva Compra");
        titulo.setFont(Font.font("Arial", FontWeight.BOLD, 18));
        
        GridPane grid = new GridPane();
        grid.setHgap(15);
        grid.setVgap(15);
        grid.setPadding(new Insets(10));
        
        Label lblFecha = new Label("Fecha:");
        lblFecha.setFont(Font.font("Arial", FontWeight.NORMAL, 14));
        DatePicker dpFecha = new DatePicker();
        dpFecha.setPrefWidth(200);
        
        Label lblProveedor = new Label("Proveedor:");
        lblProveedor.setFont(Font.font("Arial", FontWeight.NORMAL, 14));
        ComboBox<com.inventario.model.Proveedor> cbProveedor = new ComboBox<>();
        cbProveedor.setItems(proveedoresList);
        cbProveedor.setPromptText("Seleccionar proveedor");
        cbProveedor.setPrefWidth(250);
        cbProveedor.setCellFactory(col -> new javafx.scene.control.ListCell<com.inventario.model.Proveedor>() {
            @Override
            protected void updateItem(com.inventario.model.Proveedor item, boolean empty) {
                super.updateItem(item, empty);
                setText(empty || item == null ? null : item.getEmpresa());
            }
        });
        cbProveedor.setButtonCell(new javafx.scene.control.ListCell<com.inventario.model.Proveedor>() {
            @Override
            protected void updateItem(com.inventario.model.Proveedor item, boolean empty) {
                super.updateItem(item, empty);
                setText(empty || item == null ? null : item.getEmpresa());
            }
        });
        
        grid.add(lblFecha, 0, 0);
        grid.add(dpFecha, 1, 0);
        grid.add(lblProveedor, 2, 0);
        grid.add(cbProveedor, 3, 0);
        
        Label lblProducto = new Label("Producto:");
        lblProducto.setFont(Font.font("Arial", FontWeight.NORMAL, 14));
        ComboBox<com.inventario.model.Producto> cbProducto = new ComboBox<>();
        cbProducto.setItems(productosList);
        cbProducto.setPromptText("Seleccionar producto");
        cbProducto.setPrefWidth(250);
        cbProducto.setCellFactory(col -> new javafx.scene.control.ListCell<com.inventario.model.Producto>() {
            @Override
            protected void updateItem(com.inventario.model.Producto item, boolean empty) {
                super.updateItem(item, empty);
                setText(empty || item == null ? null : item.getNombre());
            }
        });
        cbProducto.setButtonCell(new javafx.scene.control.ListCell<com.inventario.model.Producto>() {
            @Override
            protected void updateItem(com.inventario.model.Producto item, boolean empty) {
                super.updateItem(item, empty);
                setText(empty || item == null ? null : item.getNombre());
            }
        });
        
        Label lblCantidad = new Label("Cantidad:");
        lblCantidad.setFont(Font.font("Arial", FontWeight.NORMAL, 14));
        TextField txtCantidad = new TextField();
        txtCantidad.setPromptText("0");
        txtCantidad.setPrefWidth(100);
        
        Button btnAgregar = new Button("+ Agregar");
        btnAgregar.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white; " +
                           "-fx-font-size: 13px; -fx-padding: 8 15; -fx-background-radius: 5;");
        
        grid.add(lblProducto, 0, 1);
        grid.add(cbProducto, 1, 1, 2, 1);
        grid.add(lblCantidad, 3, 1);
        grid.add(txtCantidad, 4, 1);
        grid.add(btnAgregar, 5, 1);
        
        final java.util.List<String> lineItems = new java.util.ArrayList<>();
        final java.math.BigDecimal[] totalRef = new java.math.BigDecimal[]{java.math.BigDecimal.ZERO};

        ListView<String> lvItems = new ListView<>();
        lvItems.setPrefHeight(120);

        HBox footer = new HBox(20);
        footer.setAlignment(Pos.CENTER_RIGHT);
        footer.setPadding(new Insets(15, 0, 0, 0));

        final javafx.beans.property.SimpleStringProperty formTotalPropCompra = new javafx.beans.property.SimpleStringProperty("TOTAL: $0.00");
        Label lblTotal = new Label();
        lblTotal.textProperty().bind(formTotalPropCompra);
        lblTotal.setFont(Font.font("Arial", FontWeight.BOLD, 20));
        lblTotal.setTextFill(Color.web("#9B59B6"));

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setStyle("-fx-background-color: #95A5A6; -fx-text-fill: white; " +
                            "-fx-font-size: 14px; -fx-padding: 10 25; -fx-background-radius: 5;");

        Button btnGuardar = new Button("💾 Registrar Compra");
        btnGuardar.setStyle("-fx-background-color: #9B59B6; -fx-text-fill: white; " +
                           "-fx-font-size: 14px; -fx-font-weight: bold; -fx-padding: 10 25; -fx-background-radius: 5;");

        // Agregar behavior: buscar producto, multiplicar por cantidad y acumular
        btnAgregar.setOnAction(e -> {
            com.inventario.model.Producto selected = cbProducto.getValue();
            if (selected == null) return;
            int qty = 1;
            try { qty = Integer.parseInt(txtCantidad.getText().trim()); } catch (Exception ex) { qty = 1; }
            try {
                com.inventario.model.Producto found = selected;
                // Validation: cantidad positiva
                if (qty <= 0) { Alert a = new Alert(Alert.AlertType.WARNING, "La cantidad debe ser mayor que cero."); a.showAndWait(); return; }

                java.math.BigDecimal lineTotal = found.getPrecioCompra().multiply(new java.math.BigDecimal(qty));
                lineItems.add(found.getNombre() + " x" + qty + " (" + formatCurrencyForCell(lineTotal) + ")");
                lvItems.getItems().setAll(lineItems);
                totalRef[0] = totalRef[0].add(lineTotal);
                formTotalPropCompra.set("TOTAL: " + formatCurrencyForCell(totalRef[0]));
            } catch (Exception ex) { ex.printStackTrace(); Alert a = new Alert(Alert.AlertType.ERROR, "Error al agregar: " + ex.getMessage()); a.showAndWait(); }
        });

        // Si no hay items en el formulario, mostrar el total acumulado de la tabla de compras
        if (lvItems.getItems().isEmpty()) {
            java.math.BigDecimal sum = java.math.BigDecimal.ZERO;
            for (com.inventario.model.Compra c : comprasList) {
                try {
                    java.math.BigDecimal recomputed = recomputeTotalFromProductos(c.getProductos(), false);
                    if (recomputed != null) { sum = sum.add(recomputed); continue; }
                } catch (Exception ex) { }
                if (c.getTotal() != null) sum = sum.add(c.getTotal());
            }
            formTotalPropCompra.set("TOTAL: " + formatCurrencyForCell(sum));
        }

        comprasList.addListener((javafx.collections.ListChangeListener<com.inventario.model.Compra>) ch -> {
            if (lvItems.getItems().isEmpty()) {
                java.math.BigDecimal sum = java.math.BigDecimal.ZERO;
                for (com.inventario.model.Compra c : comprasList) {
                    try {
                        java.math.BigDecimal recomputed = recomputeTotalFromProductos(c.getProductos(), false);
                        if (recomputed != null) { sum = sum.add(recomputed); continue; }
                    } catch (Exception ex) { }
                    if (c.getTotal() != null) sum = sum.add(c.getTotal());
                }
                formTotalPropCompra.set("TOTAL: " + formatCurrencyForCell(sum));
            }
        });

        // Guardar compra: persistir
        btnGuardar.setOnAction(e -> {
            if (lineItems.isEmpty()) { Alert a = new Alert(Alert.AlertType.WARNING, "Agregue al menos un producto a la compra."); a.showAndWait(); return; }
            try {
                java.time.LocalDateTime fechaVal = dpFecha.getValue() == null ? java.time.LocalDateTime.now() : dpFecha.getValue().atStartOfDay();
                com.inventario.model.Proveedor prov = cbProveedor.getValue();
                String proveedorVal = prov == null ? "(Sin proveedor)" : prov.getEmpresa();
                String productosStr = String.join(", ", lineItems);
                java.math.BigDecimal total = totalRef[0];
                com.inventario.model.Compra nuevo = new com.inventario.model.Compra(null, fechaVal, proveedorVal, productosStr, total);
                compraDao.save(nuevo);
                comprasList.add(0, nuevo);
                // Refresh productos list so stock changes are visible in UI
                try {
                    productosList.setAll(productoDao.findAll());
                } catch (Exception _ex) {
                    System.err.println("Warning: could not refresh productosList after compra save: " + _ex.getMessage());
                }
                try { comprasList.setAll(compraDao.findAll()); } catch (Exception ignore) {}
                Alert ok = new Alert(Alert.AlertType.INFORMATION, "Compra registrada correctamente."); ok.showAndWait();
            } catch (Exception ex) { ex.printStackTrace(); Alert a = new Alert(Alert.AlertType.ERROR, "No fue posible guardar la compra: " + ex.getMessage()); a.showAndWait(); }
        });

        footer.getChildren().addAll(lblTotal, spacer, btnCancelar, btnGuardar);

        form.getChildren().addAll(titulo, grid, lvItems, footer);
        return form;
    }

    private TableView<Compra> crearTablaCompras() {
        TableView<Compra> tabla = new TableView<>();
        
        TableColumn<Compra, Integer> colId = new TableColumn<>("ID");
        colId.setCellValueFactory(new PropertyValueFactory<>("id"));
        colId.setPrefWidth(50);
        
        TableColumn<Compra, java.time.LocalDateTime> colFecha = new TableColumn<>("Fecha");
        colFecha.setCellValueFactory(new PropertyValueFactory<>("fecha"));
        colFecha.setPrefWidth(120);
        
        TableColumn<Compra, String> colProveedor = new TableColumn<>("Proveedor");
        colProveedor.setCellValueFactory(new PropertyValueFactory<>("proveedor"));
        colProveedor.setPrefWidth(220);
        
        TableColumn<Compra, String> colProductos = new TableColumn<>("Productos");
        colProductos.setCellValueFactory(new PropertyValueFactory<>("productos"));
        colProductos.setPrefWidth(250);
        
        TableColumn<Compra, java.math.BigDecimal> colTotal = new TableColumn<>("Total");
        colTotal.setPrefWidth(120);
        colTotal.setCellValueFactory(cell -> {
            Compra c = cell.getValue();
            if (c == null) return new javafx.beans.property.ReadOnlyObjectWrapper<java.math.BigDecimal>(java.math.BigDecimal.ZERO);
            java.math.BigDecimal recomputed = null;
            try { recomputed = recomputeTotalFromProductos(c.getProductos(), false); } catch (Exception ex) { }
            java.math.BigDecimal value = recomputed != null ? recomputed : (c.getTotal() != null ? c.getTotal() : java.math.BigDecimal.ZERO);
            return new javafx.beans.property.ReadOnlyObjectWrapper<java.math.BigDecimal>(value);
        });
        // Format BigDecimal as currency in the cell
        colTotal.setCellFactory(col -> new TableCell<Compra, java.math.BigDecimal>() {
            @Override
            protected void updateItem(java.math.BigDecimal item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                } else {
                    setText("$" + item.setScale(2, java.math.RoundingMode.HALF_UP).toString());
                }
            }
        });
        
        TableColumn<Compra, Void> colAcciones = new TableColumn<>("Acciones");
        colAcciones.setPrefWidth(120);
        colAcciones.setCellFactory(col -> new TableCell<Compra, Void>() {
            private final Button btnVer = new Button("👁️ Ver");
            private final Button btnImprimir = new Button("🖨️");
            private final HBox pane = new HBox(5, btnVer, btnImprimir);
            
            {
                btnVer.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white; " +
                               "-fx-font-size: 11px; -fx-padding: 5 10; -fx-background-radius: 3;");
                btnImprimir.setStyle("-fx-background-color: #95A5A6; -fx-text-fill: white; " +
                                    "-fx-font-size: 11px; -fx-padding: 5 10; -fx-background-radius: 3;");
                pane.setAlignment(Pos.CENTER);
            }
            
            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                setGraphic(empty ? null : pane);
            }
        });
        
        tabla.getColumns().addAll(colId, colFecha, colProveedor, colProductos, colTotal, colAcciones);

        try {
            if (compraDao != null) {
                java.util.List<com.inventario.model.Compra> compras = compraDao.findAll();
                comprasList.setAll(compras);
                System.out.println("[DEBUG] Loaded compras from DB: " + comprasList.size());
            }
        } catch (Exception ex) {
            System.err.println("[DEBUG] Error loading compras from DB: " + ex.getMessage());
            ex.printStackTrace(System.err);
        }

        if (comprasList.isEmpty()) {
            comprasList.addAll(
                new Compra(1, java.time.LocalDateTime.now().minusDays(3), "Tech Solutions S.A.S", "Laptop x10", new java.math.BigDecimal("25000.00")),
                new Compra(2, java.time.LocalDateTime.now().minusDays(4), "Distribuidora Nacional", "Mouse x50", new java.math.BigDecimal("2500.00"))
            );
            System.out.println("[DEBUG] Using sample compras for UI (no DB data)");
        }

        tabla.setItems(comprasList);

        return tabla;
    }

    @Override
    public void stop() throws Exception {
        // Cerrar pool de conexiones cuando la aplicación JavaFX termine
        try {
            com.inventario.persistence.DataSourceFactory.close();
        } catch (Exception ex) {
            System.err.println("Error closing DataSource: " + ex.getMessage());
        }
        super.stop();
    }

    public static void main(String[] args) {
        launch(args);
    }
}