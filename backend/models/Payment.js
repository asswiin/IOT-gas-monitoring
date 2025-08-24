const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  dateOfPayment: { type: String, required: true },
  amountDue: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
