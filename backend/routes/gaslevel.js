const express = require('express');
const router = express.Router();
const GasLevel = require('../models/Gaslevel');
const KYC = require('../models/Newconnection'); // To potentially initialize GasLevel for new users

// GET gas level for a specific user by email
router.get('/:email', async (req, res) => {
  try {
    const userEmail = req.params.email.toLowerCase();
    let gasLevel = await GasLevel.findOne({ email: userEmail });

    if (!gasLevel) {
      // If no gas level record exists for an active user, create a default one.
      // This ensures that new active users immediately see a gas level of 100%
      // even if the simulation hasn't processed them yet.
      const kycUser = await KYC.findOne({ email: userEmail, status: 'active' });
      if (kycUser) {
        const newGasLevel = new GasLevel({
          userId: kycUser._id,
          email: userEmail,
          currentLevel: 100,
          isLeaking: false,
        });
        await newGasLevel.save();
        return res.json(newGasLevel);
      }
      return res.status(404).json({ message: "Gas level data not found for this user, or user not active." });
    }
    res.json(gasLevel);
  } catch (err) {
    console.error("Error fetching gas level:", err);
    res.status(500).json({ message: "Server error while fetching gas level data." });
  }
});

module.exports = router;