# 📱 Inventory Management System - Portfolio Project

## 🎯 Descripción General

Sistema web de gestión de inventarios moderno, escalable y completamente funcional. Migración exitosa de un proyecto universitario Java/JavaFX a una arquitectura web moderna usando **React + Supabase + Vercel**.

**Demostración**: https://proyecto-inventario-web-*.vercel.app  
**Código Fuente**: https://github.com/KaizenStudioDev/proyecto-inventario-web

---

## 🏗️ Arquitectura Técnica

### Frontend
```
React 18 + Vite
    ↓
Tailwind CSS (Responsive UI)
    ↓
Custom Hooks (State Management)
    ↓
Supabase JS Client (API)
```

### Backend
```
Supabase (PostgreSQL 15)
    ↓
RLS Policies (Authorization)
    ↓
Triggers & Functions (Business Logic)
    ↓
Auth System (JWT-based)
```

### Infraestructura
```
GitHub (Version Control)
    ↓
Vercel (CI/CD + Hosting)
    ↓
Global CDN (Edge Performance)
```

---

## ✨ Características Principales

### 1️⃣ Autenticación Segura
- Email/Password con Supabase Auth
- JWT tokens automáticos
- Role-based access control (admin/staff)
- Auto-logout en inactividad

### 2️⃣ Gestión de Productos
- CRUD completo con modal
- Búsqueda y filtrado
- SKU único por producto
- Control de stock con mínimos
- Colores de estado (OK/LOW/OUT)

### 3️⃣ Alertas de Stock
- Alertas automáticas en tiempo real
- Clasificación: OUT_OF_STOCK vs LOW_STOCK
- Recuento de productos por estado
- Refresh manual

### 4️⃣ Ventas & Compras
- Carrito de compra dinámico
- Cálculo automático de totales
- Relaciones cliente/proveedor
- Historial de transacciones
- Estados de transacción (PENDING/COMPLETED/CANCELLED)

### 5️⃣ Dashboard Ejecutivo
- 5 KPI cards principales:
  - Total de Ventas
  - Total de Compras
  - Valor de Inventario
  - Productos en Stock
  - Productos Sin Stock
- Quick stats (ganancia, rotación, reorden)
- Estado del sistema

---

## 🗄️ Base de Datos

### Tablas Core (9)
```sql
products              -- Catálogo de productos
suppliers             -- Proveedores
customers             -- Clientes
sales                 -- Transacciones de venta
sale_items            -- Ítems por venta
purchases             -- Transacciones de compra
purchase_items        -- Ítems por compra
stock_movements       -- Auditoría de stock
audit_log             -- Registro de cambios
```

### Triggers Automáticos (6)
- Auto-crear perfil al registrarse
- Auto-actualizar stock en ventas
- Auto-actualizar stock en compras
- Auto-calcular totales
- Auto-actualizar timestamps
- Auto-registrar cambios

### Views Analíticas (7)
- `view_low_stock_products` - Alertas
- `view_sales_summary` - Resumen ventas
- `view_purchase_summary` - Resumen compras
- `view_top_selling_products` - Top 10 productos
- `view_stock_history` - Movimientos
- `view_customer_profile` - Perfil cliente
- `view_financial_snapshot` - Dashboard

### Functions PL/pgSQL (8)
- `get_stock_status()` - Estado de stock
- `format_currency()` - Formato USD
- `adjust_stock()` - Ajuste manual
- `get_stock_history()` - Historial
- `calculate_inventory_value()` - Valuación
- `count_by_stock_status()` - Conteo
- Y más...

---

## 🎨 Interfaz de Usuario

### Páginas Principales
1. **Auth Page** - Login/Signup
2. **Dashboard** - Overview con métricas
3. **Products** - Gestión de catálogo
4. **Alerts** - Monitoreo de stock
5. **Sales** - Registro de ventas
6. **Purchases** - Registro de compras

### Diseño
- **Responsive**: Mobile-first, funciona en todos los dispositivos
- **Color Scheme**: Profesional con estados visuales claros
- **Accesibilidad**: WCAG 2.1 AA compliant
- **Performance**: Lazy loading, optimización de imágenes

---

## 📊 Datos Migrados

✅ **20 Productos** - Desde MySQL original  
✅ **8 Clientes** - Con información completa  
✅ **6 Proveedores** - Contactos y ubicaciones  

Mapeo automático de tipos de datos:
- `INT` → `UUID` (primary keys)
- `VARCHAR` → `text`
- `DECIMAL` → `numeric(12,2)`
- `DATETIME` → `timestamptz`

---

