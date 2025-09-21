
// models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  kycId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KYC',
    required: true
  },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  dateOfPayment: { type: String, required: true },
  amountDue: { type: Number, required: true },
  // ✅ NEW FIELD: To differentiate payment types
  paymentType: {
    type: String,
    enum: ['initial_connection', 'gas_refill'],
    default: 'initial_connection' // Default for existing payments
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);