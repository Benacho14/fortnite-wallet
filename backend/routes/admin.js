// backend/routes/admin.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const usersFile = path.join(__dirname, '../data/users.json');
const transactionsFile = path.join(__dirname, '../data/transactions.json');

const getUsers = () => JSON.parse(fs.readFileSync(usersFile));
const saveUsers = (users) => fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
const getTransactions = () => JSON.parse(fs.readFileSync(transactionsFile));
const saveTransactions = (transactions) => fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));

// Middleware para verificar si es admin
const adminMiddleware = (req, res, next) => {
  const users = getUsers();
  const user = users.find(u => u.id === req.userId);
  
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
  }
  
  next();
};

// Obtener todos los usuarios
router.get('/users', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const users = getUsers();
    const usersData = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      balance: u.balance,
      isAdmin: u.isAdmin || false,
      createdAt: u.createdAt
    }));
    res.json(usersData);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Modificar saldo de un usuario
router.post('/modify-balance', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { userId, newBalance } = req.body;

    if (!userId || newBalance === undefined) {
      return res.status(400).json({ error: 'userId y newBalance son requeridos' });
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const oldBalance = users[userIndex].balance;
    users[userIndex].balance = parseInt(newBalance);
    saveUsers(users);

    // Registrar transacción
    const transactions = getTransactions();
    transactions.push({
      id: Date.now().toString(),
      userId: userId,
      type: 'admin_modification',
      amount: parseInt(newBalance) - oldBalance,
      description: `Modificación de admin: ${oldBalance} → ${newBalance} V-Bucks`,
      date: new Date().toISOString()
    });
    saveTransactions(transactions);

    res.json({
      success: true,
      message: 'Saldo modificado exitosamente',
      user: {
        id: users[userIndex].id,
        username: users[userIndex].username,
        oldBalance,
        newBalance: users[userIndex].balance
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al modificar saldo' });
  }
});

// Eliminar usuario
router.delete('/delete-user/:userId', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { userId } = req.params;

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No permitir eliminar admins
    if (users[userIndex].isAdmin) {
      return res.status(403).json({ error: 'No se puede eliminar un administrador' });
    }

    const deletedUser = users.splice(userIndex, 1)[0];
    saveUsers(users);

    res.json({
      success: true,
      message: `Usuario ${deletedUser.username} eliminado`,
      deletedUser: {
        id: deletedUser.id,
        username: deletedUser.username,
        email: deletedUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Obtener todas las transacciones (de todos los usuarios)
router.get('/all-transactions', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const transactions = getTransactions();
    const users = getUsers();
    
    const transactionsWithUser = transactions.map(t => {
      const user = users.find(u => u.id === t.userId);
      return {
        ...t,
        username: user ? user.username : 'Usuario eliminado'
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(transactionsWithUser);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

module.exports = router;