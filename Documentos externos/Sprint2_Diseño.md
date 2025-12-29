# Sprint 2 - Diseño Técnico y Entregables

Este documento resume los artefactos de diseño generados para el Sprint 2 y dónde encontrarlos en el repositorio.

## Resumen de cambios (Sprint 2)
- Migración de persistencia a JDBC usando DAOs (`Jdbc*Dao`) en lugar de JPA/Hibernate.
- Pool de conexiones con HikariCP y fallback `DriverManagerDataSource` para facilitar `mvn javafx:run`.
- DAOs tolerantes a esquemas: soportan tanto columnas legacy (`cliente`, `productos`) como schema normalizado con `venta_items`/`compra_items`.
- UI mejorada: listas observables, recalculo automático de totales, validaciones y actualizaciones de stock.

## Archivos generados
- `Documentos externos/diagramas/er_inventario.puml` — Diagrama ER (PlantUML).
- `Documentos externos/diagramas/class_diagram.puml` — Diagrama de clases (PlantUML).
- `Documentos externos/diagramas/component_diagram.puml` — Diagrama de componentes (PlantUML).
- `Documentos externos/diagramas/usecase_diagram.puml` — Diagrama de casos de uso (PlantUML).
- `Documentos externos/diagramas/sequence_venta.puml` — Diagrama de secuencia para registrar una venta.
- `Documentos externos/diagramas/activity_venta.puml` — Diagrama de actividad del flujo de venta.
- `Documentos externos/diagramas/deployment_diagram.puml` — Diagrama de despliegue.
- `Documentos externos/diagramas/create_inventario.sql` — Script DDL + seeds (MySQL).

## Cómo generar imágenes
1. Instala PlantUML y Graphviz localmente o usa la extensión de VSCode `PlantUML`.
2. En la carpeta `Documentos externos/diagramas/` ejecuta:

```pwsh
plantuml *.puml
```

Se generarán las imágenes PNG/SVG de cada diagrama.

## Recomendaciones
- Añadir los PNG exportados al repositorio en `Documentos externos/diagramas/images/` para la entrega final.
- Incluir el archivo `create_inventario.sql` en el paquete de entrega para que QA/ops puedan recrear la base de datos.
- Documentar en `Sprint2_Diseño.md` cualquier decisión de negocio importante (p. ej. por qué se mantiene compatibilidad con esquema legacy).

## Estado
- Diagrama PlantUML y SQL añadidos al repo. Próximo paso recomendado: exportar imágenes y añadir `Sprint2_Report.pdf` con capturas y breve guía de instalación.

---
Documento generado automáticamente por el asistente de desarrollo.
