// backend/models/ClubFinance.js
const mongoose = require('mongoose');

const clubFinanceSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    enum: ['match_win', 'match_draw', 'transfer_in', 'transfer_out', 'upgrade', 'maintenance'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ClubFinance', clubFinanceSchema);