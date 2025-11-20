// backend/models/Player.js
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  position: {
    type: String,
    enum: ['POR', 'DEF', 'MED', 'DEL'],
    required: true
  },
  age: {
    type: Number,
    min: 16,
    max: 40,
    required: true
  },
  nationality: {
    type: String,
    default: '🌍'
  },
  // Stats del jugador (0-100)
  overall: {
    type: Number,
    default: 60
  },
  pace: {
    type: Number,
    default: 60
  },
  shooting: {
    type: Number,
    default: 60
  },
  passing: {
    type: Number,
    default: 60
  },
  defending: {
    type: Number,
    default: 60
  },
  physical: {
    type: Number,
    default: 60
  },
  // Valor del jugador
  marketValue: {
    type: Number,
    required: true
  },
  currentTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  onMarket: {
    type: Boolean,
    default: false
  },
  transferPrice: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calcular valor de mercado basado en stats
playerSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('overall')) {
    const baseValue = 1000;
    const multiplier = Math.pow(1.15, this.overall - 50);
    this.marketValue = Math.round(baseValue * multiplier);
  }
  next();
});

module.exports = mongoose.model('Player', playerSchema);