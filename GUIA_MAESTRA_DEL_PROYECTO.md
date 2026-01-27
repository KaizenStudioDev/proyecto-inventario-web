# GUÍA MAESTRA DEL PROYECTO

## Plataforma Empresarial Modular con Licencias

Este documento funciona como **segundo soporte oficial del proyecto**, complementando el archivo `AUDITORIA.md`. Su objetivo es servir como **guía estratégica, técnica y conceptual** para todas las decisiones presentes y futuras del sistema.

---

## 1. VISIÓN GENERAL

El proyecto no es un simple sistema de inventarios. Es una **plataforma empresarial modular**, pensada para ser:

* Instalable en dispositivos del cliente (on‑premise)
* Escalable por módulos
* Controlada por licencias
* Comercializada mediante membresía mensual (soporte + actualizaciones)

Existe **un solo software**, con **tres productos comerciales**, diferenciados únicamente por **licencias y permisos**, no por versiones separadas de código.

---

## 2. MODELO DE NEGOCIO

### Productos

1. **Inventario Básico**
2. **Inventario + Ventas**
3. **Gestión Empresarial**

Todos comparten:

* El mismo backend
* La misma base de datos (con tablas activadas según licencia)
* La misma UI base

### Monetización

* Pago mensual (membresía)
* La membresía habilita:

  * Soporte técnico
  * Actualizaciones
* Si la membresía expira:

  * El software sigue funcionando
  * No se permiten actualizaciones
  * Se muestran avisos no intrusivos

---

## 3. PRINCIPIO ARQUITECTÓNICO CLAVE

> **NO existen 3 versiones del software**

Existe:

* 1 Core
* 1 Backend
* 1 Sistema de licencias
* N módulos activables

Toda la protección se hace **a nivel backend**.

El frontend **nunca** decide permisos.

---

## 4. ARQUITECTURA GENERAL (JAVA)

La arquitectura está diseñada para:

* Evitar accesos indebidos
* Proteger el trabajo
* Facilitar mantenimiento
* Permitir escalado

### Módulos principales

---

### 4.1 CORE

Responsabilidad:

* Arranque del sistema
* Contexto global
* Inicialización

Incluye:

* ApplicationBootstrap
* Contextos globales
* Configuración base

No contiene lógica de negocio.

---

### 4.2 LICENSING (CRÍTICO)

Responsabilidad:

* Cargar licencias
* Validarlas
* Activar funcionalidades

Conceptos clave:

* License
* ProductTier
* Feature
* Hardware Fingerprint

Toda funcionalidad pasa por un **FeatureGate**.

Si una feature no está habilitada:

* No se ejecuta
* No se renderiza
* No se instancia

---

### 4.3 INVENTORY

Incluido en:

* Inventario Básico
* Inventario + Ventas
* Gestión Empresarial

Incluye:

* Productos
* Categorías
* Stock
* Bodegas

Es el núcleo funcional mínimo.

---

### 4.4 SALES

Incluido en:

* Inventario + Ventas
* Gestión Empresarial

Incluye:

* Clientes
* Facturación
* Ventas
* Reportes básicos

Protegido por FeatureGate.

---

### 4.5 USERS & ROLES

Incluido en todos los productos.

Roles controlan **usuarios**.
Licencias controlan **empresa**.

Nunca se mezclan.

---

### 4.6 REPORTS

Incluido en:

* Inventario + Ventas
* Gestión Empresarial

Incluye:

* Reportes de ventas
* Reportes de inventario
* Exportaciones

---

### 4.7 ENTERPRISE

Incluido solo en:

* Gestión Empresarial

Incluye:

* Nómina
* Proveedores
* Multi‑sucursal
* Auditoría avanzada
* Configuraciones empresariales

---

### 4.8 AUDIT & LOGGING

Responsabilidad:

* Registrar acciones
* Registrar accesos
* Registrar errores
* Registrar eventos de licencia

Clave para:

* Seguridad
* Confianza
* Soporte

---

### 4.9 UPDATES & SUPPORT

Responsabilidad:

* Verificar actualizaciones
* Validar membresía
* Descargar parches

Si la membresía expira:

* No se descargan actualizaciones

---

## 5. SISTEMA DE LICENCIAS

### Características

* Licencia firmada digitalmente
* Atada a hardware
* Con fechas de validez
* Con nivel de producto

### Protecciones

* Firma RSA
* Fingerprint del dispositivo
* Validación en backend

Evita:

* Copias
* Desbloqueos manuales
* Uso indebido

---

## 6. SEGURIDAD Y PROTECCIÓN DEL CÓDIGO

Medidas clave:

* FeatureGate obligatorio
* Arquitectura por paquetes
* Servicios protegidos
* Sin lógica de permisos en frontend

El cliente **no puede** acceder a módulos superiores sin licencia válida.

---

## 7. RELACIÓN CON AUDITORIA.md

Las recomendaciones habituales de auditoría quedan cubiertas:

* Separación de responsabilidades
* Modularización
* Centralización de validaciones
* Logging estructurado
* Control de permisos
* Escalabilidad

Este documento define **cómo se implementan esas mejoras**.

---

## 8. LANDING Y DEMO

* 1 sola landing
* 3 productos visibles
* 1 demo funcional
* Accesos simulados según licencia

La landing comunica:

* Escalabilidad
* Profesionalismo
* Seguridad

---

## 9. OBJETIVO FINAL

Este proyecto busca:

* Crear un producto serio
* Generar ingresos recurrentes
* Construir reputación
* Escalar a largo plazo

No es un proyecto rápido.
Es una **base empresarial real**.

---

## 10. FILOSOFÍA DEL PROYECTO

> Construir una sola vez.
> Vender muchas veces.
> Mantener con calidad.
> Proteger el trabajo.

Este documento debe consultarse **antes de cualquier cambio estructural**.

---

**Fin del documento**
