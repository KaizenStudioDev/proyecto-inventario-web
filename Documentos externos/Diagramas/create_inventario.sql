-- create_inventario.sql
-- Crea la BD y tablas principales para el sistema de inventario

DROP database inventario;
CREATE DATABASE IF NOT EXISTS `inventario` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `inventario`;

CREATE TABLE IF NOT EXISTS `clientes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `documento` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `direccion` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `documento` (`documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `proveedores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `empresa` VARCHAR(255) NOT NULL,
  `nit` VARCHAR(50) DEFAULT NULL,
  `contacto` VARCHAR(255) DEFAULT NULL,
  `telefono` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `productos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `categoria` VARCHAR(100) DEFAULT NULL,
  `precio_compra` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `precio_venta` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `stock` INT DEFAULT 0,
  `stock_minimo` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `ventas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `cliente_id` INT DEFAULT NULL,
  `total` DECIMAL(15,2) DEFAULT 0.00,
  `estado` VARCHAR(50) DEFAULT 'Pendiente',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ventas_cliente` (`cliente_id`),
  CONSTRAINT `fk_ventas_clientes` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `venta_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `venta_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `cantidad` INT NOT NULL DEFAULT 1,
  `precio_unitario` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `idx_vi_venta` (`venta_id`),
  KEY `idx_vi_producto` (`producto_id`),
  CONSTRAINT `fk_vi_venta` FOREIGN KEY (`venta_id`) REFERENCES `ventas`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vi_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `compras` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `proveedor_id` INT DEFAULT NULL,
  `total` DECIMAL(15,2) DEFAULT 0.00,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_compras_proveedor` (`proveedor_id`),
  CONSTRAINT `fk_compras_proveedores` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `compra_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `compra_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `cantidad` INT NOT NULL DEFAULT 1,
  `precio_unitario` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `idx_ci_compra` (`compra_id`),
  KEY `idx_ci_producto` (`producto_id`),
  CONSTRAINT `fk_ci_compra` FOREIGN KEY (`compra_id`) REFERENCES `compras`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Optional: simple migrations_log for compatibility with older tooling
CREATE TABLE IF NOT EXISTS `migrations_log` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `script` VARCHAR(255) NOT NULL,
  `executed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Seed clientes
INSERT INTO clientes (nombre, documento, telefono, email, direccion) VALUES
('Juan Pérez','CC1001','3001112222','juan.perez@example.com','Calle 1 #10-20'),
('María Gómez','CC1002','3003334444','maria.gomez@example.com','Calle 2 #15-30'),
('Carlos Ruiz','CC1003','3005556666','carlos.ruiz@example.com','Calle 3 #5-10');

-- Seed proveedores
INSERT INTO proveedores (empresa, nit, contacto, telefono, email) VALUES
('Distribuciones ABC','NIT100','Ana Torres','3112223333','ana.torres@abc.com'),
('ProveeTech','NIT200','Luis Morales','3114445555','luis@proveetech.com');

-- Seed productos
INSERT INTO productos (nombre, categoria, precio_compra, precio_venta, stock, stock_minimo) VALUES
('Laptop Modelo A','Electronica',1500000,3000000,30,1),
('Mouse Óptico','Accesorios',150000,300000,100,1),
('Teclado Mecánico','Accesorios',200000,400000,200,1),
('Monitor 24"','Electronica',700000,1500000,100,1);

INSERT INTO clientes (nombre, documento, telefono, email, direccion) VALUES
('Laura Restrepo', 'CC2001', '3024458899', 'laura.restrepo@gmail.com', 'Cra 45 # 120-30, Bogotá'),
('Andrés Cárdenas', 'CC2002', '3157789901', 'andres.cardenas@yahoo.com', 'Av Caracas # 50-12, Bogotá'),
('Sofía Hernández', 'CC2003', '3115698741', 'sofia.hdz@hotmail.com', 'Cl 80 # 25-60, Medellín'),
('Julián Ramírez', 'CC2004', '3009987412', 'julian.ramirez@outlook.com', 'Cll 30 # 18-55, Cali'),
('Valentina Torres', 'CC2005', '3167841223', 'valentina.torres@gmail.com', 'Cra 7 # 98-20, Bogotá');

