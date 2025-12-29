Sprint 3 — Pasos rápidos para ejecutar pruebas y UI

1) Pre-requisitos
- JDK 17+ instalado
- Maven instalado
- MySQL corriendo con la base `inventario` creada (puedes ejecutar `Documentos externos/Diagramas/create_inventario.sql`)
- Asegúrate de que `src/main/resources/db.properties` contiene la URL/usuario/contraseña adecuados (no subir credenciales a VCS)

2) Preparar dependencias de runtime
Desde la raíz del proyecto (donde está `pom.xml`):

```powershell
mvn dependency:copy-dependencies -DincludeScope=runtime
```

Esto coloca las dependencias en `target/dependency` y deja las clases compiladas en `target/classes`.

3) Ejecutar las pruebas-main (clases con `main()` que verifican DAOs)
Estas clases están en `src/main/java/com/inventario/persistence` y aceptan propiedades JVM `-Djdbc.url`, `-Djdbc.user`, `-Djdbc.pass`.
Usa PowerShell y pasa las propiedades crudas con `--%` para evitar que PowerShell procese los `-D`.

Ejemplo (ajusta según tu `db.properties`):

```powershell
java --% -Djdbc.url=jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false -Djdbc.user=root -Djdbc.pass=TU_PASS -cp target\classes;target\dependency\* com.inventario.persistence.TestJdbcClientes
java --% -Djdbc.url=jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false -Djdbc.user=root -Djdbc.pass=TU_PASS -cp target\classes;target\dependency\* com.inventario.persistence.TestJdbcProductos
java --% -Djdbc.url=jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false -Djdbc.user=root -Djdbc.pass=TU_PASS -cp target\classes;target\dependency\* com.inventario.persistence.TestJdbcProveedores
java --% -Djdbc.url=jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false -Djdbc.user=root -Djdbc.pass=TU_PASS -cp target\classes;target\dependency\* com.inventario.persistence.TestJdbcCompras
java --% -Djdbc.url=jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false -Djdbc.user=root -Djdbc.pass=TU_PASS -cp target\classes;target\dependency\* com.inventario.persistence.TestJdbcVentas
```

4) Ejecutar la aplicación UI (JavaFX)
La aplicación principal es `com.inventario.SistemaInventarioUI` y lee `db.properties` por defecto. Ejecutar JavaFX desde línea de comandos depende de cómo tengas configurado Java/JavaFX en tu sistema; la forma más directa es usar Maven si tienes configurado el `javafx` plugin, o ejecutar con el classpath y módulos correctos.

Comando mínimo (ejemplo muy común en Windows con dependencias en `target/dependency`):

```powershell
java --% -Djdbc.url=jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false -Djdbc.user=root -Djdbc.pass=TU_PASS -cp target\classes;target\dependency\* com.inventario.SistemaInventarioUI
```

Nota: Si ves errores relacionados con JavaFX (NoClassDefFoundError), tendrás que ejecutar con los jars de JavaFX en el module-path o usar el `javafx:run` del plugin Maven.

5) Buenas prácticas
- No comites `db.properties` con credenciales reales; usa `db.properties.example` en VCS y añade `db.properties` a `.gitignore`.
- Para pruebas automatizadas, mover los `main()` a tests JUnit en `src/test/java` y mockear la BD o usar una base en memoria (H2) ayudará a CI.

7) Ejecutar la suite de tests JUnit (maven)

Desde la raíz del proyecto simplemente ejecutar:

```powershell
mvn test
```

Si necesitas forzar las propiedades JDBC desde PowerShell (para sobreescribir `src/main/resources/db.properties`), usa el modo raw `--%` para que PowerShell no interprete los `-D`:

```powershell
mvn --% -Djdbc.url=jdbc:mysql://127.0.0.1:1511/inventario?useSSL=false -Djdbc.user=root -Djdbc.pass=TU_PASS test
```

Si prefieres ejecutar una única clase de test:

```powershell
mvn -Dtest=com.inventario.persistence.ComprasVentasIntegrationTest test
```

6) Siguientes tareas sugeridas (Sprint 3)
- Convertir los `TestJdbc*.java` en pruebas JUnit en `src/test/java`.
- Añadir scripts `mvn verify` para ejecutar integración con una base de datos de prueba.
- Finalizar documentación de despliegue y volcado SQL para entrega.

8) Limpieza de datos de prueba

Se incluye un script `Documentos externos/test_cleanup.sql` (o usa tu propia política de borrado) para eliminar entradas creadas por las pruebas automatizadas (nombres que empiezan por `TEST-`, `INT-PROD-`, `TEST-PROV-`, `TEST-CLIENTE`, `CONC-PROD-`). Ejecuta el script en tu base `inventario` si quieres dejarla limpia antes de la entrega.

---
Generado automáticamente por el asistente mientras completábamos la checklist del Sprint 3.
