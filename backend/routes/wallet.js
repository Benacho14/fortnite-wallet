// backend/routes/wallet.js
const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Obtener balance del usuario
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ balance: user.balance });
  } catch (error) {
    console.error('Error al obtener balance:', error);
    res.status(500).json({ error: 'Error al obtener el balance' });
  }
});

// Recargar saldo (SOLO ADMINS)
router.post('/recharge', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si es admin
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Solo los administradores pueden recargar saldo' });
    }

    const { amount } = req.body;
    const rechargeAmount = amount || 1000;

    // Actualizar balance
    user.balance += rechargeAmount;
    await user.save();

    // Registrar transacción
    const transaction = new Transaction({
      userId: req.userId,
      type: 'recharge',
      amount: rechargeAmount,
      description: `Recarga de ${rechargeAmount} V-Bucks`
    });
    await transaction.save();

    res.json({
      success: true,
      newBalance: user.balance,
      message: `¡${rechargeAmount} V-Bucks agregados!`
    });
  } catch (error) {
    console.error('Error al recargar saldo:', error);
    res.status(500).json({ error: 'Error al recargar saldo' });
  }
});

// Obtener historial de transacciones
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// Transferir saldo a otro usuario
router.post('/transfer', authMiddleware, async (req, res) => {
  try {
    const { recipientEmail, amount } = req.body;

    if (!recipientEmail || !amount) {
      return res.status(400).json({ error: 'Email del destinatario y monto son requeridos' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }

    const sender = await User.findById(req.userId);
    const recipient = await User.findOne({ email: recipientEmail });

    if (!sender) {
      return res.status(404).json({ error: 'Usuario remitente no encontrado' });
    }

    if (!recipient) {
      return res.status(404).json({ error: 'Usuario destinatario no encontrado' });
    }

    if (sender.email === recipientEmail) {
      return res.status(400).json({ error: 'No puedes transferirte a ti mismo' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({
        error: 'Saldo insuficiente',
        required: amount,
        current: sender.balance
      });
    }

    // Realizar transferencia
    sender.balance -= amount;
    recipient.balance += amount;

    await sender.save();
    await recipient.save();

    // Registrar transacciones
    const senderTransaction = new Transaction({
      userId: sender._id,
      type: 'transfer_sent',
      amount: -amount,
      description: `Transferencia enviada a ${recipient.username}`,
      recipientEmail: recipientEmail
    });

    const recipientTransaction = new Transaction({
      userId: recipient._id,
      type: 'transfer_received',
      amount: amount,
      description: `Transferencia recibida de ${sender.username}`,
      senderEmail: sender.email
    });

    await senderTransaction.save();
    await recipientTransaction.save();

    res.json({
      success: true,
      newBalance: sender.balance,
      message: `¡${amount} V-Bucks transferidos a ${recipient.username}!`,
      recipient: {
        username: recipient.username,
        email: recipient.email
      }
    });
  } catch (error) {
    console.error('Error al realizar transferencia:', error);
    res.status(500).json({ error: 'Error al realizar transferencia' });
  }
});

// Obtener lista de usuarios disponibles para transferir
router.get('/users-list', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }).select('_id username email');

    const usersData = users.map(u => ({
      id: u._id,
      username: u.username,
      email: u.email
    }));

    res.json(usersData);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

module.exports = router;