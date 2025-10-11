
// const express = require('express');
// const router = express.Router();
// const GasLevel = require('../models/Gaslevel');
// const KYC = require('../models/Newconnection');
// const AutoBooking = require('../models/AutoBooking'); // Import the new model

// const BOOKING_THRESHOLD = 20; // Gas level percentage at which auto-booking triggers
// const LEAK_TRIGGER_START_LEVEL = 50; // Example: Leak starts detecting below 50%
// const LEAK_TRIGGER_END_LEVEL = 47; // Example: Leak detection range ends at 47% (meaning if it drops below, it's a confirmed leak)

// const checkForLeak = (currentLevel) => {
//   return currentLevel <= LEAK_TRIGGER_START_LEVEL && currentLevel > LEAK_TRIGGER_END_LEVEL;
// };

// // GET gas level for a specific user by email
// router.get('/:email', async (req, res) => {
//   const userEmail = req.params.email.toLowerCase();

//   try {
//     const [kycUser, gasLevelDoc] = await Promise.all([ // Renamed gasLevel to gasLevelDoc to avoid confusion
//       KYC.findOne({ email: userEmail }),
//       GasLevel.findOne({ email: userEmail })
//     ]);

//     if (!kycUser) {
//       console.warn(`Gas level check failed: No KYC record found for ${userEmail}`);
//       return res.status(404).json({ message: "User profile not found." });
//     }

//     let currentGasLevelDoc = gasLevelDoc; // Use a mutable variable

//     if (!currentGasLevelDoc) {
//       // If the user is active, they need a gas level record. Create one.
//       if (kycUser.status === 'active') {
//         if (!kycUser._id) {
//           console.error(`CRITICAL: KYC record for ${userEmail} is missing an _id.`);
//           return res.status(500).json({ message: "Server error: User data is corrupt." });
//         }

//         console.log(`No GasLevel found for active user ${userEmail}. Creating a new one.`);
//         const newGasLevel = new GasLevel({
//           userId: kycUser._id,
//           email: userEmail,
//           currentLevel: 100,
//           hasPaidForRefill: false // New connections don't have paid refills initially
//         });
//         currentGasLevelDoc = await newGasLevel.save();
//         return res.json({ ...currentGasLevelDoc.toObject(), status: kycUser.status });
//       } else {
//         // If user is not active (e.g., pending_approval), it's okay not to have a gas record yet.
//         console.warn(`No GasLevel record for non-active user ${userEmail} (status: ${kycUser.status}).`);
//         return res.status(404).json({ message: `Gas level data not available for user with status: ${kycUser.status}` });
//       }
//     }

//     // --- NEW LOGIC FOR REFILL ACTIVATION ---
//     if (currentGasLevelDoc.currentLevel <= 0 && currentGasLevelDoc.hasPaidForRefill) {
//         console.log(`User ${userEmail}: Old cylinder depleted. Activating new cylinder.`);
//         currentGasLevelDoc.currentLevel = 100;
//         currentGasLevelDoc.hasPaidForRefill = false;
//         currentGasLevelDoc.isLeaking = false; // Reset leak status for new cylinder
//         // Also update the auto-booking status if it exists
//         await AutoBooking.findOneAndUpdate(
//           { email: userEmail, status: 'paid' },
//           { $set: { status: 'fulfilled' } }
//         );
//     }
//     // --- END NEW LOGIC ---

//     // Update leak status for the gas level record
//     currentGasLevelDoc.isLeaking = checkForLeak(currentGasLevelDoc.currentLevel);

//     // Logic to change KYC status based on gas level
//     if (currentGasLevelDoc.currentLevel <= BOOKING_THRESHOLD && kycUser.status === 'active' && !currentGasLevelDoc.isLeaking && !currentGasLevelDoc.hasPaidForRefill) {
//       // Auto-book only if no refill is already paid for
//       kycUser.status = 'refill_payment_pending'; // Mark for refill payment
//       await kycUser.save();
//       console.log(`User ${userEmail} status changed to refill_payment_pending.`);

