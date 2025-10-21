
// models/AutoBooking.js
const mongoose = require('mongoose');

const autoBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KYC', // Reference to the KYC model
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  customerName: {
    type: String,
    required: false // Will be populated from KYC data
  },
  mobileNumber: {
    type: String,
    required: false // Will be populated from KYC data
  },
  address: {
    type: String,
    required: false // Will be populated from KYC data
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['booking_pending', 'refill_payment_pending', 'paid', 'cancelled', 'fulfilled'],
    default: 'booking_pending',
  },
  // ✅ NEW FIELD: To distinguish between booking origins
  bookingType: {
    type: String,
    enum: ['automatic', 'manual'],
    default: 'automatic'
  },
}, { timestamps: true });

module.exports = mongoose.model('AutoBooking', autoBookingSchema);
