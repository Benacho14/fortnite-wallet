// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SECRET_KEY } = require('../middleware/auth');

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      balance: 1000
    });

    await newUser.save();

    // Generar token
    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, SECRET_KEY, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        balance: newUser.balance,
        isAdmin: newUser.isAdmin || false
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign({ userId: user._id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        balance: user.balance,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Crear usuario admin
router.post('/create-admin', async (req, res) => {
  try {
    // Verificar si ya existe el admin
    const existingAdmin = await User.findOne({ email: 'admin@fortnite.com' });
    if (existingAdmin) {
      return res.status(400).json({ error: 'El usuario admin ya existe' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = new User({
      email: 'admin@fortnite.com',
      username: 'Admin Tester',
      password: hashedPassword,
      balance: 999999,
      isAdmin: true
    });

    await adminUser.save();

    res.json({
      success: true,
      message: 'Usuario admin creado exitosamente',
      credentials: {
        email: 'admin@fortnite.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Error al crear admin:', error);
    res.status(500).json({ error: 'Error al crear admin' });
  }
});

module.exports = router;