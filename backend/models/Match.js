// backend/models/Match.js
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  season: {
    type: String,
    required: true
  },
  matchday: {
    type: Number,
    required: true
  },
  league: {
    type: String,
    enum: ['A', 'B', 'Copa'],
    required: true
  },
  homeTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  awayTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  homeGoals: {
    type: Number,
    default: null
  },
  awayGoals: {
    type: Number,
    default: null
  },
  played: {
    type: Boolean,
    default: false
  },
  playedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', matchSchema);