INSERT INTO proveedores (empresa, nit, contacto, telefono, email) VALUES
('TecnoImport S.A.S', '900123456-7', 'Camilo Duarte', '3205567890', 'contacto@tecnoimport.com'),
('ElectroAndes LTDA', '890456789-1', 'Mónica Ruiz', '3217788990', 'ventas@electroandes.com'),
('RedCom Distribuciones', '901234567-8', 'Sergio Andrade', '3106654433', 'sergio@redcom.co'),
('Infinity Tech Colombia', '901908765-2', 'Diana Paez', '3128004455', 'diana.paez@infinitytech.co');

INSERT INTO productos (nombre, categoria, precio_compra, precio_venta, stock, stock_minimo) VALUES
('Impresora HP DeskJet 2700', 'Electrónica', 280000, 450000, 25, 2),
('Audífonos Bluetooth Xiaomi', 'Accesorios', 60000, 120000, 80, 5),
('Disco SSD Kingston 480GB', 'Electrónica', 120000, 210000, 50, 3),
('Router TP-Link AC1200', 'Redes', 90000, 180000, 40, 2),
('Memoria USB 32GB SanDisk', 'Accesorios', 15000, 35000, 200, 10),
('Silla Gamer Reclinable', 'Mobiliario', 300000, 550000, 10, 1),
('Cable HDMI 2.0 2m', 'Accesorios', 8000, 20000, 150, 10);

INSERT INTO compras (proveedor_id, total) VALUES
(1, 1500000),
(2, 2200000),
(3, 950000),
(4, 3000000);

INSERT INTO compra_items (compra_id, producto_id, cantidad, precio_unitario) VALUES
(1, 5, 100, 15000),    -- USB SanDisk
(1, 7, 50, 8000),      -- Cable HDMI
(2, 1, 20, 280000),    -- Impresora HP
(2, 3, 30, 120000),    -- SSD Kingston
(3, 2, 60, 60000),     -- Audífonos Xiaomi
(4, 6, 5, 300000),     -- Silla Gamer
(4, 4, 25, 90000);     -- Router AC1200

INSERT INTO ventas (cliente_id, total, estado) VALUES
(1, 450000, 'Pagado'),
(3, 980000, 'Pagado'),
(2, 120000, 'Pendiente'),
(5, 350000, 'Pagado'),
(4, 210000, 'Pagado');

INSERT INTO venta_items (venta_id, producto_id, cantidad, precio_unitario) VALUES
(1, 1, 1, 3000000),         -- Laptop Modelo A
(2, 4, 2, 1500000),         -- Monitor 24"
(3, 2, 1, 300000),          -- Mouse Óptico
(4, 5, 10, 35000),          -- USB SanDisk 32GB
(5, 3, 1, 400000);          -- Teclado Mecánico

INSERT INTO productos (nombre, categoria, precio_compra, precio_venta, stock, stock_minimo) VALUES
-- ---------------------------
-- ELECTRÓNICA (Computadores, monitores, SSD, etc.)
-- ---------------------------
('Monitor LG 27" IPS 75Hz', 'Electrónica', 520000, 850000, 40, 2),
('Monitor Samsung Curvo 24"', 'Electrónica', 480000, 790000, 30, 2),
('Portátil HP Ryzen 5 8GB 512GB', 'Electrónica', 1300000, 2100000, 15, 1),
('Portátil Lenovo IdeaPad 3 i5', 'Electrónica', 1400000, 2350000, 10, 1),
('MacBook Air M1 256GB', 'Electrónica', 3500000, 4500000, 8, 1),
('Impresora Epson EcoTank L3250', 'Electrónica', 650000, 950000, 20, 2),
('Tablet Samsung A9', 'Electrónica', 480000, 780000, 25, 3),
('Tablet Lenovo M10 HD', 'Electrónica', 420000, 680000, 22, 2),
('Disco SSD Kingston 240GB', 'Electrónica', 85000, 140000, 200, 10),
('Disco SSD Adata 480GB', 'Electrónica', 125000, 210000, 150, 8),
('Disco SSD WD Green 1TB', 'Electrónica', 280000, 420000, 50, 3),
('HDD Seagate 1TB 7200RPM', 'Electrónica', 160000, 270000, 60, 5),
('Memoria RAM DDR4 8GB', 'Electrónica', 70000, 130000, 180, 5),
('Memoria RAM DDR4 16GB', 'Electrónica', 130000, 220000, 160, 5),
('Tarjeta Gráfica RTX 3060 12GB', 'Electrónica', 1400000, 1900000, 12, 1),
('Tarjeta Gráfica GTX 1660 Super', 'Electrónica', 950000, 1350000, 10, 1),
('Fuente de poder 600W 80Plus', 'Electrónica', 150000, 260000, 70, 5),
('Board ASUS H510M-K', 'Electrónica', 240000, 380000, 35, 3),
('Board Gigabyte B450M', 'Electrónica', 260000, 400000, 32, 3),

