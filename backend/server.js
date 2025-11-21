// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const footballRoutes = require('./routes/football');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/football', footballRoutes);
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
  console.log(`🎮 Fortnite Wallet Server running on port ${PORT}`);
});

module.exports = router;