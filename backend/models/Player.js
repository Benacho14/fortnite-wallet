// backend/models/Player.js
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  position: {
    type: String,
    enum: ['GK', 'DEF', 'MID', 'ATK'],
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 16,
    max: 40
  },
  // Stats estilo FIFA
  overall: {
    type: Number,
    required: true,
    min: 40,
    max: 99
  },
  pace: { type: Number, min: 1, max: 99 },
  shooting: { type: Number, min: 1, max: 99 },
  passing: { type: Number, min: 1, max: 99 },
  dribbling: { type: Number, min: 1, max: 99 },
  defending: { type: Number, min: 1, max: 99 },
  physical: { type: Number, min: 1, max: 99 },
  
  // Valor de mercado
  marketValue: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Contrato
  contractYears: {
    type: Number,
    default: 3,
    min: 0,
    max: 5
  },
  
  // Equipo al que pertenece
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  
  // Estado en el mercado
  onMarket: {
    type: Boolean,
    default: false
  },
  askingPrice: {
    type: Number,
    default: 0
  },
  
  // Si es jugador NPC o pertenece a un usuario
  isNPC: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Método para calcular valor de mercado basado en stats
playerSchema.methods.calculateMarketValue = function() {
  const baseValue = 1000;
  const overallMultiplier = this.overall * 100;
  const ageModifier = this.age < 24 ? 1.2 : this.age > 30 ? 0.8 : 1;
  
  this.marketValue = Math.round((baseValue + overallMultiplier) * ageModifier);
  return this.marketValue;
};

module.exports = mongoose.model('Player', playerSchema);