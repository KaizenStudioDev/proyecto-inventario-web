# Phase 4: Deployment a Vercel

## Instrucciones Paso a Paso

### Paso 1: Crear repositorio en GitHub

1. Ve a **https://github.com/new**
2. Nombre: `proyecto-inventario-web`
3. Descripción: "Web inventory management system - React + Vite + Supabase"
4. Haz clic en **Create repository**

### Paso 2: Hacer Push a GitHub

Una vez creado el repositorio, ejecuta en PowerShell:

```powershell
cd "c:\Users\tomas\OneDrive\Escritorio\Proyecto_Inventario"

# Cambia TU_USUARIO por tu usuario de GitHub
git remote set-url origin https://github.com/TU_USUARIO/proyecto-inventario-web.git

# Hacer push
git push -u origin main
```

Si te pide credenciales, usa un **Personal Access Token** (PAT):
- Ve a: https://github.com/settings/tokens
- Crea un nuevo token con permisos `repo`
- Usa como password el token cuando Git lo solicite

### Paso 3: Conectar Vercel

1. 🔗 Ve a **https://vercel.com** (crea cuenta si no tienes)
2. ✨ Haz clic en **New Project**
3. 🔍 Busca tu repositorio `proyecto-inventario-web`
4. 📁 Haz clic en **Import**

### Paso 4: Configurar Variables de Entorno en Vercel

En la pantalla de configuración, ve a **Environment Variables** y añade:

| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | Tu URL de Supabase (ej: `https://zlbwwwbhiogzjzjcpubd.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Tu anon key de Supabase |

**Dónde encontrar estas credenciales:**
- Ve a tu dashboard de Supabase
- **Project Settings** → **API**
- Copia `Project URL` y `anon public key`

### Paso 5: Build Settings

- **Framework**: `Vite`
- **Build Command**: `cd inventory-web && npm run build`
- **Output Directory**: `inventory-web/dist`
- **Install Command**: `npm install` (o déjalo automático)

Luego haz clic en **Deploy**.

### Paso 6: Esperar y Verificar

Vercel compilará y deployará tu aplicación. Esto toma 2-5 minutos. Una vez terminado:

✅ Recibirás una URL como: `https://proyecto-inventario-web.vercel.app`
✅ Tu aplicación estará en vivo en internet

### Paso 7: Probar el Deploy

1. Abre tu URL de Vercel
2. Inicia sesión con tu cuenta de Supabase
3. Verifica que:
   - Dashboard carga correctamente
   - Puedes ver los 20 productos
   - Las alertas funcionan
   - Puedes crear ventas/compras

---

## Solución de Problemas

### "Build failed"

**Causa**: Problemas con las dependencias o configuración

**Solución**:
1. Verifica que `inventory-web/package.json` tiene todas las dependencias
2. En Vercel, ve a **Settings** → **Build & Development**
3. Haz clic en **Redeploy**

### "Environment variables not found"

**Causa**: Las variables no se configuraron correctamente

**Solución**:
1. Ve a **Settings** → **Environment Variables**
2. Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén presentes
3. Haz clic en **Redeploy**

### "Blank page o errors en consola"

**Causa**: Posible problema con CORS o configuración de Supabase

**Solución**:
1. En Supabase, ve a **Project Settings** → **API**
2. Verifica que **CORS** está configurado para permitir tu dominio Vercel
3. O usa un CORS proxy

---

## Dominio Personalizado (Opcional)

Si quieres un dominio personalizado:

1. En Vercel, ve a **Settings** → **Domains**
2. Añade tu dominio (ej: `inventario.midominio.com`)
3. Sigue las instrucciones para configurar DNS
4. Espera 24-48 horas para propagación

---

## Resumen Final

| Componente | Stack | Deploy |
|-----------|-------|--------|
| Frontend | React 18 + Vite | Vercel |
| Backend | Supabase (PostgreSQL) | Supabase Cloud |
| Base de datos | PostgreSQL 15 | Supabase |
| Auth | Supabase Auth | Supabase |
| CDN | Vercel Edge | Global |

**Tu aplicación está lista para producción!** 🚀
