// backend/routes/football.js
const express = require('express');
const User = require('../models/User');
const Team = require('../models/Team');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Obtener mi equipo
router.get('/my-team', authMiddleware, async (req, res) => {
  try {
    const team = await Team.findOne({ ownerId: req.userId });

    if (!team) {
      return res.json({ hasTeam: false });
    }

    res.json({
      hasTeam: true,
      team: team
    });
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    res.status(500).json({ error: 'Error al obtener equipo' });
  }
});

// Crear equipo
router.post('/create-team', authMiddleware, async (req, res) => {
  try {
    const { teamName } = req.body;

    if (!teamName) {
      return res.status(400).json({ error: 'El nombre del equipo es requerido' });
    }

    // Verificar si ya tiene un equipo
    const existingTeam = await Team.findOne({ ownerId: req.userId });
    if (existingTeam) {
      return res.status(400).json({ error: 'Ya tienes un equipo creado' });
    }

    const newTeam = new Team({
      ownerId: req.userId,
      teamName,
      budget: 0,
      players: []
    });

    await newTeam.save();

    res.json({
      success: true,
      message: 'Equipo creado exitosamente',
      team: newTeam
    });
  } catch (error) {
    console.error('Error al crear equipo:', error);
    res.status(500).json({ error: 'Error al crear equipo' });
  }
});

// Transferir V-Bucks al club
router.post('/transfer-to-club', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    const user = await User.findById(req.userId);
    const team = await Team.findOne({ ownerId: req.userId });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!team) {
      return res.status(404).json({ error: 'Debes crear un equipo primero' });
    }

    if (user.balance < amount) {
      return res.status(400).json({
        error: 'Saldo insuficiente',
        required: amount,
        current: user.balance
      });
    }

    // Transferir dinero
    user.balance -= amount;
    team.budget += amount;

    await user.save();
    await team.save();

    // Registrar transacción
    const transaction = new Transaction({
      userId: user._id,
      type: 'transfer_to_club',
      amount: -amount,
      description: `Transferencia al club: ${team.teamName}`
    });
    await transaction.save();

    res.json({
      success: true,
      message: `¡${amount} V-Bucks transferidos al club!`,
      newBalance: user.balance,
      clubBudget: team.budget
    });
  } catch (error) {
    console.error('Error al transferir al club:', error);
    res.status(500).json({ error: 'Error al transferir al club' });
  }
});

// Transferir del club a la billetera personal
router.post('/transfer-from-club', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    const user = await User.findById(req.userId);
    const team = await Team.findOne({ ownerId: req.userId });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!team) {
      return res.status(404).json({ error: 'No tienes un equipo' });
    }

    if (team.budget < amount) {
      return res.status(400).json({
        error: 'Presupuesto del club insuficiente',
        required: amount,
        current: team.budget
      });
    }

    // Transferir dinero
    team.budget -= amount;
    user.balance += amount;

    await team.save();
    await user.save();

    // Registrar transacción
    const transaction = new Transaction({
      userId: user._id,
      type: 'transfer_from_club',
      amount: amount,
      description: `Retiro del club: ${team.teamName}`
    });
    await transaction.save();

    res.json({
      success: true,
      message: `¡${amount} V-Bucks retirados del club!`,
      newBalance: user.balance,
      clubBudget: team.budget
    });
  } catch (error) {
    console.error('Error al retirar del club:', error);
    res.status(500).json({ error: 'Error al retirar del club' });
  }
});

// Obtener todos los equipos (para tabla de clasificación)
router.get('/all-teams', authMiddleware, async (req, res) => {
  try {
    const teams = await Team.find().sort({ points: -1, wins: -1 });

    const teamsWithOwner = await Promise.all(
      teams.map(async (team) => {
        const owner = await User.findById(team.ownerId);
        return {
          id: team._id,
          teamName: team.teamName,
          stadium: team.stadium,
          wins: team.wins,
          draws: team.draws,
          losses: team.losses,
          points: team.points,
          ownerName: owner ? owner.username : 'Usuario',
          playersCount: team.players.length
        };
      })
    );

    res.json(teamsWithOwner);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
});

// Actualizar equipo
router.put('/update-team', authMiddleware, async (req, res) => {
  try {
    const { teamName, stadium } = req.body;

    const team = await Team.findOne({ ownerId: req.userId });

    if (!team) {
      return res.status(404).json({ error: 'No tienes un equipo' });
    }

    if (teamName) team.teamName = teamName;
    if (stadium) team.stadium = stadium;

    await team.save();

    res.json({
      success: true,
      message: 'Equipo actualizado exitosamente',
      team: team
    });
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    res.status(500).json({ error: 'Error al actualizar equipo' });
  }
});

module.exports = router;