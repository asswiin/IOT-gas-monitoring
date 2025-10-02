const mongoose = require('mongoose');

const gasDataHistorySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true // Add an index for faster queries by email
  },
  gasLevel: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GasDataHistory', gasDataHistorySchema);