// backend/routes/wallet.js
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

router.get('/balance', authMiddleware, (req, res) => {
  try {
    const users = getUsers();
    const user = users.find(u => u.id === req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el balance' });
  }
});

router.post('/recharge', authMiddleware, (req, res) => {
  try {
    const { amount } = req.body;
    const rechargeAmount = amount || 1000;

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    users[userIndex].balance += rechargeAmount;
    saveUsers(users);

    const transactions = getTransactions();
    transactions.push({
      id: Date.now().toString(),
      userId: req.userId,
      type: 'recharge',
      amount: rechargeAmount,
      description: `Recarga de ${rechargeAmount} V-Bucks`,
      date: new Date().toISOString()
    });
    saveTransactions(transactions);

    res.json({
      success: true,
      newBalance: users[userIndex].balance,
      message: `¡${rechargeAmount} V-Bucks agregados!`
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al recargar saldo' });
  }
});

router.get('/transactions', authMiddleware, (req, res) => {
  try {
    const transactions = getTransactions();
    const userTransactions = transactions
      .filter(t => t.userId === req.userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(userTransactions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// Transferir saldo a otro usuario
router.post('/transfer', authMiddleware, (req, res) => {
    try {
      const { recipientEmail, amount } = req.body;
  
      if (!recipientEmail || !amount) {
        return res.status(400).json({ error: 'Email del destinatario y monto son requeridos' });
      }
  
      if (amount <= 0) {
        return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
      }
  
      const users = getUsers();
      const senderIndex = users.findIndex(u => u.id === req.userId);
      const recipientIndex = users.findIndex(u => u.email === recipientEmail);
  
      if (senderIndex === -1) {
        return res.status(404).json({ error: 'Usuario remitente no encontrado' });
      }
  
      if (recipientIndex === -1) {
        return res.status(404).json({ error: 'Usuario destinatario no encontrado' });
      }
  
      if (users[senderIndex].email === recipientEmail) {
        return res.status(400).json({ error: 'No puedes transferirte a ti mismo' });
      }
  
      if (users[senderIndex].balance < amount) {
        return res.status(400).json({ 
          error: 'Saldo insuficiente',
          required: amount,
          current: users[senderIndex].balance
        });
      }
  
      // Realizar transferencia
      users[senderIndex].balance -= amount;
      users[recipientIndex].balance += amount;
      saveUsers(users);
  
      // Registrar transacciones
      const transactions = getTransactions();
      
      // Transacción del remitente
      transactions.push({
        id: Date.now().toString(),
        userId: req.userId,
        type: 'transfer_sent',
        amount: -amount,
        description: `Transferencia enviada a ${users[recipientIndex].username}`,
        recipientEmail: recipientEmail,
        date: new Date().toISOString()
      });
  
      // Transacción del destinatario
      transactions.push({
        id: (Date.now() + 1).toString(),
        userId: users[recipientIndex].id,
        type: 'transfer_received',
        amount: amount,
        description: `Transferencia recibida de ${users[senderIndex].username}`,
        senderEmail: users[senderIndex].email,
        date: new Date().toISOString()
      });
  
      saveTransactions(transactions);
  
      res.json({
        success: true,
        newBalance: users[senderIndex].balance,
        message: `¡${amount} V-Bucks transferidos a ${users[recipientIndex].username}!`,
        recipient: {
          username: users[recipientIndex].username,
          email: users[recipientIndex].email
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al realizar transferencia' });
    }
  });

  // Obtener lista de usuarios disponibles para transferir
router.get('/users-list', authMiddleware, (req, res) => {
    try {
      const users = getUsers();
      
      // Filtrar: no incluir al usuario actual
      const availableUsers = users
        .filter(u => u.id !== req.userId)
        .map(u => ({
          id: u.id,
          username: u.username,
          email: u.email
        }));
      
      res.json(availableUsers);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  });

module.exports = router;