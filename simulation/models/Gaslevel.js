const mongoose = require('mongoose');

const gasLevelSchema = new mongoose.Schema({
  userId: { // Link to the KYC/Newconnection record
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KYC', // Reference to your KYC model
    required: true,
    unique: true // Each user should have only one active gas level entry
  },
  email: { // For easier lookup
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  currentLevel: { // Percentage or unit of gas remaining
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 100 // Start with a full cylinder
  },
  isLeaking: { // Flag for gas leakage
    type: Boolean,
    default: false
  },
  lastUpdated: { // Timestamp of the last reading
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GasLevel', gasLevelSchema);