const express = require('express');
const router = express.Router();
const GasLevel = require('../models/Gaslevel');
const GasDataHistory = require('../models/GasDataHistory');

// POST /api/simulation/data
// The WOKWI DEVICE calls this to send its sensor readings.
router.post('/data', async (req, res) => {
    const { email, currentLevel, isLeaking } = req.body;

    if (!email || currentLevel === undefined) {
        return res.status(400).json({ message: "Email and currentLevel are required." });
    }

    try {
        // 1. Update the main GasLevel document
        const gasDoc = await GasLevel.findOneAndUpdate(
            { email },
            { $set: { currentLevel: currentLevel, isLeaking: !!isLeaking } },
            { new: true, upsert: true } // Create if it doesn't exist
        );

        // 2. Save an entry to the history log
        const historyEntry = new GasDataHistory({
            email: email,
            gasLevel: currentLevel
        });
        await historyEntry.save();

        console.log(`Data received from Wokwi for ${email}: Level=${currentLevel}, Leak=${isLeaking}`);
        res.status(200).json({ message: 'Data updated successfully', data: gasDoc });

    } catch (error) {
        console.error("Error updating data from Wokwi:", error);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;