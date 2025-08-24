
const express = require("express");
const router = express.Router();
const KYC = require("../models/Newconnection");

// GET existing KYC data by email
router.get("/:email", async (req, res) => {
  try {
    const kycData = await KYC.findOne({ email: req.params.email });
    if (kycData) {
      return res.json(kycData);
    }
    return res.status(404).json({ message: "No KYC data found." });
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching KYC data" });
  }
});

// POST new KYC form (with improved duplicate check)
router.post("/", async (req, res) => {
  try {
    const { email, mobileNumber } = req.body;

    // ✅ Explicitly check if email or mobile number is already in use
    const existingConnection = await KYC.findOne({ $or: [{ email }, { mobileNumber }] });

    if (existingConnection) {
      // ✅ Return a 409 Conflict status
      return res.status(409).json({ message: "connection already exists" });
    }

    // If no existing connection, create a new one
    const newForm = new KYC(req.body);
    await newForm.save();
    res.status(201).json({ message: "KYC Form saved successfully!", kycData: newForm });
  } catch (err) {
    // This will catch other database errors, including the unique index violation
    console.error("❌ Save Error:", err);
    res.status(500).json({ message: "Error saving form" });
  }
});

// PUT to update KYC status after payment
router.put("/:email/status", async (req, res) => {
    try {
      const { status } = req.body; // Expecting { "status": "active" } in the body
      const updatedKYC = await KYC.findOneAndUpdate(
        { email: req.params.email },
        { $set: { status: status } }, // Use $set for better practice
        { new: true }
      );
  
      if (!updatedKYC) {
        return res.status(404).json({ message: "KYC record not found." });
      }
  
      res.json({ message: "KYC status updated.", kycData: updatedKYC });
    } catch (err) {
      console.error("❌ Status Update Error:", err);
      res.status(500).json({ message: "Error updating KYC status" });
    }
});


module.exports = router;