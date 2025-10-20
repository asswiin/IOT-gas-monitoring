

const express = require('express');
const router = express.Router();
const GasDataHistory = require('../models/GasDataHistory');

// GET daily gas consumption history for a specific user by email
router.get('/:email', async (req, res) => {
    try {
        const userEmail = req.params.email.toLowerCase();

        // Use MongoDB Aggregation to calculate daily consumption
        const dailyConsumption = await GasDataHistory.aggregate([
            // Stage 1: Filter documents to match the requested user's email
            {
                $match: { email: userEmail }
            },
            // Stage 2: Group documents by calendar date
            {
                $group: {
                    // Group by the date part of the timestamp (format: YYYY-MM-DD)
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    // Find the highest gas level recorded on that day
                    startingLevel: { $max: "$gasLevel" },
                    // Find the lowest gas level recorded on that day
                    endingLevel: { $min: "$gasLevel" }
                }
            },
            // Stage 3: Calculate the difference and reshape the output
            {
                $project: {
                    _id: 0, // Exclude the default _id field
                    date: "$_id", // Rename _id to 'date'
                    // Calculate the gas consumed for the day
                    gasConsumed: { $subtract: ["$startingLevel", "$endingLevel"] }
                }
            },
            // Stage 4: Sort the results with the most recent date first
            {
                $sort: { date: -1 }
            },
            // Stage 5: Limit the results to the last 30 days of activity
            {
                $limit: 30
            }
        ]);

        res.status(200).json(dailyConsumption);

    } catch (error) {
        console.error("Error fetching daily gas consumption history:", error);
        res.status(500).json({ message: "Server error while fetching history." });
    }
});

module.exports = router;