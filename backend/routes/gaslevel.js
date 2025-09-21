

const express = require('express');
const router = express.Router();
const GasLevel = require('../models/Gaslevel');
const KYC = require('../models/Newconnection');

const BOOKING_THRESHOLD = 20; // Gas level percentage at which auto-booking triggers
const LEAK_TRIGGER_START_LEVEL = 50; // Example: Leak starts detecting below 50%
const LEAK_TRIGGER_END_LEVEL = 47; // Example: Leak detection range ends at 47% (meaning if it drops below, it's a confirmed leak)

const checkForLeak = (currentLevel) => {
  return currentLevel <= LEAK_TRIGGER_START_LEVEL && currentLevel > LEAK_TRIGGER_END_LEVEL;
};

// GET gas level for a specific user by email
router.get('/:email', async (req, res) => {
  const userEmail = req.params.email.toLowerCase();

  try {
    const [kycUser, gasLevel] = await Promise.all([
      KYC.findOne({ email: userEmail }),
      GasLevel.findOne({ email: userEmail })
    ]);

    if (!kycUser) {
      console.warn(`Gas level check failed: No KYC record found for ${userEmail}`);
      return res.status(404).json({ message: "User profile not found." });
    }

    if (!gasLevel) {
      // If the user is active, they need a gas level record. Create one.
      if (kycUser.status === 'active') {
        if (!kycUser._id) {
          console.error(`CRITICAL: KYC record for ${userEmail} is missing an _id.`);
          return res.status(500).json({ message: "Server error: User data is corrupt." });
        }

        console.log(`No GasLevel found for active user ${userEmail}. Creating a new one.`);
        const newGasLevel = new GasLevel({
          userId: kycUser._id,
          email: userEmail,
          currentLevel: 100 // Initialize new connections with full gas
        });
        await newGasLevel.save();
        return res.json({ ...newGasLevel.toObject(), status: kycUser.status });
      } else {
        // If user is not active (e.g., pending_approval), it's okay not to have a gas record yet.
        console.warn(`No GasLevel record for non-active user ${userEmail} (status: ${kycUser.status}).`);
        return res.status(404).json({ message: `Gas level data not available for user with status: ${kycUser.status}` });
      }
    }

    // Update leak status for the gas level record
    gasLevel.isLeaking = checkForLeak(gasLevel.currentLevel);

    // Logic to change KYC status based on gas level
    if (gasLevel.currentLevel <= BOOKING_THRESHOLD && kycUser.status === 'active' && !gasLevel.isLeaking) {
      kycUser.status = 'refill_payment_pending'; // Mark for refill payment
      await kycUser.save();
      console.log(`User ${userEmail} status changed to refill_payment_pending.`);
    }
    // If the user's gas level has risen (e.g., after a refill payment on the backend)
    // and their status is still 'booking_pending' or 'refill_payment_pending', revert to 'active'.
    else if ( (kycUser.status === 'booking_pending' || kycUser.status === 'refill_payment_pending') && gasLevel.currentLevel > BOOKING_THRESHOLD) {
      kycUser.status = 'active';
      await kycUser.save();
      console.log(`User ${userEmail} status automatically reverted to 'active' as gas level is sufficient.`);
    }

    await gasLevel.save(); // Save any changes to gasLevel (like isLeaking)

    res.json({ ...gasLevel.toObject(), status: kycUser.status });

  } catch (err) {
    console.error(`Error fetching gas level for ${userEmail}:`, err);
    res.status(500).json({ message: "Server error while fetching gas level data." });
  }
});

// PUT route to handle gas refill payment completion
router.put('/:email/refill', async (req, res) => {
    try {
        const userEmail = req.params.email.toLowerCase();

        // 1. Update KYC status to 'active'
        const updatedKyc = await KYC.findOneAndUpdate(
            { email: userEmail },
            { $set: { status: 'active' } },
            { new: true } // Return the updated document
        );

        if (!updatedKyc) {
            console.warn(`Refill failed: KYC record not found for ${userEmail}`);
            return res.status(404).json({ message: "User not found to update status." });
        }

        // 2. Update GasLevel to 100
        const updatedGasLevel = await GasLevel.findOneAndUpdate(
            { email: userEmail },
            { $set: { currentLevel: 100, isLeaking: false, lastUpdated: Date.now() } },
            { new: true } // Return the updated document
        );

        if (!updatedGasLevel) {
            // If GasLevel document doesn't exist for an active user, create it.
            // This can happen if a user's KYC was approved but they never had a gas level initialized
            // (e.g., in a specific edge case or initial data setup).
            if (updatedKyc._id) {
                console.log(`No GasLevel found for active user ${userEmail} during refill. Creating a new one.`);
                const newGasLevel = new GasLevel({
                    userId: updatedKyc._id,
                    email: userEmail,
                    currentLevel: 100
                });
                await newGasLevel.save();
                return res.json({
                    message: "Gas refilled and status updated successfully! New GasLevel created.",
                    kycData: updatedKyc,
                    gasData: newGasLevel
                });
            } else {
                 console.error(`CRITICAL: KYC record for ${userEmail} is missing an _id during refill.`);
                 return res.status(500).json({ message: "Server error: User data is corrupt during refill." });
            }
        }

        res.json({
            message: "Gas refilled and status updated successfully!",
            kycData: updatedKyc,
            gasData: updatedGasLevel
        });

    } catch (err) {
        console.error("Error during gas refill process for", req.params.email, ":", err);
        res.status(500).json({ message: "Server error during gas refill process." });
    }
});



module.exports = router;