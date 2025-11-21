// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'fortnite_wallet_secret_2024';

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const users = readUsers();

    // Verificar si el usuario ya existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = {
      id: Date.now().toString(),
      email,
      username,
      password: hashedPassword,
      balance: 1000,
      isAdmin: false
    };

    users.push(newUser);
    writeUsers(users);

    // Generar token
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, SECRET_KEY, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        balance: newUser.balance,
        isAdmin: newUser.isAdmin
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

    const users = readUsers();

    // Buscar usuario
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
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

// Ruta para obtener datos del usuario autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const users = readUsers();
    
    // Buscar el usuario por ID (viene del token decodificado)
    const user = users.find(u => u.id === req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Devolver datos del usuario (sin la contraseña)
    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        isAdmin: user.isAdmin || false
      }
    });
    
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Crear usuario admin (opcional - para testing)
router.post('/create-admin', async (req, res) => {
  try {
    const users = readUsers();
    
    // Verificar si ya existe el admin
    const existingAdmin = users.find(u => u.email === 'admin@fortnite.com');
    if (existingAdmin) {
      return res.status(400).json({ error: 'El usuario admin ya existe' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = {
      id: Date.now().toString(),
      email: 'admin@fortnite.com',
      username: 'Admin Tester',
      password: hashedPassword,
      balance: 999999,
      isAdmin: true
    };

    users.push(adminUser);
    writeUsers(users);

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