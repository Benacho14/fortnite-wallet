// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Inicializar archivos JSON si no existen
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const files = {
  users: path.join(dataDir, 'users.json'),
  items: path.join(dataDir, 'items.json'),
  transactions: path.join(dataDir, 'transactions.json'),
  business: path.join(dataDir, 'business.json'),        // ← NUEVO
  products: path.join(dataDir, 'products.json')          // ← NUEVO
};

// Crear archivos con datos iniciales si no existen
if (!fs.existsSync(files.users)) {
  fs.writeFileSync(files.users, JSON.stringify([], null, 2));
}

if (!fs.existsSync(files.items)) {
  const initialItems = [
    { id: 1, name: 'Skin Legendaria Raven', price: 2000, image: '🦅', rarity: 'legendary' },
    { id: 2, name: 'Pico Arcoíris', price: 800, image: '⛏️', rarity: 'epic' },
    { id: 3, name: 'Baile Floss', price: 500, image: '💃', rarity: 'rare' },
    { id: 4, name: 'Planeador Dragón', price: 1200, image: '🐉', rarity: 'epic' },
    { id: 5, name: 'Skin Elite Agent', price: 2000, image: '🕵️', rarity: 'legendary' },
    { id: 6, name: 'Hacha Hielo', price: 800, image: '🪓', rarity: 'rare' },
    { id: 7, name: 'Contrail Estrella', price: 300, image: '⭐', rarity: 'uncommon' },
    { id: 8, name: 'Wrap Galáctico', price: 600, image: '🌌', rarity: 'rare' }
  ];
  fs.writeFileSync(files.items, JSON.stringify(initialItems, null, 2));
}

if (!fs.existsSync(files.transactions)) {
  fs.writeFileSync(files.transactions, JSON.stringify([], null, 2));
}

// ← NUEVOS ARCHIVOS PARA MARKETPLACE
if (!fs.existsSync(files.business)) {
  fs.writeFileSync(files.business, JSON.stringify([], null, 2));
  console.log('✅ Archivo business.json creado');
}

if (!fs.existsSync(files.products)) {
  fs.writeFileSync(files.products, JSON.stringify([], null, 2));
  console.log('✅ Archivo products.json creado');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shop', shopRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🎮 Fortnite Wallet Server running on http://localhost:3000`);
  console.log(`📁 Data directory: ${dataDir}`);
});