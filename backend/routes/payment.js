
// routes/payment.js
const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");

// POST new KYC form
router.post("/", async (req, res) => {
  try {
    // ✅ Add a default status for the payment when it's saved
    const newForm = new Payment({ ...req.body, status: 'completed' }); 
    await newForm.save();
    res.status(200).json({ message: "✅ Payment saved successfully!" });
  } catch (err) {
    console.error("❌ Save Error:", err);
    res.status(500).json({ message: "Error saving form" });
  }
});

router.get("/", async (req, res) => {
  try {
    // ✅ Remove the status filter here, as we want to see all recorded payments
    // We're now setting the status on creation. If you want to filter later,
    // you can re-add it or add more specific GET endpoints.
    const allPayments = await Payment.find({}); 
    res.json(allPayments);
  } catch (err) {
    console.error("❌ Error fetching all payments:", err);
    res.status(500).json({ message: "Server error while fetching all payment data" });
  }
});

module.exports = router;






