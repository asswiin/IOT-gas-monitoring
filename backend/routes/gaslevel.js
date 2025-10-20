
const express = require('express');
const router = express.Router();
const GasLevel = require('../models/Gaslevel');
const KYC = require('../models/Newconnection');
const AutoBooking = require('../models/AutoBooking');

// --- Define System Thresholds ---
const BOOKING_THRESHOLD = 20;
// A gas leak is simulated/detected only when the level is within this range.
const LEAK_TRIGGER_START_LEVEL = 50; 
const LEAK_TRIGGER_END_LEVEL = 40;   

/**
 * Checks if the current gas level falls within the predefined leak detection range.
 * @param {number} currentLevel - The current gas percentage.
 * @returns {boolean} - True if a leak is detected, false otherwise.
 */
const checkForLeak = (currentLevel) => {
  return currentLevel <= LEAK_TRIGGER_START_LEVEL && currentLevel > LEAK_TRIGGER_END_LEVEL;
};

// --- GET gas level for a specific user by email ---
// This is the main endpoint polled by the user dashboard.
router.get('/:email', async (req, res) => {
  const userEmail = req.params.email.toLowerCase();

  try {
    // Fetch user's KYC and GasLevel data in parallel for efficiency.
    const [kycUser, gasLevelDoc] = await Promise.all([
      KYC.findOne({ email: userEmail }),
      GasLevel.findOne({ email: userEmail })
    ]);

    // Handle case where user does not exist.
    if (!kycUser) {
      console.warn(`Gas level check failed: No KYC record found for ${userEmail}`);
      return res.status(404).json({ message: "User profile not found." });
    }

    let currentGasLevelDoc = gasLevelDoc;

    // If a GasLevel document doesn't exist for an active user, create one.
    if (!currentGasLevelDoc) {
      if (kycUser.status === 'active') {
        console.log(`No GasLevel found for active user ${userEmail}. Creating a new one.`);
        const newGasLevel = new GasLevel({ 
            userId: kycUser._id, 
            email: userEmail, 
            currentLevel: 100, 
            hasPaidForRefill: false 
        });
        currentGasLevelDoc = await newGasLevel.save();
      } else {
        // For non-active users, data is not applicable.
        return res.status(404).json({ message: `Gas level data not available for user with status: ${kycUser.status}` });
      }
    }

    // --- Cylinder Activation Logic ---
    // If current cylinder is empty and a new one has been paid for, activate it.
    if (currentGasLevelDoc.currentLevel <= 0 && currentGasLevelDoc.hasPaidForRefill) {
        console.log(`User ${userEmail}: Old cylinder depleted. Activating new cylinder.`);
        
        // Find the 'paid' booking and mark it as 'fulfilled' for history.
        const paidBooking = await AutoBooking.findOne({ email: userEmail, status: 'paid' }).sort({ updatedAt: -1 });
        if (paidBooking) {
            paidBooking.status = 'fulfilled';
            await paidBooking.save();
            console.log(`✅ Booking for ${userEmail} marked as 'fulfilled'.`);
        }
        
        // Reset the gas level and the paid flag.
        currentGasLevelDoc.currentLevel = 100;
        currentGasLevelDoc.hasPaidForRefill = false;
    }

    // --- Leak Detection Logic ---
    currentGasLevelDoc.isLeaking = checkForLeak(currentGasLevelDoc.currentLevel);
    
    // Find any relevant, non-completed booking.
    let relevantBooking = await AutoBooking.findOne({ 
        email: userEmail, 
        status: { $in: ['booking_pending', 'refill_payment_pending'] } 
    });

    // --- Auto-Booking Logic ---
    if (currentGasLevelDoc.currentLevel <= BOOKING_THRESHOLD && 
        kycUser.status === 'active' && 
        !currentGasLevelDoc.isLeaking && // Do not book if there's a leak.
        !currentGasLevelDoc.hasPaidForRefill) { // Do not book if a refill is already paid.
      
      // Only create a new booking if one doesn't already exist.
      if (!relevantBooking) {
        console.log(`🎯 Gas level for ${userEmail} is low. Creating auto-booking.`);
        const newAutoBooking = new AutoBooking({ 
            userId: kycUser._id, 
            email: userEmail, 
            status: 'booking_pending' 
        });
        
        // CRITICAL FIX: Save the booking and assign it to `relevantBooking`
        // so its status is included in the response *immediately*.
        relevantBooking = await newAutoBooking.save();
        
        // Also update the main user status to reflect the pending booking.
        kycUser.status = 'booking_pending'; 
        console.log(`   -> Booking created and KYC status updated for ${userEmail}.`);
      }
    }

    // Save any changes made to KYC and GasLevel documents during this process.
    await Promise.all([kycUser.save(), currentGasLevelDoc.save()]);
    
    // Send the complete, up-to-date state to the frontend.
    res.json({ 
      ...currentGasLevelDoc.toObject(), 
      kycStatus: kycUser.status, 
      bookingStatus: relevantBooking ? relevantBooking.status : null 
    });

  } catch (err) {
    console.error(`Error fetching gas level for ${userEmail}:`, err);
    res.status(500).json({ message: "Server error while fetching gas level data." });
  }
});


// --- PUT route to handle gas refill payment completion ---
router.put('/:email/refill', async (req, res) => {
    try {
        const userEmail = req.params.email.toLowerCase();

        // 1. Update the user's main status back to 'active'.
        const updatedKyc = await KYC.findOneAndUpdate(
            { email: userEmail },
            { $set: { status: 'active' } },
            { new: true }
        );

        if (!updatedKyc) {
            return res.status(404).json({ message: "User not found to update status." });
        }

        // 2. Set the `hasPaidForRefill` flag to true.
        const updatedGasLevel = await GasLevel.findOneAndUpdate(
            { email: userEmail },
            { $set: { hasPaidForRefill: true } },
            { new: true }
        );

        // 3. Find the pending booking and mark it as 'paid'.
        const updatedBooking = await AutoBooking.findOneAndUpdate(
          { email: userEmail, status: 'booking_pending' },
          { $set: { status: 'paid' } },
          { new: true }
        );

        if (updatedBooking) {
          console.log(`✅ Auto-booking for ${userEmail} marked as 'paid'.`);
        } else {
          // This can happen if the payment page was opened but the booking was cancelled elsewhere.
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

















