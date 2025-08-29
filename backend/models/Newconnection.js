
// const mongoose = require("mongoose");

// const kycSchema = new mongoose.Schema({
//   salutation: String,
//   firstName: String,
//   middleName: String,
//   lastName: String,
//   dob: String,
//   fatherName: String,
//   spouseName: String,
//   motherName: String,
//   houseName: String,
//   floorNo: String,
//   housingComplex: String,
//   streetName: String,
//   landmark: String,
//   city: String,
//   state: String,
//   district: String,
//   pinCode: String,
//   // ✅ Ensures each mobile number is unique
//   mobileNumber: { type: String, unique: true, required: true }, 
//   telephoneNumber: String,
//   // ✅ Ensures each email is unique
//   email: { type: String, unique: true, required: true },
//   // ✅ New field to track application status
//   status: { type: String, default: 'pending_payment' }, 
//   dateOfPayment: String,
//   amountDue: Number,
// });

// module.exports = mongoose.model("KYC", kycSchema);







// Example of how your models/Newconnection.js should look (add 'status' field)
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
  mobileNumber: { type: String, required: true, unique: true, match: /^[6-9]\d{9}$/ },
  telephoneNumber: String,
  email: { type: String, required: true, unique: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  
  // ✅ NEW STATUS FIELD
  status: { 
    type: String, 
    enum: ['pending_approval', 'approved', 'rejected', 'active'], // 'active' for after payment
    default: 'pending_approval' 
  },
}, { timestamps: true }); // timestamps will add createdAt and updatedAt fields automatically

module.exports = mongoose.model('KYC', kycSchema);