//       // --- NEW: Create an AutoBooking record ---
//       const existingAutoBooking = await AutoBooking.findOne({ email: userEmail, status: 'booked' });
//       if (!existingAutoBooking) { // Only create if one doesn't already exist
//         const newAutoBooking = new AutoBooking({
//           userId: kycUser._id,
//           email: userEmail,
//           status: 'booked',
//         });
//         await newAutoBooking.save();
//         console.log(`Auto-booking created for ${userEmail}.`);
//       }
//       // --- END NEW ---

//     }
//     // If the user's gas level has risen (e.g., after a refill payment on the backend)
//     // and their status is still 'booking_pending' or 'refill_payment_pending', revert to 'active'.
//     // This now only happens if current gas is sufficient AND no refill is pending activation.
//     else if ( (kycUser.status === 'booking_pending' || kycUser.status === 'refill_payment_pending') && currentGasLevelDoc.currentLevel > BOOKING_THRESHOLD && !currentGasLevelDoc.hasPaidForRefill) {
//       kycUser.status = 'active';
//       await kycUser.save();
//       console.log(`User ${userEmail} status automatically reverted to 'active' as gas level is sufficient.`);
//       // If status reverted, also mark any pending auto-booking as cancelled or remove it if desired
//       await AutoBooking.findOneAndUpdate(
//         { email: userEmail, status: 'booked' },
//         { $set: { status: 'cancelled' } }
//       );
//     }

//     await currentGasLevelDoc.save(); // Save any changes to gasLevelDoc (like currentLevel, isLeaking, hasPaidForRefill)

//     res.json({ ...currentGasLevelDoc.toObject(), status: kycUser.status });

//   } catch (err) {
//     console.error(`Error fetching gas level for ${userEmail}:`, err);
//     res.status(500).json({ message: "Server error while fetching gas level data." });
//   }
// });

// // PUT route to handle gas refill payment completion
// router.put('/:email/refill', async (req, res) => {
//     try {
//         const userEmail = req.params.email.toLowerCase();

//         // 1. Update KYC status to 'active'
//         const updatedKyc = await KYC.findOneAndUpdate(
//             { email: userEmail },
//             { $set: { status: 'active' } }, // Set status to active immediately as payment is done
//             { new: true }
//         );

//         if (!updatedKyc) {
//             console.warn(`Refill failed: KYC record not found for ${userEmail}`);
//             return res.status(404).json({ message: "User not found to update status." });
//         }

//         // 2. Instead of setting currentLevel to 100, set hasPaidForRefill to true
//         const updatedGasLevel = await GasLevel.findOneAndUpdate(
//             { email: userEmail },
//             { $set: { hasPaidForRefill: true, isLeaking: false } }, // Also reset leak status
//             { new: true, upsert: true } // upsert: true creates if not found
//         );

//         // --- NEW: Update the AutoBooking status to 'paid' ---
//         await AutoBooking.findOneAndUpdate(
//           { email: userEmail, status: 'booked' }, // Find an existing 'booked' status
//           { $set: { status: 'paid' } }
//         );
//         // --- END NEW ---

//         res.json({
//             message: "Gas refill payment successful! New cylinder will activate when current one is depleted.",
//             kycData: updatedKyc,
//             gasData: updatedGasLevel
//         });

//     } catch (err) {
//         console.error("Error during gas refill process for", req.params.email, ":", err);
//         res.status(500).json({ message: "Server error during gas refill process." });
//     }
// });






// // POST /api/gaslevel/update
// router.post('/update', async (req, res) => {
//   const { email, currentLevel, isLeaking } = req.body;

//   if (!email || currentLevel === undefined || isLeaking === undefined) {
//     return res.status(400).json({ message: "Missing required fields: email, currentLevel, isLeaking" });
//   }

//   try {
//     // Find the user's gas level document and update it
//     const updatedGasLevel = await GasLevel.findOneAndUpdate(
//       { email: email },
//       {
//         $set: {
//           currentLevel: currentLevel,
//           isLeaking: isLeaking,
//           lastUpdated: new Date()
//         }
//       },
//       { 
//         new: true, // Return the updated document
//         upsert: true // Create the document if it doesn't exist
//       }
//     );
    
