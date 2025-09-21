
// models/Newconnection.js
const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  salutation: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: String,
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  fatherName: String,
  spouseName: String,
  motherName: String,
  houseName: { type: String, required: true },
  floorNo: String,
  housingComplex: String,
  streetName: { type: String, required: true },
  landmark: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  pinCode: { type: String, required: true, match: /^\d{6}$/ },
  mobileNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /^\+91[6-9]\d{9}$/,
    message: "Invalid Indian mobile number format (must be +91 followed by 10 digits starting with 6-9)."
  },
  telephoneNumber: String,
  email: { type: String, required: true, unique: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  
  status: { 
    type: String, 
    enum: ['pending_approval', 'approved', 'rejected', 'active', 'deactivated', 'booking_pending','refill_payment_pending'],
    default: 'pending_approval' 
  },
}, { timestamps: true });

module.exports = mongoose.model('KYC', kycSchema);