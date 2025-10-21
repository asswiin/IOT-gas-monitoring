
const express = require('express');
const router = express.Router();
const GasLevel = require('../models/Gaslevel');
const KYC = require('../models/Newconnection');
const AutoBooking = require('../models/AutoBooking');

// --- Define System Thresholds ---
const BOOKING_THRESHOLD = 20;
const CANCELLATION_PERIOD_DAYS = 10;
const LEAK_TRIGGER_START_LEVEL = 50; 
const LEAK_TRIGGER_END_LEVEL = 40;   

const checkForLeak = (currentLevel) => {
  return currentLevel <= LEAK_TRIGGER_START_LEVEL && currentLevel > LEAK_TRIGGER_END_LEVEL;
};

// --- GET gas level for a specific user by email ---
router.get('/:email', async (req, res) => {
  const userEmail = req.params.email.toLowerCase();

  try {
    // --- Auto-cancellation logic for unpaid bookings (remains the same) ---
    const tenDaysAgo = new Date(Date.now() - CANCELLATION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    const expiredBooking = await AutoBooking.findOne({
      email: userEmail,
      status: { $in: ['booking_pending', 'refill_payment_pending'] },
      createdAt: { $lt: tenDaysAgo }
    });

    if (expiredBooking) {
      console.log(`Auto-cancelling expired booking for ${userEmail}.`);
      await Promise.all([
        AutoBooking.findByIdAndUpdate(expiredBooking._id, { $set: { status: 'cancelled' } }),
        GasLevel.findOneAndUpdate({ email: userEmail }, { $set: { autoBookingCancelled: true } }),
        KYC.findOneAndUpdate({ email: userEmail }, { $set: { status: 'active' } })
      ]);
    }

    // --- Fetch core data ---
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
        currentGasLevelDoc = await new GasLevel({ userId: kycUser._id, email: userEmail }).save();
      } else {
        return res.status(404).json({ message: `Gas level data not available for user with status: ${kycUser.status}` });
      }
    }

    // --- Cylinder Activation Logic ---
    if (currentGasLevelDoc.currentLevel <= 0 && currentGasLevelDoc.hasPaidForRefill) {
        const paidBooking = await AutoBooking.findOne({ email: userEmail, status: 'paid' }).sort({ updatedAt: -1 });
        if (paidBooking) {
            await AutoBooking.findByIdAndUpdate(paidBooking._id, { status: 'fulfilled' });
            console.log(`✅ Booking for ${userEmail} marked as 'fulfilled'.`);
        }
        currentGasLevelDoc.currentLevel = 100;
        currentGasLevelDoc.hasPaidForRefill = false;
        currentGasLevelDoc.autoBookingCancelled = false;
    }

    // --- Leak Detection ---
    currentGasLevelDoc.isLeaking = checkForLeak(currentGasLevelDoc.currentLevel);
    
    // ✅ --- REFACTORED BOOKING LOGIC --- ✅

    // STEP 1: ALWAYS check for an existing pending booking first.
    let relevantBooking = await AutoBooking.findOne({ 
        email: userEmail, 
        status: { $in: ['booking_pending', 'refill_payment_pending'] } 
    });

    // STEP 2: ONLY if no booking exists, check if we should create an automatic one.
    if (!relevantBooking && 
        currentGasLevelDoc.currentLevel <= BOOKING_THRESHOLD && 
        kycUser.status === 'active' && 
        !currentGasLevelDoc.isLeaking &&
        !currentGasLevelDoc.hasPaidForRefill &&
        !currentGasLevelDoc.autoBookingCancelled) {
      
      console.log(`🎯 No existing booking. Creating new auto-booking for ${userEmail}.`);
      const customerAddress = [ kycUser.houseName, kycUser.streetName, kycUser.town, kycUser.district, kycUser.state, kycUser.pinCode ].filter(Boolean).join(', ');
      
      const newAutoBooking = new AutoBooking({ 
          userId: kycUser._id, 
          email: userEmail, 
          customerName: `${kycUser.firstName} ${kycUser.lastName}`.trim(),
          mobileNumber: kycUser.mobileNumber,
          address: customerAddress,
          status: 'booking_pending', 
          bookingType: 'automatic' // Explicitly set as automatic
      });
      
      relevantBooking = await newAutoBooking.save(); // Assign the newly created booking
      kycUser.status = 'booking_pending'; 
    }

    // --- Save changes and send final response ---
    await Promise.all([kycUser.save(), currentGasLevelDoc.save()]);
    
    // This response is now built from the 'relevantBooking' variable, which is guaranteed
    // to be either the user's manual booking or a newly created automatic one.
    res.json({ 
      ...currentGasLevelDoc.toObject(), 
      kycStatus: kycUser.status, 
      bookingStatus: relevantBooking ? relevantBooking.status : null,
      bookingDate: relevantBooking ? relevantBooking.createdAt : null,
      bookingType: relevantBooking ? relevantBooking.bookingType : null // This is now robustly correct
    });

  } catch (err) {
    console.error(`Error fetching gas level for ${userEmail}:`, err);
    res.status(500).json({ message: "Server error while fetching gas level data." });
  }
});


// --- PUT route to handle gas refill payment completion (remains the same) ---
router.put('/:email/refill', async (req, res) => {
    try {
        const userEmail = req.params.email.toLowerCase();

        const updatedKyc = await KYC.findOneAndUpdate(
            { email: userEmail }, { $set: { status: 'active' } }, { new: true }
        );
        if (!updatedKyc) return res.status(404).json({ message: "User not found to update status." });

        await GasLevel.findOneAndUpdate(
            { email: userEmail }, { $set: { hasPaidForRefill: true } }, { new: true }
        );
        const updatedBooking = await AutoBooking.findOneAndUpdate(
          { email: userEmail, status: 'booking_pending' }, { $set: { status: 'paid' } }, { new: true }
        );

        if (updatedBooking) console.log(`✅ Booking for ${userEmail} marked as 'paid'.`);
        else console.warn(`Could not find a 'booking_pending' record for ${userEmail} to mark as paid.`);

        res.json({ message: "Gas refill payment successful!" });
    } catch (err) {
        console.error("Error during gas refill process for", req.params.email, ":", err);
        res.status(500).json({ message: "Server error during gas refill process." });
    }
});

module.exports = router;