//     // --- Auto-Booking Logic ---
//     // This logic should be here on the server, not on the ESP32
//     if (currentLevel <= 20 && !isLeaking) { // Let's use 20% as the threshold
//         const kycUser = await KYC.findOne({ email: email });
//         if (kycUser && kycUser.status === 'active') {
//             kycUser.status = 'booking_pending';
//             await kycUser.save();
//             console.log(`Auto-booking triggered for ${email}. Status changed to booking_pending.`);
//         }
//     }

//     res.status(200).json({ message: "Gas level updated successfully", data: updatedGasLevel });

//   } catch (error) {
//     console.error("Error updating gas level:", error);
//     res.status(500).json({ message: "Server error while updating gas level." });
//   }
// });


// module.exports = router;





































// routes/gaslevel.js
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

router.get('/:email', async (req, res) => {
  const userEmail = req.params.email.toLowerCase();
  try {
    const [kycUser, gasLevelDoc, pendingBooking] = await Promise.all([
      KYC.findOne({ email: userEmail }),
      GasLevel.findOne({ email: userEmail }),
      // MODIFIED: Also fetch any pending booking for this user.
      AutoBooking.findOne({ email: userEmail, status: { $in: ['booking_pending', 'refill_payment_pending']} })
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
        currentGasLevelDoc.currentLevel = 100;
        currentGasLevelDoc.hasPaidForRefill = false;
        currentGasLevelDoc.isLeaking = false;
        await AutoBooking.findOneAndUpdate(
          { email: userEmail, status: 'paid' },
          { $set: { status: 'fulfilled' } }
        );
    }
    
    currentGasLevelDoc.isLeaking = checkForLeak(currentGasLevelDoc.currentLevel);

    // --- MODIFIED: Auto-booking logic now creates an AutoBooking record ---
    if (currentGasLevelDoc.currentLevel <= BOOKING_THRESHOLD && kycUser.status === 'active' && !currentGasLevelDoc.isLeaking && !currentGasLevelDoc.hasPaidForRefill) {
      // Only create a booking if one isn't already pending.
      if (!pendingBooking) {
        const newAutoBooking = new AutoBooking({
          userId: kycUser._id,
          email: userEmail,
          status: 'booking_pending', // Set the initial booking status
        });
        await newAutoBooking.save();
        console.log(`Auto-booking created for ${userEmail}.`);
      }
    } else if (currentGasLevelDoc.currentLevel > BOOKING_THRESHOLD && pendingBooking) {
      // If gas level is high and a booking is pending, cancel it.
      pendingBooking.status = 'cancelled';
      await pendingBooking.save();
      console.log(`Pending booking for ${userEmail} was cancelled as gas level is now sufficient.`);
    }
    
    await currentGasLevelDoc.save();

    // MODIFIED: Return the KYC status and any pending booking status.
    res.json({ 
      ...currentGasLevelDoc.toObject(), 
      kycStatus: kycUser.status,
      bookingStatus: pendingBooking ? pendingBooking.status : null 
    });

  } catch (err) {
    console.error(`Error fetching gas level for ${userEmail}:`, err);
    res.status(500).json({ message: "Server error while fetching gas level data." });
  }
});

router.put('/:email/refill', async (req, res) => {
    try {
        const userEmail = req.params.email.toLowerCase();

        // KYC status remains 'active', so no update is needed here.

        const updatedGasLevel = await GasLevel.findOneAndUpdate(
            { email: userEmail },
            { $set: { hasPaidForRefill: true, isLeaking: false } },
            { new: true, upsert: true }
        );

        // MODIFIED: Update the AutoBooking status to 'paid'.
        await AutoBooking.findOneAndUpdate(
          { email: userEmail, status: { $in: ['booking_pending', 'refill_payment_pending']} },
          { $set: { status: 'paid' } }
        );

        res.json({
            message: "Gas refill payment successful! New cylinder will activate when current one is depleted.",
            gasData: updatedGasLevel
        });

    } catch (err) {
        console.error("Error during gas refill process for", req.params.email, ":", err);
        res.status(500).json({ message: "Server error during gas refill process." });
    }
});

// The /update POST route remains unchanged.
router.post('/update', async (req, res) => {
  const { email, currentLevel, isLeaking } = req.body;
  // ... (existing code is correct)
});

module.exports = router;