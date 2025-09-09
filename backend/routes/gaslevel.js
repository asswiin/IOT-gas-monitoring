// const express = require('express');
// const router = express.Router();
// const GasLevel = require('../models/Gaslevel');
// const KYC = require('../models/Newconnection');

// const BOOKING_THRESHOLD = 20;
// const LEAK_PROBABILITY = 0.1; // 10% chance of leak occurring
// const MIN_LEAK_THRESHOLD = 30; // Minimum gas level for leak detection
// const MAX_LEAK_THRESHOLD = 90; // Maximum gas level for leak detection

// // Function to check for random leaks
// const checkForLeak = (currentLevel) => {
//   if (currentLevel < MIN_LEAK_THRESHOLD || currentLevel > MAX_LEAK_THRESHOLD) {
//     return false;
//   }
//   return Math.random() < LEAK_PROBABILITY;
// };

// // GET gas level for a specific user by email
// router.get('/:email', async (req, res) => {
//   try {
//     const userEmail = req.params.email.toLowerCase();
//     let gasLevel = await GasLevel.findOne({ email: userEmail });

//     if (!gasLevel) {
//       // If no gas level record exists for an active user, create a default one.
//       // This ensures that new active users immediately see a gas level of 100%
//       // even if the simulation hasn't processed them yet.
//       const kycUser = await KYC.findOne({ email: userEmail, status: 'active' });
//       if (kycUser) {
//         const newGasLevel = new GasLevel({
//           userId: kycUser._id,
//           email: userEmail,
//           currentLevel: 100,
//           isLeaking: false,
//           needsBooking: false
//         });
//         await newGasLevel.save();
//         return res.json(newGasLevel);
//       }
//       return res.status(404).json({ message: "Gas level data not found for this user, or user not active." });
//     }

//     // Check for leaks and booking needs
//     gasLevel.isLeaking = checkForLeak(gasLevel.currentLevel);
//     gasLevel.needsBooking = gasLevel.currentLevel <= BOOKING_THRESHOLD;
//     await gasLevel.save();
    
//     res.json(gasLevel);
//   } catch (err) {
//     console.error("Error fetching gas level:", err);
//     res.status(500).json({ message: "Server error while fetching gas level data." });
//   }
// });

// module.exports = router;





const express = require('express');
const router = express.Router();
const GasLevel = require('../models/Gaslevel');
const KYC = require('../models/Newconnection');

const BOOKING_THRESHOLD = 20;

// --- MODIFICATIONS START ---

// REMOVED: Random leak probability and thresholds
// const LEAK_PROBABILITY = 0.1; // 10% chance of leak occurring
// const MIN_LEAK_THRESHOLD = 30; // Minimum gas level for leak detection
// const MAX_LEAK_THRESHOLD = 90; // Maximum gas level for leak detection

// NEW: Deterministic leak trigger range.
// A leak will be triggered when the gas level is within this specific range.
const LEAK_TRIGGER_START_LEVEL = 50; // Leak detection starts when gas level hits 50
const LEAK_TRIGGER_END_LEVEL = 47;   // Leak detection stops when gas level is below 45

// Function to check for leaks based on a specific level range
const checkForLeak = (currentLevel) => {
  // A leak is now deterministically triggered if the current level is
  // less than or equal to the start level AND greater than the end level.
  // Example: A leak will show for levels 50, 49, 48, 47, 46.
  return currentLevel <= LEAK_TRIGGER_START_LEVEL && currentLevel > LEAK_TRIGGER_END_LEVEL;
};

// --- MODIFICATIONS END ---


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
          needsBooking: false
        });
        await newGasLevel.save();
        return res.json(newGasLevel);
      }
      return res.status(404).json({ message: "Gas level data not found for this user, or user not active." });
    }

    // Check for leaks and booking needs using the new deterministic function
    gasLevel.isLeaking = checkForLeak(gasLevel.currentLevel);
    gasLevel.needsBooking = gasLevel.currentLevel <= BOOKING_THRESHOLD;
    await gasLevel.save();
    
    res.json(gasLevel);
  } catch (err)
  {
    console.error("Error fetching gas level:", err);
    res.status(500).json({ message: "Server error while fetching gas level data." });
  }
});

module.exports = router;