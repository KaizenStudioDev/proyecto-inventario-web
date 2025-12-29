# 📦 Sistema de Gestión de Inventarios - Edición Web

**Migración exitosa**: Java/JavaFX → React + Supabase + Vercel

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-2.0%20Web-orange)

---

## 🚀 Demo en Vivo

**🌐 Accede a la aplicación**: https://proyecto-inventario-web-*.vercel.app

Credenciales de prueba:
```
Email: test@example.com
Password: test123456
```

---

## 📋 Descripción

Sistema web moderno y escalable para gestión de inventarios. Incluye:

- ✅ Autenticación segura con JWT
- ✅ CRUD de productos con stock control
- ✅ Gestión de clientes y proveedores
- ✅ Registro de ventas y compras
- ✅ Alertas automáticas de stock
- ✅ Dashboard con KPIs en tiempo real
- ✅ Base de datos relacional PostgreSQL
- ✅ Responsive design (mobile-first)

---

## 🏗️ Stack Tecnológico

### Frontend
```
React 18 + Vite + Tailwind CSS + PostCSS
```

### Backend
```
Supabase (PostgreSQL 15 + Auth + RLS)
```

### Infrastructure
```
Git/GitHub + Vercel + Global CDN
```

---

## 📁 Estructura del Proyecto

```
proyecto-inventario-web/
├── inventory-web/                  # Frontend React
│   ├── src/
│   │   ├── pages/                 # Páginas (Auth, Dashboard, CRUD)
│   │   ├── components/            # Componentes reutilizables
│   │   ├── lib/                   # Hooks y utilities
│   │   └── App.jsx               # Router principal
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── supabase/                       # Configuración BD
│   ├── schema.sql                 # Tablas + Triggers
│   ├── views.sql                  # Views analíticas
│   ├── functions.sql              # Functions PL/pgSQL
│   ├── policies.sql               # RLS Policies
│   └── migration_import.sql       # Script migración datos
│
├── src/                           # Código original (Java)
├── PHASE3_MIGRATION.md            # Guía migración
├── PHASE4_VERCEL_DEPLOYMENT.md    # Guía deploy
├── FINAL_CHECKLIST.md             # Estado proyecto
├── PORTFOLIO_PROJECT_SUMMARY.md   # Resumen ejecutivo
└── README.md                      # Este archivo
```

---

## 🚀 Inicio Rápido

### Opción 1: Usar Demo en Vivo
1. Accede a: https://proyecto-inventario-web-*.vercel.app
2. Crea una cuenta o usa las credenciales de prueba
3. ¡Listo!

### Opción 2: Desarrollo Local

#### Requisitos
- Node.js 16+
- npm o yarn
- Git

#### Pasos

1. **Clonar repositorio**
```bash
git clone https://github.com/KaizenStudioDev/proyecto-inventario-web.git
cd proyecto-inventario-web
```

2. **Instalar dependencias**
```bash
cd inventory-web
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar ejemplo
cp .env.example .env

# Editar .env y agregar tus credenciales de Supabase
VITE_SUPABASE_URL=https://tu-url.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
# http://localhost:5175
```

5. **Build para producción**
```bash
npm run build
# Output: dist/
```

---

## 📊 Características Principales

### 1. Dashboard Ejecutivo
- 5 KPI cards (ventas, compras, inventario, stock)
- Estadísticas rápidas
- Estado del sistema

### 2. Gestión de Productos
- CRUD completo
- Control de stock con mínimos
- Alertas visuales (OK/LOW/OUT_OF_STOCK)
- Búsqueda y filtrado

### 3. Transacciones
- Registro de ventas con carrito
- Registro de compras
- Cálculo automático de totales
- Historial de transacciones

### 4. Alertas
- Stock bajo automático
- Productos sin inventario
- Notificaciones en tiempo real

### 5. Seguridad
- Autenticación JWT
- RLS por rol (admin/staff)
- Validaciones en BD y frontend
- Audit log automático

---

## 🔐 Seguridad

### Protecciones Implementadas
- ✅ Supabase Auth (JWT tokens)
- ✅ RLS Policies (Row Level Security)
- ✅ Input validation (Frontend + Backend)
- ✅ CORS configurado
- ✅ Secrets seguros en Vercel
- ✅ Audit log de cambios

---

## 📈 Datos Incluidos

**20 Productos** migrados desde MySQL:
- Laptops, monitores, periféricos
- Sillas gaming, herramientas
- Accesorios de tecnología

**8 Clientes** de prueba:
- Ubicaciones en Colombia
- Información de contacto completa

**6 Proveedores** con datos reales:
- Distribuidoras tecnológicas
- Detalles de contacto

---

## 🔄 Fases del Proyecto

### Phase 1: Backend & Database ✅
- Schema PostgreSQL con 9 tablas
- 6 Triggers automáticos
- 7 Views analíticas
- 8 Functions PL/pgSQL
- RLS Policies completas

### Phase 2: Frontend ✅
- 8 Componentes React
- 6 Custom Hooks
- Layout responsivo
- Tailwind CSS styling

### Phase 3: Migración ✅
- MySQL → Postgres
- 20 productos importados
- 8 clientes migrados
- 6 proveedores migrados

### Phase 4: Deployment ✅
- GitHub repository
- Vercel hosting
- CI/CD automático
- Global CDN

---

## 📚 Documentación

- **PORTFOLIO_PROJECT_SUMMARY.md** - Resumen ejecutivo
- **FINAL_CHECKLIST.md** - Estado completo del proyecto
- **PHASE3_MIGRATION.md** - Detalles de migración
- **PHASE4_VERCEL_DEPLOYMENT.md** - Guía de deployment
- **supabase/README.md** - Setup de Supabase
- **supabase/PHASE1_DEEPDIVE.md** - Diseño de BD

---

## 🤝 Contribuciones

Este es un proyecto personal de portfolio. Para sugerencias o mejoras, abre un issue.

---

## 📝 Licencia

MIT License - Ver LICENSE para más detalles

---

## 👨‍💻 Autor

**KaizenStudioDev**  
GitHub: https://github.com/KaizenStudioDev

---

## 🙏 Agradecimientos

- React & Vite communities
- Supabase por el excelente BaaS
- Vercel por hosting confiable
- Tailwind CSS por styling utilities

---

**Última actualización**: 29 de Diciembre 2025  
**Status**: ✅ Production Ready

---

## 🎯 Próximos Pasos

1. **Testing**: Prueba todas las características en demo
2. **Feedback**: Abre issues para bugs o sugerencias
3. **Mejoras**: Ver sección "Roadmap" en PORTFOLIO_PROJECT_SUMMARY.md

¡Gracias por visitar! 🚀

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
