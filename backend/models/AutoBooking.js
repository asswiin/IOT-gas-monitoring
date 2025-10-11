
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
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    // MODIFIED: Added booking-specific statuses here.
    enum: ['booking_pending', 'refill_payment_pending', 'paid', 'cancelled', 'fulfilled'],
    default: 'booking_pending', // The default status when a booking is created.
  },
}, { timestamps: true });

module.exports = mongoose.model('AutoBooking', autoBookingSchema);