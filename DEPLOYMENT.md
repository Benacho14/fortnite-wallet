# 🚀 Guía de Despliegue

Esta guía te mostrará cómo desplegar el proyecto en producción **GRATIS**.

---

## 📤 Paso 1: Subir a GitHub

### 1.1 Inicializar Git (si aún no lo has hecho)

```bash
cd d:\wallet_def
git init
git add .
git commit -m "Initial commit: Virtual Wallet"
```

### 1.2 Crear Repositorio en GitHub

1. Ve a: https://github.com/new
2. Repository name: `virtual-wallet`
3. Visibility: Public o Private
4. Click "Create repository"

### 1.3 Conectar y Subir

```bash
# Reemplaza TU_USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/virtual-wallet.git
git branch -M main
git push -u origin main
```

---

## ☁️ Opción A: Desplegar en Render (RECOMENDADO)

**Ventajas**: Gratis, fácil, incluye PostgreSQL, SSL automático

### Paso 1: Crear Cuenta

1. Ve a: https://render.com
2. Sign up con GitHub
3. Autoriza a Render a acceder a tus repositorios

### Paso 2: Desplegar Base de Datos PostgreSQL

1. En Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configuración:
   - **Name**: `wallet-db`
   - **Database**: `wallet_virtual`
   - **User**: `wallet_user`
   - **Region**: Oregon (o el más cercano)
   - **PostgreSQL Version**: 15
   - **Datadog API Key**: (dejar vacío)
   - **Plan**: **Free**
3. Click **"Create Database"**
4. Espera 1-2 minutos
5. **COPIA la "Internal Database URL"** (la necesitarás para el backend)
   - Se ve como: `postgresql://wallet_user:xxx@dpg-xxx.oregon-postgres.render.com/wallet_virtual`

### Paso 3: Desplegar Backend

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect repository"** y selecciona `virtual-wallet`
3. Configuración:
   - **Name**: `wallet-backend`
   - **Region**: Oregon
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

4. **Environment Variables** (click "Advanced" antes de crear):
   ```
   DATABASE_URL = [pega la Internal Database URL que copiaste]
   JWT_SECRET = change-this-to-a-random-secret-in-production-xyz123
   NODE_ENV = production
   PORT = 3001
   FRONTEND_URL = https://wallet-frontend.onrender.com
   ```

5. Click **"Create Web Service"**

6. Espera 5-10 minutos a que despliegue

7. **Ejecutar Migraciones** (solo la primera vez):
   - En el dashboard del backend, ve a la pestaña **"Shell"** (abajo a la izquierda)
   - Ejecuta:
     ```bash
     npx prisma migrate deploy
     npm run seed
     ```
   - Deberías ver "Seeding completed!"

8. **Copia la URL del backend**:
   - Se ve como: `https://wallet-backend.onrender.com`

### Paso 4: Desplegar Frontend

1. Click **"New +"** → **"Static Site"**
2. Selecciona tu repositorio `virtual-wallet`
3. Configuración:
   - **Name**: `wallet-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL = https://wallet-backend.onrender.com/api
   ```
   (Reemplaza con la URL de tu backend del Paso 3.8)

5. Click **"Create Static Site"**

6. Espera 3-5 minutos

### Paso 5: Actualizar FRONTEND_URL en el Backend

1. Ve al dashboard de tu backend en Render
2. Ve a **"Environment"** (menú lateral)
3. Edita `FRONTEND_URL`:
   ```
   FRONTEND_URL = https://wallet-frontend.onrender.com
   ```
   (Usa la URL real de tu frontend)
4. Click **"Save Changes"**
5. El backend se redesplega automáticamente (1-2 min)

### Paso 6: ¡Listo!

Tu app está desplegada en:
- **Frontend**: https://wallet-frontend.onrender.com
- **Backend**: https://wallet-backend.onrender.com

**Credenciales de prueba**:
- Admin: admin@wallet.com / password123
- User 1: alice@example.com / password123
- User 2: bob@example.com / password123

---

## ☁️ Opción B: Vercel (Frontend) + Railway (Backend)

### Backend en Railway

1. Ve a: https://railway.app
2. Sign up con GitHub
3. **"New Project"** → **"Deploy from GitHub repo"**
4. Selecciona `virtual-wallet`
5. Configuración:
   - **Root Directory**: `backend`
   - **Environment Variables**:
     ```
     DATABASE_URL = [tu URL de Neon o Railway Postgres]
     JWT_SECRET = ...
     NODE_ENV = production
     FRONTEND_URL = https://tu-app.vercel.app
     ```
6. En Settings → **"Generate Domain"**
7. Ejecuta migraciones en el Shell de Railway

### Frontend en Vercel

1. Ve a: https://vercel.com
2. **"Import Project"** → GitHub
3. Selecciona `virtual-wallet`
4. Configuración:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Environment Variables**:
     ```
     VITE_API_URL = https://tu-backend.railway.app/api
     ```
5. **Deploy**

---

## 🔄 Actualizar el Proyecto (después del primer deploy)

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de cambios"
git push
```

**Render/Vercel/Railway redesplegarán automáticamente** 🎉

---

## 🐛 Troubleshooting

### Error: "Application failed to respond"
- Verifica que el backend tenga `PORT=3001` en las variables de entorno
- Revisa los logs en Render Dashboard

### Error: "Failed to fetch"
- Verifica que `VITE_API_URL` en el frontend apunte a la URL correcta del backend
- Asegúrate de incluir `/api` al final

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` en el backend sea la Internal URL de Render
- Ejecuta `npx prisma migrate deploy` en el Shell del backend

### WebSocket no conecta
- Verifica que `FRONTEND_URL` en el backend apunte al frontend correcto
- Los WebSockets funcionan con HTTPS automáticamente en Render

---

## 💰 Costos

**Plan Gratuito de Render**:
- ✅ PostgreSQL: 1GB storage (más que suficiente)
- ✅ Backend: Se duerme después de 15 min de inactividad
- ✅ Frontend: Siempre activo
- ✅ SSL/HTTPS incluido
- ✅ Sin tarjeta de crédito requerida

**Limitaciones del plan Free**:
- El backend se duerme → primera request tarda 30-60 segundos en despertar
- 750 horas de compute/mes (suficiente para desarrollo)

---

## 🎯 Resumen Rápido

```bash
# 1. Subir a GitHub
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/virtual-wallet.git
git push -u origin main

# 2. Render
- Crear PostgreSQL (copiar Internal URL)
- Crear Web Service para backend (pegar URL de DB)
- Ejecutar migraciones en Shell: npx prisma migrate deploy && npm run seed
- Crear Static Site para frontend (poner URL del backend)
- Actualizar FRONTEND_URL en backend con URL del frontend

# 3. ¡Listo!
```

---

## 📚 Recursos

- [Render Docs](https://render.com/docs)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**¿Problemas?** Revisa los logs en el Dashboard de Render o abre un issue en GitHub.
