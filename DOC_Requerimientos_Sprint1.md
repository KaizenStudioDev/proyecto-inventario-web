# Documento de Requerimientos - Sprint 1

Proyecto: Sistema de Gestión de Inventarios
Versión: Sprint 1

1. Identificación y Descripción del Problema
- Necesidad de una aplicación para gestionar inventarios, clientes, proveedores, ventas y compras en una pequeña/micro empresa.
- Permitir registro y consulta básica de entidades y generar registros de ventas/compras para seguimiento.

2. Objetivo General
- Entregar un prototipo funcional (UI) que permita la interacción básica con los módulos principales del sistema para validar requisitos con stakeholders.

3. Objetivos Específicos
- Mostrar un dashboard con estadísticas y alertas.
- Permitir CRUD mínimo (crear/listar) para Clientes, Proveedores y Productos (en memoria para Sprint 1).
- Proveer formularios modales para crear nuevas entidades y visualizarlas en tablas.
- Implementar navegación entre módulos desde la barra superior.

4. Requerimientos Funcionales (mínimos para Sprint 1)
- RF1: Mostrar Dashboard inicial.
- RF2: Navegación entre módulos (Dashboard, Clientes, Proveedores, Productos, Ventas, Compras).
- RF3: Formulario para registrar Clientes (Nombre, Documento, Teléfono, Email, Dirección) y listado en tabla.
- RF4: Formulario para registrar Proveedores y Productos (sin persistencia permanente).
- RF5: Validación básica de campos obligatorios en formularios.

5. Requerimientos No Funcionales
- RNF1: Interfaz coherente y estética definida (colores, tipografías y layout conservados).
- RNF2: Respuesta visible al usuario (Alertas) tras acciones.
- RNF3: Ejecución en JDK 17 con JavaFX 21.

6. Backlog (priorizado)
- Alta prioridad: Navegación entre módulos, registrar/listar Clientes en memoria, validación de formulario de Clientes, README y Documento de requerimientos.
- Media prioridad: Registrar Proveedores/Productos en memoria, acciones de editar/eliminar en tablas (editar opcional para Sprint 1).
- Baja prioridad: Persistencia en archivo o BD, reportes y exportes.

7. Herramientas de Implementación y Desarrollo
- Lenguaje: Java 17
- UI: JavaFX 21 (controls, fxml no obligatorio)
- Build: Maven (usar `mvn javafx:run` para ejecutar la aplicación en desarrollo)

8. Herramientas de Consumo a nivel de desarrollo e Interfaz
- Uso de `TableView`, `Dialog`/`Stage` modal, `ObservableList` para mantener listas en memoria.

9. Criterios de Aceptación Sprint 1
- Documento de requerimientos presente en el repo.
- Prototipo visual disponible y ejecutable.
- Navegación funciona y formulario de Clientes permite crear entradas visibles en la tabla.

10. Evidencia de Reunión (mínima)
- Reunión inicial: acuerdo sobre alcance mínimo (documento y prototipo). (Acta breve: validar requerimientos y priorizar: Navigation + Clientes en memoria + Documentación)

---

Notas de la entrega técnica:
- Se preservó la estética original (colores y estilos) del UI al implementar la funcionalidad mínima.
- Implementación realizada: navegación en la barra superior (botones) y registro de Clientes en memoria usando `ObservableList`.
- Pendiente: mover modelos a paquetes separados y añadir persistencia (Sprints posteriores).

## Nota sobre Sprint 2
En el Sprint 2 se implementó la persistencia con JDBC (DAOs), pooling HikariCP y se añadieron artefactos de diseño y modelado. Consulta `Documentos externos/Sprint2_Diseño.md` y la carpeta `Documentos externos/diagramas/` para ver los diagramas ER, UML y el script SQL `create_inventario.sql`.
