

// models/Gaslevel.js
const mongoose = require('mongoose');

const gasLevelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KYC',
    required: true,
    unique: true // Each user has one gas level record
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  currentLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 100
  },
  isLeaking: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // NEW FIELD: Indicates if a refill has been paid for but not yet applied
  hasPaidForRefill: {
    type: Boolean,
    default: false
  }
});

// Pre-save hook to update lastUpdated
gasLevelSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('GasLevel', gasLevelSchema);