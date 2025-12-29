# Manual de Usuario — Sistema de Inventario

Este documento explica cómo preparar, compilar, ejecutar y usar la aplicación para que tu profesor pueda ejecutarla y probarla.

**Ubicación del proyecto:** `./` (raíz del workspace)

## Requisitos previos
- JDK 21 instalado y `JAVA_HOME` apuntando a la instalación (o JDK compatible con el `maven-compiler-plugin` del proyecto).
- Maven instalado (o usar el wrapper si se incluye). Ver `pom.xml`.
- Base de datos MySQL (o compatible) accesible. El proyecto espera una BD con el esquema provisto en `Documentos externos/Diagramas/create_inventario.sql`.
- Conexión a internet para descargar dependencias Maven la primera vez.
- Editor/IDE recomendado: IntelliJ IDEA o VS Code con plugin JavaFX/PlantUML (opcional).

## Estructura relevante
- `src/main/java/com/inventario/` — código fuente del UI y modelos.
- `src/main/resources/db.properties.example` — plantilla de configuración de BD.
- `Documentos externos/Diagramas/create_inventario.sql` — script SQL para crear las tablas y datos de ejemplo.
- `Documentos externos/Diagramas/` — contiene diagramas PlantUML (.puml).
- `MANUAL_USUARIO.md` — este manual.

## Paso 1 — Preparar la base de datos
1. Crear una base de datos (por ejemplo `inventario_db`) en tu servidor MySQL.
2. Ejecutar el script SQL para crear tablas y datos de ejemplo. En PowerShell:

```powershell
# Ajusta host, puerto, usuario y contraseña según tu entorno
mysql -h 127.0.0.1 -P 3306 -u root -p inventario_db < "Documentos externos/Diagramas/create_inventario.sql"
```

3. Configurar `src/main/resources/db.properties` (si no existe, copia `db.properties.example`):

```powershell
copy "src\main\resources\db.properties.example" "src\main\resources\db.properties"
# Edita src\main\resources\db.properties y pon tus credenciales/URL
```

Contenido típico de `db.properties` (ejemplo):

```
db.url=jdbc:mysql://127.0.0.1:3306/inventario_db
db.user=root
db.password=tu_password
db.maximumPoolSize=10
```

> Nota: el proyecto usa HikariCP y los DAOs JDBC. Asegúrate de que la URL y credenciales sean correctas.

## Paso 2 — Compilar el proyecto
Desde la raíz del proyecto, en PowerShell:

```powershell
mvn -DskipTests=false clean compile
```

- Si ves `BUILD SUCCESS` la compilación fue correcta. Hay advertencias `unchecked` pero son no-fatal.

## Paso 3 — Ejecutar la aplicación (JavaFX)
Para lanzar la app en modo de desarrollo:

```powershell
mvn javafx:run
```

- La aplicación abre la ventana principal con pestañas/menú: Dashboard, Productos, Ventas, Compras, Clientes, Proveedores.
- Si hay errores de conexión a BD, revisa `src/main/resources/db.properties` y el log del terminal (excepciones de JDBC / HikariCP).

## Uso de la aplicación (guía rápida)
A continuación están los módulos principales y cómo probarlos:

### Dashboard
- Muestra resúmenes (totales ventas, productos con stock bajo, etc.).
- El total de ventas se muestra en forma compacta (e.g., `$1M`) cuando el valor es grande.

### Productos
- Lista de productos, columna `stock` con coloreado:
  - **Rojo (SIN_STOCK)**: stock = 0.
  - **Amarillo (BAJO)**: stock <= `stockMinimo + 15` (lógica centralizada en `classifyStock(Producto)`).
  - **Verde (ALTO)**: resto.
- Filtro de productos: al aplicar un filtro la UI recarga la lista desde BD y aplica la clasificación antes de mostrar resultados (evita inconsistencias entre colores y resultados filtrados).

### Panel de alertas
- Panel que lista productos en estado `BAJO` o `SIN_STOCK`.
- Ahora es scrollable con la rueda del ratón (si hay muchas alertas).

### Ventas
- Crear una venta: seleccionar cliente, agregar productos y cantidades.
- El total de la venta se muestra con formato (separador de miles con `.` y prefijo `$`).
- La columna `Total` en la tabla de ventas está formateada.

