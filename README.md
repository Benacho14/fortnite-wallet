# 🎮 Fortnite Virtual Wallet

## Estructura del Proyecto

```
fortnite-wallet/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── wallet.js
│   │   └── shop.js
│   ├── middleware/
│   │   └── auth.js
│   ├── data/
│   │   ├── users.json
│   │   ├── items.json
│   │   └── transactions.json
│   └── package.json
│
├── frontend/
│   ├── index.html (Login/Register)
│   ├── dashboard.html (Panel de usuario)
│   ├── shop.html (Tienda)
│   ├── history.html (Historial)
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── auth.js
│       ├── dashboard.js
│       ├── shop.js
│       └── history.js
│
└── README.md
```

## 🚀 Instrucciones de Instalación

### Requisitos Previos
- Node.js v14 o superior (descarga desde: https://nodejs.org/)
- Un editor de código (recomendado: VS Code)
- Un navegador web moderno

### Pasos de Instalación

#### 1. Crear la estructura del proyecto

```bash
# Crear carpeta principal
mkdir fortnite-wallet
cd fortnite-wallet

# Crear carpetas
mkdir backend frontend
mkdir backend/routes backend/middleware backend/data
mkdir frontend/css frontend/js
```

#### 2. Copiar los archivos

Copia cada archivo en su ubicación correspondiente según la estructura mostrada arriba.

**Backend:**
- `backend/server.js`
- `backend/package.json`
- `backend/routes/auth.js`
- `backend/routes/wallet.js`
- `backend/routes/shop.js`
- `backend/middleware/auth.js`

**Frontend:**
- `frontend/index.html`
- `frontend/dashboard.html`
- `frontend/shop.html`
- `frontend/history.html`
- `frontend/css/style.css`
- `frontend/js/auth.js`
- `frontend/js/dashboard.js`
- `frontend/js/shop.js`
- `frontend/js/history.js`

#### 3. Instalar dependencias del backend

```bash
cd backend
npm install
```

Esto instalará: express, jsonwebtoken, bcryptjs, cors, body-parser

#### 4. Ejecutar el servidor

```bash
# Desde la carpeta backend
node server.js
```

Deberías ver el mensaje:
```
🎮 Fortnite Wallet Server running on http://localhost:3000
📁 Data directory: /ruta/a/backend/data
```

#### 5. Abrir el frontend

Tienes 2 opciones:

**Opción A - Navegador directo:**
1. Abre tu navegador
2. Ve a `http://localhost:3000`

**Opción B - Live Server en VS Code:**
1. Instala la extensión "Live Server" en VS Code
2. Click derecho en `frontend/index.html`
3. Selecciona "Open with Live Server"

### 🎮 Cómo Usar la Aplicación

#### Primer Uso

1. **Registrarse:**
   - Ve a la página de login
   - Click en "Regístrate aquí"
   - Completa: nombre de usuario, email, contraseña
   - Click en "Registrarse"
   - Recibirás 1000 V-Bucks iniciales 🎉

2. **Explorar el Dashboard:**
   - Verás tu saldo actual
   - Acciones rápidas disponibles
   - Últimas transacciones

3. **Recargar Saldo:**
   - Click en "Recargar +1000 V-Bucks"
   - Se añadirán instantáneamente

4. **Comprar en la Tienda:**
   - Ve a "Tienda" en el menú
   - Explora los ítems disponibles
   - Click en "Comprar" si tienes suficiente saldo
   - El monto se descontará automáticamente

5. **Ver Historial:**
   - Ve a "Historial"
   - Verás todas tus transacciones
   - Recargas en verde (+), compras en rojo (-)

### 🛠️ Solución de Problemas

**Error de conexión:**
- Verifica que el servidor esté corriendo en `http://localhost:3000`
- Revisa que no haya otro proceso usando el puerto 3000

**No se muestran los ítems:**
- Verifica que el archivo `backend/data/items.json` se haya creado
- Reinicia el servidor

**Token inválido:**
- Cierra sesión y vuelve a iniciar sesión
- Borra el localStorage del navegador (F12 > Application > Local Storage)

## 📋 Características

✅ Registro e inicio de sesión seguro
✅ Panel de usuario con saldo en V-Bucks
✅ Recarga de saldo ficticio (+1000 V-Bucks)
✅ Tienda con ítems de Fortnite
✅ Sistema de compras con descuento automático
✅ Historial de transacciones completo
✅ Diseño moderno estilo Fortnite

## 🎨 Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express
- **Auth**: JWT (JSON Web Tokens)
- **Database**: JSON Files
- **Security**: bcryptjs para hash de passwords

## 👤 Usuario de Prueba

Una vez ejecutado, puedes registrarte o usar:
- **Usuario**: demo@fortnite.com
- **Password**: demo123

(Se creará automáticamente al primer inicio)

---

**Nota**: Este es un proyecto educativo y ficticio. Los V-Bucks y transacciones son simulados.