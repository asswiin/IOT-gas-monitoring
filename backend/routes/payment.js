const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");

// POST new KYC form
router.post("/", async (req, res) => {
  try {
    const newForm = new Payment(req.body);
    await newForm.save();
res.status(200).json({ message: "✅ Payment saved successfully!" });
  } catch (err) {
    console.error("❌ Save Error:", err);
    res.status(500).json({ message: "Error saving form" });
  }
});

router.get("/", async (req, res) => {
  try {
    const allPayments = await Payment.find({}); // Fetch all payment records
    res.json(allPayments);
  } catch (err) {
    console.error("❌ Error fetching all payments:", err);
    res.status(500).json({ message: "Server error while fetching all payment data" });
  }
});

module.exports = router;

