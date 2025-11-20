// backend/models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  shield: {
    type: String,
    default: '⚽'
  },
  ownerId: {
    type: String,
    default: null // null = equipo NPC
  },
  isNPC: {
    type: Boolean,
    default: true
  },
  league: {
    type: String,
    enum: ['A', 'B'],
    default: 'B'
  },
  budget: {
    type: Number,
    default: 50000
  },
  teamValue: {
    type: Number,
    default: 0
  },
  // Mejoras del club
  youthAcademy: {
    type: Number,
    default: 0, // Nivel 0-5
    cost: 10000
  },
  stadium: {
    type: Number,
    default: 0, // Nivel 0-5
    cost: 20000
  },
  trainingFacilities: {
    type: Number,
    default: 0, // Nivel 0-5
    cost: 15000
  },
  // Estadísticas
  points: {
    type: Number,
    default: 0
  },
  matchesPlayed: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  draws: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  goalsFor: {
    type: Number,
    default: 0
  },
  goalsAgainst: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Team', teamSchema);