

const express = require('express');
const router = express.Router();
const GasLevel = require('../models/Gaslevel');
const KYC = require('../models/Newconnection');
const AutoBooking = require('../models/AutoBooking');

const BOOKING_THRESHOLD = 20;
const LEAK_TRIGGER_START_LEVEL = 50;
const LEAK_TRIGGER_END_LEVEL = 47;

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
      return res.status(404).json({ message: "User profile not found." });
    }

    let currentGasLevelDoc = gasLevelDoc;

    if (!currentGasLevelDoc) {
      if (kycUser.status === 'active') {
        const newGasLevel = new GasLevel({ userId: kycUser._id, email: userEmail, currentLevel: 100 });
        currentGasLevelDoc = await newGasLevel.save();
      } else {
        return res.status(404).json({ message: `Gas level data not available for user with status: ${kycUser.status}` });
      }
    }

    if (currentGasLevelDoc.currentLevel <= 0 && currentGasLevelDoc.hasPaidForRefill) {
      console.log(`User ${userEmail}: Old cylinder depleted. Activating new cylinder.`);
      currentGasLevelDoc.currentLevel = 100;
      currentGasLevelDoc.hasPaidForRefill = false;
      currentGasLevelDoc.isLeaking = false;
      
      // NOTE: This correctly finds the single 'paid' record and updates it to 'fulfilled'.
      await AutoBooking.findOneAndUpdate(
        { email: userEmail, status: 'paid' },
        { $set: { status: 'fulfilled' } }
      );
    }

    currentGasLevelDoc.isLeaking = checkForLeak(currentGasLevelDoc.currentLevel);

    // --- REFINED AUTO-BOOKING LOGIC ---
    // This logic ensures only ONE active booking record exists per user at a time.
    if (currentGasLevelDoc.currentLevel <= BOOKING_THRESHOLD && kycUser.status === 'active' && !currentGasLevelDoc.isLeaking && !currentGasLevelDoc.hasPaidForRefill) {
      
      // MODIFIED: Check for any booking that is not 'fulfilled' or 'cancelled'.
      // This prevents creating a new booking if one is already pending or even paid.
      const existingActiveBooking = await AutoBooking.findOne({
        email: userEmail,
        status: { $in: ['booking_pending', 'refill_payment_pending', 'paid'] }
      });

      // Only create a new booking document if no active one already exists.
      if (!existingActiveBooking) {
        const newAutoBooking = new AutoBooking({
          userId: kycUser._id,
          email: userEmail,
          status: 'booking_pending',
        });
        await newAutoBooking.save();
        console.log(`New auto-booking document created for ${userEmail}.`);
      }
    }

    // This logic for cancellation remains correct. It finds the pending booking and updates it.
    const pendingBooking = await AutoBooking.findOne({ email: userEmail, status: { $in: ['booking_pending', 'refill_payment_pending'] } });
    if (currentGasLevelDoc.currentLevel > BOOKING_THRESHOLD && pendingBooking) {
      pendingBooking.status = 'cancelled';
      await pendingBooking.save();
      console.log(`Pending booking for ${userEmail} was updated to 'cancelled'.`);
    }
    
    await currentGasLevelDoc.save();
    
    // Fetch the most current booking status to send to the frontend
    const currentBooking = await AutoBooking.findOne({ email: userEmail, status: { $in: ['booking_pending', 'refill_payment_pending'] } });

    res.json({
      ...currentGasLevelDoc.toObject(),
      kycStatus: kycUser.status,
      bookingStatus: currentBooking ? currentBooking.status : null
    });

  } catch (err) {
    console.error(`Error fetching gas level for ${userEmail}:`, err);
    res.status(500).json({ message: "Server error while fetching gas level data." });
  }
});

// PUT route to handle gas refill payment completion
router.put('/:email/refill', async (req, res) => {
    try {
        const userEmail = req.params.email.toLowerCase();

        const updatedGasLevel = await GasLevel.findOneAndUpdate(
            { email: userEmail },
            { $set: { hasPaidForRefill: true, isLeaking: false } },
            { new: true, upsert: true }
        );

        // NOTE: This is correct. It finds the single pending booking and updates its status to 'paid'.
        // It does NOT create a new record.
        const updatedBooking = await AutoBooking.findOneAndUpdate(
          { email: userEmail, status: { $in: ['booking_pending', 'refill_payment_pending'] } },
          { $set: { status: 'paid' } }
        );

        if (!updatedBooking) {
            console.warn(`Refill payment processed for ${userEmail}, but no pending booking was found to update.`);
        }

        res.json({
            message: "Gas refill payment successful! New cylinder will activate when current one is depleted.",
            gasData: updatedGasLevel
        });

    } catch (err) {
        console.error("Error during gas refill process for", req.params.email, ":", err);
        res.status(500).json({ message: "Server error during gas refill process." });
    }
});

// This route remains unchanged.
router.post('/update', async (req, res) => {
  const { email, currentLevel, isLeaking } = req.body;

  if (!email || currentLevel === undefined || isLeaking === undefined) {
    return res.status(400).json({ message: "Missing required fields: email, currentLevel, isLeaking" });
  }

  try {
    const updatedGasLevel = await GasLevel.findOneAndUpdate(
      { email: email },
      { $set: { currentLevel: currentLevel, isLeaking: isLeaking, lastUpdated: new Date() } },
      { new: true, upsert: true }
    );
    
    res.status(200).json({ message: "Gas level updated successfully", data: updatedGasLevel });

  } catch (error) {
    console.error("Error updating gas level:", error);
    res.status(500).json({ message: "Server error while updating gas level." });
  }
});

module.exports = router;