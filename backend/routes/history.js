const express = require('express');
const router = express.Router();
const GasDataHistory = require('../models/GasDataHistory');

// GET gas history for a specific user by email
router.get('/:email', async (req, res) => {
    try {
        const userEmail = req.params.email.toLowerCase();
        const historyData = await GasDataHistory.find({ email: userEmail }).sort({ timestamp: -1 }).limit(100); // Get latest 100 entries

        if (!historyData) {
            return res.status(404).json({ message: "No history data found for this user." });
        }

        res.status(200).json(historyData);

    } catch (error) {
        console.error("Error fetching gas history:", error);
        res.status(500).json({ message: "Server error while fetching history." });
    }
});

module.exports = router;