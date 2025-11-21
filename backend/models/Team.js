// backend/models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  teamName: {
    type: String,
    required: true
  },
  stadium: {
    type: String,
    default: '🏟️ Estadio Básico'
  },
  budget: {
    type: Number,
    default: 0
  },
  players: [{
    name: String,
    position: String,
    rating: Number,
    price: Number
  }],
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
  points: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);