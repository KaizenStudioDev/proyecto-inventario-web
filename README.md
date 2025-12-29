# Sistema de Gestión de Inventarios (Sprint 1)

Pequeña guía para ejecutar la demo del Sprint 1.

## ¿Qué incluye esta entrega?
- Prototipo de UI en `SistemaInventarioUI.java` con módulos: Dashboard, Clientes, Proveedores, Productos, Ventas, Compras.
- Navegación funcional desde la barra superior.
- Formulario modal para crear Clientes con validación básica; los clientes se guardan en memoria y se muestran en la tabla.
- Documento de requerimientos: `DOC_Requerimientos_Sprint1.md`.

## Requisitos técnicos
- JDK 17 instalado
- Maven
- JavaFX 21 (las dependencias están declaradas en `pom.xml`)

## Ejecutar la aplicación (PowerShell en Windows)

La aplicación necesita credenciales de base de datos para conectarse a MySQL. Si no se proporcionan, la app usa un conjunto de datos de ejemplo en memoria (de ahí que veas datos estáticos en la UI).

Opciones para proporcionar las credenciales:

- Opción A — archivo en el classpath (recomendado para desarrollo local):
	- Copia `src/main/resources/db.properties.example` a `src/main/resources/db.properties` y rellena `jdbc.url`, `jdbc.user` y `jdbc.pass` (NO subas este archivo con contraseñas al repositorio).
	- Ejecuta:
		```pwsh
		mvn clean compile
		mvn javafx:run
		```

- Opción B — pasar las credenciales al lanzar Maven (sin cambiar ficheros):
	- Ejemplo PowerShell (sustituye los valores):
		```pwsh
		mvn -Djdbc.url="jdbc:mysql://127.0.0.1:3306/inventario?useSSL=false" -Djdbc.user="root" -Djdbc.pass="secret" javafx:run
		```

Si `mvn javafx:run` falla por configuración del JDK/JavaFX, asegúrate de tener una JVM compatible y que las variables de entorno estén configuradas.

## Qué se implementó en este Sprint
- Navegación entre módulos a través de los botones del menú superior.
- Tabla reutilizable de `Clientes` enlazada a una `ObservableList` para que las altas se reflejen inmediatamente.
- Validación mínima en el formulario de cliente (Nombre, Documento y Teléfono obligatorios).
- Eliminación desde la columna "Acciones" (confirmación previa).

## Qué falta / próximas tareas
- Refactorizar código en paquetes (`model`, `ui`, `controller`).
- Persistencia (archivo o base de datos) para que los datos sobrevivan al cierre.
- Formularios de edición y validaciones más robustas.

## Notas sobre estética
- No se modificaron los estilos o paleta de colores elegidos inicialmente. Cambios realizados fueron únicamente funcionales y preservan el diseño.

---

Si quieres, puedo:
- Separar modelos a archivos independientes y añadir `package`.
- Implementar guardado en archivo (JSON/CSV) para persistencia ligera.
- Añadir pruebas unitarias básicas.

Indica qué prefieres y continuo con la siguiente tarea.

---

## Sprint 2 - Documentación y Modelado (Resumen)

En el Sprint 2 se migró la persistencia a JDBC (DAOs) con HikariCP y se añadió tolerancia a esquemas normalizados/legacy para ventas/compras. Además se generó documentación técnica y diagramas en PlantUML que se encuentran en:

- `Documentos externos/diagramas/` - contiene los archivos PlantUML (`.puml`) para ER, diagramas de clases, componentes, casos de uso, secuencia y actividad, además del script SQL `create_inventario.sql`.
- `Documentos externos/Sprint2_Diseño.md` - resumen del diseño, decisiones y lista de entregables.

Generar imágenes desde PlantUML (si está instalado):

```pwsh
plantuml "Documentos externos/diagramas/*.puml"
```

Si prefieres, puedo exportar los PNG/SVG directamente dentro del repo.
