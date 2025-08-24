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
  mobileNumber: String,
  telephoneNumber: String,
  email: String,
  dateOfPayment: String,
  amountDue: Number,
});

module.exports = mongoose.model("KYC", kycSchema);
