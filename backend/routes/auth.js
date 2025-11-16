// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { SECRET_KEY } = require('../middleware/auth');

const router = express.Router();
const usersFile = path.join(__dirname, '../data/users.json');

// Función helper para leer usuarios
const getUsers = () => {
  const data = fs.readFileSync(usersFile);
  return JSON.parse(data);
};

// Función helper para guardar usuarios
const saveUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      email,
      username,
      password: hashedPassword,
      balance: 1000,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, SECRET_KEY, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        balance: newUser.balance,
        isAdmin: newUser.isAdmin || false
      }
    });
  } catch (error) {
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

    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

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
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Crear usuario admin
router.post('/create-admin', async (req, res) => {
  try {
    const users = getUsers();
    
    if (users.find(u => u.email === 'admin@fortnite.com')) {
      return res.status(400).json({ error: 'El usuario admin ya existe' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = {
      id: 'admin-' + Date.now().toString(),
      email: 'admin@fortnite.com',
      username: 'Admin Tester',
      password: hashedPassword,
      balance: 999999,
      isAdmin: true,
      createdAt: new Date().toISOString()
    };

    users.push(adminUser);
    saveUsers(users);

    res.json({
      success: true,
      message: 'Usuario admin creado exitosamente',
      credentials: {
        email: 'admin@fortnite.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear admin' });
  }
});

module.exports = router;