### Compras
- Similar a Ventas: agregar ítems, ver listado.
- El footer del formulario de compras también muestra el total con formato correcto.

### Clientes / Proveedores
- Módulos CRUD básicos para clientes y proveedores.

## Funcionalidades y notas técnicas (qué se cambió en Sprint 4)
- Unificación de clasificación de stock en `SistemaInventarioUI.classifyStock(Producto)` y el `enum StockStatus`.
- Panel de alertas envuelto en `ScrollPane` para scroll vertical.
- Forzado de recarga de `productosList` desde `productoDao.findAll()` antes de filtrar.
- Helpers de formateo añadidos en la UI:
  - `formatWithDots(BigDecimal)` — separador de miles con punto.
  - `formatCurrencyForCell(BigDecimal)` — formato con signo `$` y separador de miles.
  - `formatCurrencyCompact(BigDecimal)` — abreviación para el dashboard.
- Corrección de handler malformado en clientes que generó errores de compilación previos.
- Diagrama de clases actualizado para incluir `StockStatus` y utilitarios de formato (archivo `Documentos externos/Diagramas/class_diagram_fixed.puml`).
- Diagrama de secuencia `sequence_filtro_producto.puml` que documenta: Usuario aplica filtro → UI recarga lista → aplica clasificación → actualiza tabla y alertas.

## Problemas comunes y solución rápida
- Error de conexión JDBC / HikariCP:
  - Revisar `src/main/resources/db.properties`.
  - Verificar que la BD `inventario_db` exista y que el usuario tenga permisos.
- La ventana JavaFX no aparece al ejecutar `mvn javafx:run`:
  - Asegúrate que la versión de JDK configurada sea la misma esperada (JDK 21).
  - Revisa logs del terminal para excepciones.
- Valores de totales sin formato:
  - Verifica que estés ejecutando la versión actual del código (compila y ejecuta `mvn clean compile` antes de `mvn javafx:run`).

## Ejecutar tests (si existen)
- Para ejecutar tests (si se agregan) usa:

```powershell
mvn test
```

Actualmente el proyecto no contiene tests unitarios exhaustivos; la verificación está basada en la ejecución manual (UI).

## Generar/Ver diagramas PlantUML
- Los `.puml` están en `Documentos externos/Diagramas/`.
- Para generar una imagen (requiere PlantUML o extensión en el editor):
  - Con PlantUML instalado o extensión VSCode PlantUML, abrir el archivo `*.puml` y usar el preview para exportar PNG/SVG.
  - O con jar de PlantUML:

```powershell
java -jar plantuml.jar "Documentos externos/Diagramas/class_diagram_fixed.puml"
```

## Lista de archivos relevantes cambiados en Sprint 4
- `src/main/java/com/inventario/SistemaInventarioUI.java` — cambios principales (classifyStock, formatters, scroll pane, fixes).
- `Documentos externos/Diagramas/class_diagram_fixed.puml` — diagrama de clases actualizado.
- `Documentos externos/Diagramas/sequence_filtro_producto.puml` — diagrama de secuencia del filtrado.

## Entrega al profesor — checklist
- [ ] Incluir el proyecto zip o repositorio con todo el código fuente.
- [ ] Incluir `db.properties` (o indicar claramente las credenciales en el manual) — preferible: dejar `db.properties.example` y pedir al profesor que lo complete.
- [ ] Incluir `create_inventario.sql` (ya en `Documentos externos/Diagramas/`).
- [ ] Incluir `MANUAL_USUARIO.md` (este archivo).

## Contacto / Reporte de problemas
Si el profesor detecta un error o no puede ejecutar la app, indícale:
- enviar la traza del terminal (logs del `mvn javafx:run`).
- verificar `db.properties` y que MySQL esté en ejecución.

---

Si quieres, puedo:
- Generar un archivo PDF del manual y añadirlo al repo.
- Reemplazar `class_diagram.puml` original por `class_diagram_fixed.puml` (mantendré copia de seguridad del original).
- Ejecutar la aplicación aquí y tomar capturas (si me autorizas a lanzar `mvn javafx:run`).

Dime cuál de estas opciones prefieres y la sigo.