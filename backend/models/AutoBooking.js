const mongoose = require('mongoose');

const autoBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Newconnection', // Reference to the KYC model
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['booked', 'paid', 'cancelled', 'fulfilled'],
    default: 'booked',
  },
  // You can add more fields here if needed, e.g., 'cylinderType', 'quantity'
}, { timestamps: true });

module.exports = mongoose.model('AutoBooking', autoBookingSchema);