-- ---------------------------------
-- ACCESORIOS (Periféricos, USB, cables)
-- ---------------------------------
('Mouse Gamer Redragon Cobra', 'Accesorios', 65000, 120000, 150, 10),
('Mouse Logitech M170', 'Accesorios', 30000, 60000, 200, 10),
('Teclado Gamer Redragon Kumara', 'Accesorios', 90000, 160000, 120, 5),
('Teclado Logitech K120', 'Accesorios', 25000, 50000, 200, 8),
('Combo Teclado + Mouse Genius', 'Accesorios', 35000, 70000, 150, 8),
('Mousepad Extended 80cm', 'Accesorios', 15000, 30000, 300, 20),
('Audífonos Logitech H390', 'Accesorios', 75000, 130000, 80, 4),
('Audífonos Gamer HyperX Stinger', 'Accesorios', 150000, 250000, 50, 3),
('Cámara Web Logitech C270', 'Accesorios', 70000, 120000, 70, 5),
('Micrófono Condensador Fifine K690', 'Accesorios', 190000, 300000, 30, 1),
('Memoria USB 16GB Kingston', 'Accesorios', 10000, 20000, 300, 20),
('Memoria USB 64GB SanDisk', 'Accesorios', 20000, 45000, 250, 15),
('Cable HDMI 1.8m 4K', 'Accesorios', 7000, 18000, 400, 30),
('Cable USB-C 1m', 'Accesorios', 5000, 15000, 350, 20),
('Adaptador USB Bluetooth 5.0', 'Accesorios', 12000, 30000, 120, 10),
('Hub USB 4 Puertos', 'Accesorios', 15000, 35000, 100, 10),
('Lámpara LED de escritorio', 'Accesorios', 20000, 45000, 80, 5),

-- -------------------
-- REDES Y SEGURIDAD
-- -------------------
('Router TP-Link Archer C6', 'Redes', 115000, 190000, 40, 2),
('Router Huawei AX3', 'Redes', 170000, 260000, 30, 2),
('Repetidor Xiaomi Mi WiFi', 'Redes', 30000, 60000, 120, 10),
('Switch TP-Link 8 puertos', 'Redes', 65000, 120000, 50, 3),
('Switch Gigabit 5 Puertos', 'Redes', 55000, 100000, 50, 3),
('Cámara IP WiFi 1080p', 'Seguridad', 50000, 110000, 90, 5),
('Kit CCTV 4 Cámaras Dahua', 'Seguridad', 650000, 950000, 10, 1),
('DVR 8 canales Hikvision', 'Seguridad', 270000, 450000, 15, 1),
('Cerradura Digital Yale', 'Seguridad', 450000, 700000, 5, 1),

