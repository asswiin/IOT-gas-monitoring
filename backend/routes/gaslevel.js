
const express = require('express');
const router = express.Router();
const GasLevel = require('../models/Gaslevel');
const KYC = require('../models/Newconnection');
const AutoBooking = require('../models/AutoBooking'); // Import the new model

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
    const [kycUser, gasLevelDoc] = await Promise.all([
      KYC.findOne({ email: userEmail }),
      GasLevel.findOne({ email: userEmail })
    ]);

    if (!kycUser) {
      console.warn(`Gas level check failed: No KYC record found for ${userEmail}`);
      return res.status(404).json({ message: "User profile not found." });
    }

    let currentGasLevelDoc = gasLevelDoc;

    if (!currentGasLevelDoc) {
      if (kycUser.status === 'active') {
        if (!kycUser._id) {
          console.error(`CRITICAL: KYC record for ${userEmail} is missing an _id.`);
          return res.status(500).json({ message: "Server error: User data is corrupt." });
        }
        console.log(`No GasLevel found for active user ${userEmail}. Creating a new one.`);
        const newGasLevel = new GasLevel({ userId: kycUser._id, email: userEmail, currentLevel: 100, hasPaidForRefill: false });
        currentGasLevelDoc = await newGasLevel.save();
      } else {
        console.warn(`No GasLevel record for non-active user ${userEmail} (status: ${kycUser.status}).`);
        return res.status(404).json({ message: `Gas level data not available for user with status: ${kycUser.status}` });
      }
    }

    // --- ✅ CORRECTED: Cylinder activation logic ---
    // When the current cylinder is depleted and a refill has been paid for...
    if (currentGasLevelDoc.currentLevel <= 0 && currentGasLevelDoc.hasPaidForRefill) {
        console.log(`User ${userEmail}: Old cylinder depleted. Activating new cylinder.`);

        // Find the original 'paid' booking to get user details from it.
        // We sort by `updatedAt` descending to get the most recent paid booking.
        const paidBooking = await AutoBooking.findOne({
            email: userEmail,
            status: 'paid'
        }).sort({ updatedAt: -1 });

        if (paidBooking) {
            // THE KEY CHANGE: Create a new 'fulfilled' record. Do NOT update the 'paid' one.
            const fulfilledBooking = new AutoBooking({
                userId: paidBooking.userId,
                email: paidBooking.email,
                status: 'fulfilled',
                // The 'bookingDate' will default to Date.now(), correctly timestamping the fulfillment.
            });
            await fulfilledBooking.save();
            console.log(`✅ New 'fulfilled' booking record created for ${userEmail}. The 'paid' record is preserved.`);
        } else {
            console.warn(`Could not find a 'paid' booking for ${userEmail} to create a 'fulfilled' record from.`);
        }

        // Now, reset the gas level for the new cylinder.
        currentGasLevelDoc.currentLevel = 100;
        currentGasLevelDoc.hasPaidForRefill = false;
        currentGasLevelDoc.isLeaking = false;
    }

    // Update leak status
    currentGasLevelDoc.isLeaking = checkForLeak(currentGasLevelDoc.currentLevel);

    // AUTO-BOOKING LOGIC
    if (currentGasLevelDoc.currentLevel <= BOOKING_THRESHOLD && 
        kycUser.status === 'active' && 
        !currentGasLevelDoc.isLeaking && 
        !currentGasLevelDoc.hasPaidForRefill) {
      
      const existingActiveBooking = await AutoBooking.findOne({ email: userEmail, status: { $in: ['booking_pending', 'refill_payment_pending', 'paid'] } });

      if (!existingActiveBooking) {
        const newAutoBooking = new AutoBooking({ userId: kycUser._id, email: userEmail, status: 'booking_pending' });
        await newAutoBooking.save();
        console.log(`🎯 Auto-booking created for ${userEmail} - Gas level: ${currentGasLevelDoc.currentLevel}%`);
      }
    }

    // REVERT STATUS LOGIC
    if ((kycUser.status === 'booking_pending' || kycUser.status === 'refill_payment_pending') && 
        currentGasLevelDoc.currentLevel > BOOKING_THRESHOLD && 
        !currentGasLevelDoc.hasPaidForRefill) {
      
      kycUser.status = 'active';
      await kycUser.save();
      console.log(`User ${userEmail} status reverted to 'active' as gas level is sufficient.`);
      
      await AutoBooking.findOneAndUpdate(
        { email: userEmail, status: { $in: ['booking_pending', 'refill_payment_pending'] } },
        { $set: { status: 'cancelled' } }
      );
    }

    await currentGasLevelDoc.save();
    
    const currentBooking = await AutoBooking.findOne({ email: userEmail, status: { $in: ['booking_pending', 'refill_payment_pending'] } });

    res.json({ ...currentGasLevelDoc.toObject(), kycStatus: kycUser.status, bookingStatus: currentBooking ? currentBooking.status : null });

  } catch (err) {
    console.error(`Error fetching gas level for ${userEmail}:`, err);
    res.status(500).json({ message: "Server error while fetching gas level data." });
  }
});

// PUT route to handle gas refill payment completion
router.put('/:email/refill', async (req, res) => {
    try {
        const userEmail = req.params.email.toLowerCase();

        const updatedKyc = await KYC.findOneAndUpdate(
            { email: userEmail },
            { $set: { status: 'active' } },
            { new: true }
        );

        if (!updatedKyc) {
            console.warn(`Refill failed: KYC record not found for ${userEmail}`);
            return res.status(404).json({ message: "User not found to update status." });
        }

        const updatedGasLevel = await GasLevel.findOneAndUpdate(
            { email: userEmail },
            { $set: { hasPaidForRefill: true, isLeaking: false } },
            { new: true, upsert: true }
        );

        const updatedBooking = await AutoBooking.findOneAndUpdate(
          { email: userEmail, status: 'booking_pending' },
          { $set: { status: 'paid' } },
          { new: true }
        );

        if (updatedBooking) {
          console.log(`✅ Auto-booking for ${userEmail} marked as 'paid'.`);
        } else {
          console.warn(`Could not find a 'booking_pending' record for ${userEmail} to mark as paid.`);
        }

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


























