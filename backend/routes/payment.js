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

module.exports = router;

