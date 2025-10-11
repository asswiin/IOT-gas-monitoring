const express = require('express');
const router = express.Router();
const GasLevel = require('../models/Gaslevel');
const GasDataHistory = require('../models/GasDataHistory');
const simulationStates = {}; 

// POST /api/simulation/start
// The WEB APP calls this to command the simulation to start.
router.post('/start', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }
    simulationStates[email] = { isRunning: true };
    console.log(`Command received: START simulation for ${email}`);
    res.status(200).json({ message: `Simulation for ${email} commanded to START.` });
});

// POST /api/simulation/stop
// The WEB APP calls this to command the simulation to stop.
router.post('/stop', (req, res) => {
    const { email } = req.body;
    if (email && simulationStates[email]) {
        simulationStates[email].isRunning = false;
        console.log(`Command received: STOP simulation for ${email}`);
        res.status(200).json({ message: `Simulation for ${email} commanded to STOP.` });
    } else {
        res.status(404).json({ message: "No active simulation found to stop." });
    }
});

// GET /api/simulation/status/:email
// The WOKWI DEVICE calls this to ask if it should be running.
router.get('/status/:email', (req, res) => {
    const { email } = req.params;
    const state = simulationStates[email] || { isRunning: false };
    res.json(state);
});

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