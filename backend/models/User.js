const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { 
    type: String, 
    required: true,
    set: number => {
      // If number doesn't start with +91, add it
      if (!number.startsWith('+91')) {
        return '+91' + number;
      }
      return number;
    }
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin'],
    required: true
  }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);