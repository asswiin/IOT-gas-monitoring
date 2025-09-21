
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
    const [kycUser, gasLevelDoc] = await Promise.all([ // Renamed gasLevel to gasLevelDoc to avoid confusion
      KYC.findOne({ email: userEmail }),
      GasLevel.findOne({ email: userEmail })
    ]);

    if (!kycUser) {
      console.warn(`Gas level check failed: No KYC record found for ${userEmail}`);
      return res.status(404).json({ message: "User profile not found." });
    }

    let currentGasLevelDoc = gasLevelDoc; // Use a mutable variable

    if (!currentGasLevelDoc) {
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
          currentLevel: 100,
          hasPaidForRefill: false // New connections don't have paid refills initially
        });
        currentGasLevelDoc = await newGasLevel.save();
        return res.json({ ...currentGasLevelDoc.toObject(), status: kycUser.status });
      } else {
        // If user is not active (e.g., pending_approval), it's okay not to have a gas record yet.
        console.warn(`No GasLevel record for non-active user ${userEmail} (status: ${kycUser.status}).`);
        return res.status(404).json({ message: `Gas level data not available for user with status: ${kycUser.status}` });
      }
    }

    // --- NEW LOGIC FOR REFILL ACTIVATION ---
    if (currentGasLevelDoc.currentLevel <= 0 && currentGasLevelDoc.hasPaidForRefill) {
        console.log(`User ${userEmail}: Old cylinder depleted. Activating new cylinder.`);
        currentGasLevelDoc.currentLevel = 100;
        currentGasLevelDoc.hasPaidForRefill = false;
        currentGasLevelDoc.isLeaking = false; // Reset leak status for new cylinder
        // No need to change kycUser.status here, as it should already be 'active'
        // or handled by the subsequent status logic.
    }
    // --- END NEW LOGIC ---

    // Update leak status for the gas level record
    currentGasLevelDoc.isLeaking = checkForLeak(currentGasLevelDoc.currentLevel);

    // Logic to change KYC status based on gas level
    if (currentGasLevelDoc.currentLevel <= BOOKING_THRESHOLD && kycUser.status === 'active' && !currentGasLevelDoc.isLeaking && !currentGasLevelDoc.hasPaidForRefill) {
      // Auto-book only if no refill is already paid for
      kycUser.status = 'refill_payment_pending'; // Mark for refill payment
      await kycUser.save();
      console.log(`User ${userEmail} status changed to refill_payment_pending.`);
    }
    // If the user's gas level has risen (e.g., after a refill payment on the backend)
    // and their status is still 'booking_pending' or 'refill_payment_pending', revert to 'active'.
    // This now only happens if current gas is sufficient AND no refill is pending activation.
    else if ( (kycUser.status === 'booking_pending' || kycUser.status === 'refill_payment_pending') && currentGasLevelDoc.currentLevel > BOOKING_THRESHOLD && !currentGasLevelDoc.hasPaidForRefill) {
      kycUser.status = 'active';
      await kycUser.save();
      console.log(`User ${userEmail} status automatically reverted to 'active' as gas level is sufficient.`);
    }

    await currentGasLevelDoc.save(); // Save any changes to gasLevelDoc (like currentLevel, isLeaking, hasPaidForRefill)

    res.json({ ...currentGasLevelDoc.toObject(), status: kycUser.status });

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
            { $set: { status: 'active' } }, // Set status to active immediately as payment is done
            { new: true }
        );

        if (!updatedKyc) {
            console.warn(`Refill failed: KYC record not found for ${userEmail}`);
            return res.status(404).json({ message: "User not found to update status." });
        }

        // 2. Instead of setting currentLevel to 100, set hasPaidForRefill to true
        const updatedGasLevel = await GasLevel.findOneAndUpdate(
            { email: userEmail },
            { $set: { hasPaidForRefill: true, isLeaking: false } }, // Also reset leak status
            { new: true, upsert: true } // upsert: true creates if not found
        );

        res.json({
            message: "Gas refill payment successful! New cylinder will activate when current one is depleted.",
            kycData: updatedKyc,
            gasData: updatedGasLevel
        });

    } catch (err) {
        console.error("Error during gas refill process for", req.params.email, ":", err);
        res.status(500).json({ message: "Server error during gas refill process." });
    }
});

module.exports = router;