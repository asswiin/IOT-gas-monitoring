
// // routes/payment.js
// const express = require("express");
// const router = express.Router();
// const Payment = require("../models/Payment");

// // POST new Payment
// router.post("/", async (req, res) => {
//   try {
//     const newForm = new Payment({ ...req.body, status: 'completed' });
//     await newForm.save();
//     res.status(200).json({ message: "✅ Payment saved successfully!" });
//   } catch (err) {
//     console.error("❌ Save Error:", err);
//     res.status(500).json({ message: "Error saving payment data." });
//   }
// });

// // GET all Payments
// router.get("/", async (req, res) => {
//   try {
//     const allPayments = await Payment.find({});
//     res.json(allPayments);
//   } catch (err) {
//     console.error("❌ Error fetching all payments:", err);
//     res.status(500).json({ message: "Server error while fetching all payment data." });
//   }
// });

// // DELETE Payment records by KYC ID
// router.delete("/kyc/:kycId", async (req, res) => {
//   try {
//     const kycId = req.params.kycId;
//     const result = await Payment.deleteMany({ kycId: kycId }); // Delete all payments associated with this KYC ID

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: "No payment records found for this KYC ID." });
//     }
//     res.json({ message: `Successfully deleted ${result.deletedCount} payment records for KYC ID: ${kycId}` });
//   } catch (err) {
//     console.error("❌ Error deleting payment records:", err);
//     res.status(500).json({ message: "Server error while deleting payment records." });
//   }
// });

// module.exports = router;






// routes/payment.js
const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");

// POST new Payment
router.post("/", async (req, res) => {
  try {
    const newForm = new Payment({ ...req.body, status: 'completed' });
    await newForm.save();
    res.status(200).json({ message: "✅ Payment saved successfully!" });
  } catch (err) {
    console.error("❌ Save Error:", err);
    res.status(500).json({ message: "Error saving payment data." });
  }
});

// GET all Payments (For Admin)
router.get("/", async (req, res) => {
  try {
    const allPayments = await Payment.find({});
    res.json(allPayments);
  } catch (err) {
    console.error("❌ Error fetching all payments:", err);
    res.status(500).json({ message: "Server error while fetching all payment data." });
  }
});

// ✅ NEW ROUTE: GET all payments for a specific user
router.get("/user/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;
    const userPayments = await Payment.find({ email: userEmail }).sort({ createdAt: -1 }); // Sort by most recent
    res.json(userPayments);
  } catch (err) {
    console.error(`❌ Error fetching payments for user ${req.params.email}:`, err);
    res.status(500).json({ message: "Server error while fetching user payment data." });
  }
});


// DELETE Payment records by KYC ID
router.delete("/kyc/:kycId", async (req, res) => {
  try {
    const kycId = req.params.kycId;
    const result = await Payment.deleteMany({ kycId: kycId }); // Delete all payments associated with this KYC ID

    if (result.deletedCount === 0) {
      return res.status(444).json({ message: "No payment records found for this KYC ID." });
    }
    res.json({ message: `Successfully deleted ${result.deletedCount} payment records for KYC ID: ${kycId}` });
  } catch (err) {
    console.error("❌ Error deleting payment records:", err);
    res.status(500).json({ message: "Server error while deleting payment records." });
  }
});

module.exports = router;