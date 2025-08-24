
const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
  salutation: String,
  firstName: String,
  middleName: String,
  lastName: String,
  dob: String,
  fatherName: String,
  spouseName: String,
  motherName: String,
  houseName: String,
  floorNo: String,
  housingComplex: String,
  streetName: String,
  landmark: String,
  city: String,
  state: String,
  district: String,
  pinCode: String,
  // ✅ Ensures each mobile number is unique
  mobileNumber: { type: String, unique: true, required: true }, 
  telephoneNumber: String,
  // ✅ Ensures each email is unique
  email: { type: String, unique: true, required: true },
  // ✅ New field to track application status
  status: { type: String, default: 'pending_payment' }, 
  dateOfPayment: String,
  amountDue: Number,
});

module.exports = mongoose.model("KYC", kycSchema);