-- -------------------
-- OFICINA Y PAPELERÍA
-- -------------------
('Resma Papel Carta 500h', 'Oficina', 12000, 25000, 300, 20),
('Resma Papel Oficio 500h', 'Oficina', 15000, 30000, 250, 20),
('Grapadora metálica', 'Oficina', 8000, 18000, 120, 10),
('Caja de Clips N°1', 'Oficina', 2000, 6000, 500, 30),
('Borradores Pelikan', 'Oficina', 500, 1500, 700, 40),
('Resaltadores x4', 'Oficina', 4500, 9000, 200, 10),
('Agenda Ejecutiva 2025', 'Oficina', 8000, 20000, 100, 10),
('Carpeta AZ gruesa', 'Oficina', 6000, 15000, 150, 15),

-- ----------
-- GAMING
-- ----------
('Silla Gamer Azul-Negro', 'Gaming', 300000, 550000, 12, 1),
('Silla Gamer Roja', 'Gaming', 300000, 550000, 12, 1),
('Control Xbox Series X', 'Gaming', 180000, 270000, 20, 3),
('Control PS5 DualSense', 'Gaming', 250000, 350000, 15, 3),
('Auriculares PS5 Pulse 3D', 'Gaming', 350000, 480000, 8, 1),
('Base Cargadora PS5', 'Gaming', 80000, 150000, 25, 2),
('Mouse Gamer Glorious Model O', 'Gaming', 210000, 330000, 20, 2),
('Teclado RGB Redragon Draconic', 'Gaming', 160000, 260000, 20, 2),
('Tira LED RGB 5m', 'Gaming', 18000, 35000, 100, 10),

-- ---------------
-- HOGAR
-- ---------------
('Ventilador de Torre 80cm', 'Hogar', 90000, 160000, 30, 2),
('Aspiradora Koblenz 1400W', 'Hogar', 180000, 260000, 15, 2),
('Licuadora Oster 10 velocidades', 'Hogar', 95000, 180000, 20, 2),
('Plancha Oster Vapor', 'Hogar', 45000, 90000, 40, 3),
('Tostadora 2 ranuras', 'Hogar', 55000, 100000, 25, 2),
('Microondas Haceb 20L', 'Hogar', 180000, 270000, 15, 1),
('Freidora de Aire 4L', 'Hogar', 150000, 240000, 18, 1),
('Cafetera Oster 12 tazas', 'Hogar', 70000, 130000, 18, 1),

-- -------------------
-- HERRAMIENTAS
-- -------------------
('Taladro Black+Decker 550W', 'Herramientas', 120000, 200000, 25, 2),
('Juego de Destornilladores 32 en 1', 'Herramientas', 20000, 45000, 70, 5),
('Multímetro Digital Uni-T', 'Herramientas', 45000, 90000, 40, 2),
('Pistola de Silicona Pequeña', 'Herramientas', 7000, 15000, 120, 10),
('Cautín 60W', 'Herramientas', 20000, 38000, 50, 3),
('Caja de Herramientas 100 piezas', 'Herramientas', 90000, 180000, 20, 2),
('Llave Inglesa 10"', 'Herramientas', 15000, 30000, 80, 5),
('Tijeras Industriales', 'Herramientas', 5000, 15000, 120, 10),

-- -------------------
-- MANTENIMIENTO
-- -------------------
('Limpia Contactos Aerosol', 'Mantenimiento', 12000, 30000, 60, 5),
('Grasa Térmica Arctic MX-4', 'Mantenimiento', 30000, 55000, 40, 3),
('Alcohol Isopropílico 1L', 'Mantenimiento', 9000, 20000, 80, 5),
('Paño Microfibra x3', 'Mantenimiento', 5000, 12000, 100, 10),
('Kit limpieza mantenimiento PC', 'Mantenimiento', 15000, 35000, 80, 5),

-- -------------------
-- ILUMINACIÓN LED
-- -------------------
('Bombillo LED 12W Luz Blanca', 'Iluminación', 5000, 12000, 300, 20),
('Tira LED 12V 10m', 'Iluminación', 18000, 35000, 150, 10),
('Reflector LED 50W', 'Iluminación', 28000, 60000, 60, 5),
('Panel LED Techo 18W', 'Iluminación', 15000, 35000, 100, 8),
('Bombillo Inteligente RGB WiFi', 'Iluminación', 20000, 45000, 80, 5);

-- End of script