## 🔐 Seguridad

### RLS (Row Level Security)
```sql
-- Admin: acceso total
-- Staff: lectura general, write solo su data
-- Public: sin acceso
```

### Validaciones
- Constraints en BD (CHECK, UNIQUE, NOT NULL)
- Validación en frontend
- Sanitización de inputs
- CORS configurado
- Secrets seguros en Vercel

---

## 📈 Performance

### Optimizaciones
- **Code Splitting**: Lazy loading de páginas
- **Caching**: Supabase caching automático
- **Indexes**: En tablas principales
- **CDN**: Vercel edge locations globales
- **Compression**: Gzip en prod

### Métricas Esperadas
- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **TTFB**: < 600ms

---

## 🚀 Deployment

### Proceso
1. **GitHub**: Push con commits bien documentados
2. **CI/CD**: Vercel auto-build y test
3. **Staging**: Preview deployments automáticos
4. **Production**: Deploy a 1-click

### Monitoring
- Vercel Analytics habilitado
- Error logging en consola
- Performance monitoring
- Uptime tracking

---

## 💡 Decisiones de Diseño

### ¿Por qué Supabase?
- PostgreSQL nativo (relaciones complejas)
- RLS built-in (seguridad)
- Real-time subscriptions
- Auth integrado
- Muy buen precio (free tier)

### ¿Por qué React?
- Componentes reutilizables
- Estado centralizado con hooks
- Excelente ecosistema
- Comunidad grande

### ¿Por qué Tailwind?
- Utility-first (rápido de estilizar)
- Responsive por defecto
- Archivo CSS pequeño
- Sin JavaScript innecesario

### ¿Por qué Vercel?
- Mejor soporte Next.js/Vite
- Deploys instantáneos
- Preview automáticos
- Serverless functions (opcional)

---

## 📝 Documentación Incluida

- **README.md** - Setup y uso general
- **PHASE1_DEEPDIVE.md** - Diseño BD
- **PHASE3_MIGRATION.md** - Migración MySQL
- **PHASE4_VERCEL_DEPLOYMENT.md** - Deploy guía
- **FINAL_CHECKLIST.md** - Estado completo
- **Code Comments** - Documentados en todos los archivos

---

## 🔄 Flujo de Trabajo

### Desarrollo Local
```bash
cd inventory-web
npm install
npm run dev
# http://localhost:5175
```

### Build Production
```bash
cd inventory-web
npm run build
# Output: dist/
```

### Deploy
```bash
git push origin main
# Vercel auto-deploy
```

---

## 📚 Stack Completo

| Capa | Tecnología | Versión |
|------|-----------|---------|
| UI Framework | React | 18.x |
| Build Tool | Vite | 7.3.0 |
| Styling | Tailwind CSS | 4.x |
| Backend | Supabase | Latest |
| Database | PostgreSQL | 15 |
| Auth | Supabase Auth | JWT |
| Hosting | Vercel | Edge |
| VCS | Git/GitHub | - |

---

## 🎓 Lecciones Aprendidas

1. **Migración**: Java/JavaFX → React no es trivial
2. **Database**: PostgreSQL triggers > código de aplicación
3. **Auth**: Supabase RLS es poderoso pero requiere planeación
4. **Frontend**: Custom hooks reducen boilerplate significativamente
5. **DevOps**: Vercel simplifica deployment enormemente
6. **Testing**: Local development es crítico antes de deploy

---

## 🌟 Puntos Fuertes del Proyecto

✅ **Escalabilidad**: Arquitectura preparada para crecer  
✅ **Seguridad**: RLS + validaciones en BD + frontend  
✅ **Performance**: Optimizado para UX rápida  
✅ **Mantenibilidad**: Código limpio y bien documentado  
✅ **Portabilidad**: Funciona en cualquier navegador moderno  
✅ **Profesionalismo**: Listo para portfolio

---

## 🔮 Mejoras Futuras

- [ ] Reportes PDF/Excel
- [ ] Gráficos (Chart.js, Recharts)
- [ ] Búsqueda full-text
- [ ] Notificaciones email
- [ ] API REST pública (con API keys)
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Multiidioma (i18n)
- [ ] 2FA
- [ ] Webhooks

---

## 📞 Contacto & Links

- **GitHub**: https://github.com/KaizenStudioDev
- **Portfolio**: (añadir URL)
- **Email**: (tu email)
- **LinkedIn**: (tu perfil)

---

## 📄 Licencia

MIT License - Open source

---

**Desarrollado con ❤️ por KaizenStudioDev**  
**Diciembre 2025**
