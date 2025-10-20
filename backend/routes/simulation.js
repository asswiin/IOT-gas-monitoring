


const express = require('express');
const router = express.Router();
const GasLevel = require('../models/Gaslevel');
const GasDataHistory = require('../models/GasDataHistory');

// In-memory store for simulation states.
// This is simple and effective for this use case. It will reset if the server restarts.
// Format: { "user@example.com": true, "another@user.com": false }
let simulationStates = {};

// =================================================================
// --- ROUTES FOR REACT FRONTEND (SimulationControl.js) ---
// =================================================================

// POST /api/simulation/start
router.post('/start', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }
    simulationStates[email.toLowerCase()] = true; // Set state to running
    console.log(`[CONTROL] Simulation START command received for: ${email}`);
    res.status(200).json({ message: `Simulation started for ${email}` });
});

// POST /api/simulation/stop
router.post('/stop', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }
    simulationStates[email.toLowerCase()] = false; // Set state to stopped
    console.log(`[CONTROL] Simulation STOP command received for: ${email}`);
    res.status(200).json({ message: `Simulation stopped for ${email}` });
});

// =================================================================
// --- ROUTE FOR WOKWI DEVICE ---
// =================================================================

// GET /api/simulation/status/:email
// The Wokwi device will poll this endpoint to get its running state.
router.get('/status/:email', (req, res) => {
    const email = req.params.email.toLowerCase();
    const isRunning = simulationStates[email] || false; // Default to false if not set
    res.status(200).json({ isRunning: isRunning });
});

// =================================================================
// --- ROUTE FOR WOKWI SENSOR DATA ---
// =================================================================

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

        // console.log(`Data received from Wokwi for ${email}: Level=${currentLevel}, Leak=${isLeaking}`);
        res.status(200).json({ message: 'Data updated successfully', data: gasDoc });

    } catch (error) {
        console.error("Error updating data from Wokwi:", error);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;