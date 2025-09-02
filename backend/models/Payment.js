const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  // ✅ This links the payment to the specific KYC application
  kycId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'KYC', // Must match the model name from `mongoose.model("KYC", ...)`
    required: true 
  },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  dateOfPayment: { type: String, required: true },
  amountDue: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);




