// backend/routes/admin.js
const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware para verificar si es admin
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error al verificar permisos' });
  }
};

// Obtener todos los usuarios
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    const usersData = users.map(u => ({
      id: u._id,
      username: u.username,
      email: u.email,
      balance: u.balance,
      isAdmin: u.isAdmin || false,
      createdAt: u.createdAt
    }));
    
    res.json(usersData);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Modificar saldo de un usuario
router.post('/modify-balance', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, newBalance } = req.body;

    if (!userId || newBalance === undefined) {
      return res.status(400).json({ error: 'userId y newBalance son requeridos' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const oldBalance = user.balance;
    user.balance = parseInt(newBalance);
    await user.save();

    // Registrar transacción
    const transaction = new Transaction({
      userId: userId,
      type: 'admin_modification',
      amount: parseInt(newBalance) - oldBalance,
      description: `Modificación de admin: ${oldBalance} → ${newBalance} V-Bucks`
    });
    await transaction.save();

    res.json({
      success: true,
      message: 'Saldo modificado exitosamente',
      user: {
        id: user._id,
        username: user.username,
        oldBalance,
        newBalance: user.balance
      }
    });
  } catch (error) {
    console.error('Error al modificar saldo:', error);
    res.status(500).json({ error: 'Error al modificar saldo' });
  }
});

// Eliminar usuario
router.delete('/delete-user/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No permitir eliminar admins
    if (user.isAdmin) {
      return res.status(403).json({ error: 'No se puede eliminar un administrador' });
    }

    const deletedUser = {
      id: user._id,
      username: user.username,
      email: user.email
    };

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: `Usuario ${deletedUser.username} eliminado`,
      deletedUser: deletedUser
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Obtener todas las transacciones (de todos los usuarios)
router.get('/all-transactions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    
    const transactionsWithUser = await Promise.all(
      transactions.map(async (t) => {
        const user = await User.findById(t.userId);
        return {
          ...t.toObject(),
          username: user ? user.username : 'Usuario eliminado'
        };
      })
    );

    res.json(transactionsWithUser);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

module.exports = router;