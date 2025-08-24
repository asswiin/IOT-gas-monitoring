const express = require("express");
const router = express.Router();
const KYC = require("../models/Newconnection");

// POST new KYC form
router.post("/", async (req, res) => {
  try {
    const newForm = new KYC(req.body);
    await newForm.save();
res.status(200).json({ message: "✅ Payment saved successfully!" });
  } catch (err) {
    console.error("❌ Save Error:", err);
    res.status(500).json({ message: "Error saving form" });
  }
});

module.exports = router;
