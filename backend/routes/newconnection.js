//  email
// router.get("/:email", async (req, res) => {
//   try {
//     const kycData = await KYC.findOne({ email: req.params.email });
//     if (kycData) {
//       return res.json(kycData);
//     }
//     return res.status(404).json({ message: "No KYC data found." });
//   } catch (err) {
//     console.error("Server error fetching KYC data:", err);
//     res.status(500).json({ message: "Server error while fetching KYC data" });
//   }
// });

// // POST new KYC form
// router.post("/", async (req, res) => {
//   try {
//     const { email, mobileNumber } = req.body;

//     const existingConnection = await KYC.findOne({ $or: [{ email }, { mobileNumber }] });

//     if (existingConnection) {
//       return res.status(409).json({ message: "A connection with this email or mobile number already exists. Please check its status or update your existing application." });
//     }

//     const newForm = new KYC(req.body);
//     await newForm.save();
//     res.status(201).json({ message: "KYC Form saved successfully!", kycData: newForm });
//   } catch (err) {
//     console.error("❌ Save Error:", err);
//     res.status(500).json({ message: "Error saving form" });
//   }
// });

// // PUT to update KYC status after payment (or admin approval/rejection)
// // ✅ MODIFIED: Handle 'rejected' status the same way 'delete' would for consistency
// router.put("/:email/status", async (req, res) => {
//     try {
//       const { status } = req.body;
//       const userEmail = req.params.email;

//       if (status === 'rejected') {
//         const deletedKYC = await KYC.findOneAndDelete({ email: userEmail });
//         if (!deletedKYC) {
//           return res.status(404).json({ message: "KYC record not found for rejection." });
//         }
//         // ✅ Cascade delete associated payments, gas level, and auto-bookings
//         await Payment.deleteMany({ kycId: deletedKYC._id }); 
//         await GasLevel.deleteOne({ email: userEmail });
//         await AutoBooking.deleteMany({ userId: deletedKYC._id });
//         return res.json({ message: "KYC request rejected, user and associated data removed.", status: 'rejected' });
//       } else {
//         const updatedKYC = await KYC.findOneAndUpdate(
//           { email: userEmail },
//           { $set: { status: status } },
//           { new: true }
//         ).select('+_id');  // Explicitly include _id in the response
        
//         if (!updatedKYC) {
//           return res.status(404).json({ message: "KYC record not found for update." });
//         }

//         // If status is approved, send all necessary details for payment
//         if (status === 'approved') {
//           const kycDetails = {
//             _id: updatedKYC._id,
//             firstName: updatedKYC.firstName,
//             lastName: updatedKYC.lastName,
//             email: updatedKYC.email,
//             mobileNumber: updatedKYC.mobileNumber,
//             houseName: updatedKYC.houseName,
//             streetName: updatedKYC.streetName,
//             city: updatedKYC.city,
//             district: updatedKYC.district,
//             state: updatedKYC.state,
//             pinCode: updatedKYC.pinCode,
//             status: updatedKYC.status
//           };
//           return res.json({ 
//             message: "KYC approved. Proceed to payment.", 
//             kycData: kycDetails,
//             requiresPayment: true
//           });
//         }
        
//         res.json({ message: "KYC status updated.", kycData: updatedKYC });
//       }
//     } catch (err) {
//       console.error("❌ Status Update/Deletion Error:", err);
//       res.status(500).json({ message: "Error updating/deleting KYC status" });
//     }
// });

// // PUT to update a user's profile/KYC data (used when an existing user resubmits their form)
// router.put("/:email", async (req, res) => {
//   try {
//     const userEmail = req.params.email;
//     const updatedData = { ...req.body, status: 'pending_approval' };

//     const updatedUser = await KYC.findOneAndUpdate(
//       { email: userEmail },
//       updatedData,
//       { new: true, runValidators: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User profile not found." });
//     }

//     res.json({ message: "Application updated successfully! Awaiting admin approval.", kycData: updatedUser });
//   } catch (err) {
//     console.error("❌ Application Update Error:", err);
//     res.status(500).json({ message: "Error updating application" });
//   }
// });

// // For logged-in users to update their profile *without* changing status
// router.put("/:email/profile", async (req, res) => {
//   try {
//     const userEmail = req.params.email;
//     const { status, ...updateFields } = req.body;

//     const existingUser = await KYC.findOne({ email: userEmail });
//     if (!existingUser) {
//       return res.status(404).json({ message: "User profile not found for update." });
//     }

//     const updatedUser = await KYC.findOneAndUpdate(
//       { email: userEmail },
//       { $set: updateFields },
//       { new: true, runValidators: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User profile not found after update attempt." });
//     }

//     res.json({ message: "Profile updated successfully!", kycData: updatedUser });
//   } catch (err) {
//     console.error("❌ Profile Update Error:", err);
//     res.status(500).json({ message: "Error updating profile." });
//   }
// });

// // ✅ NEW ROUTE: Deactivate user account (sets status to 'deactivated')
// router.put("/:email/deactivate", async (req, res) => {
//   try {
//     const userEmail = req.params.email;
//     const updatedKYC = await KYC.findOneAndUpdate(
//       { email: userEmail },
//       { $set: { status: 'deactivated' } },
//       { new: true }
//     );

//     if (!updatedKYC) {
//       return res.status(404).json({ message: "User not found for deactivation." });
//     }
//     res.json({ message: "Account deactivated successfully!", kycData: updatedKYC });
//   } catch (err) {
//     console.error("❌ Deactivation Error:", err);
//     res.status(500).json({ message: "Error deactivating account." });
//   }
// });

// // ✅ NEW ROUTE: Admin-specific DELETE user and their payments
// // This route is distinct from setting status to 'rejected' for pending requests.
// // This is for deleting an *existing* user (approved, active, or deactivated).
// router.delete("/:email", async (req, res) => {
//   try {
//     const userEmail = req.params.email;

//     // 1. Find the KYC record to get its _id
//     const userToDelete = await KYC.findOne({ email: userEmail });
//     if (!userToDelete) {
//       return res.status(404).json({ message: "User not found for deletion." });
//     }

//     const kycId = userToDelete._id;

//     // 2. Delete associated payment records
//     await Payment.deleteMany({ kycId: kycId });

//     // 3. Delete the GasLevel record
//     await GasLevel.deleteOne({ email: userEmail });

//     // 4. Delete associated AutoBooking records
//     await AutoBooking.deleteMany({ userId: kycId });

//     // 5. Delete the KYC record
//     await KYC.deleteOne({ email: userEmail });

//     res.json({ message: "User and all associated data deleted successfully!" });
//   } catch (err) {
//     console.error("❌ Admin Delete User Error:", err);
//     res.status(500).json({ message: "Server error while deleting user and associated data." });
//   }
// });

// // Cancel a pending booking (user-initiated, keeps KYC active)
// router.put("/:email/cancel-booking", async (req, res) => {
//   try { 
//     const userEmail = req.params.email;

//     // Find and cancel the pending booking
//     const cancelledBooking = await AutoBooking.findOneAndUpdate(
//       { 
//         email: userEmail,
//         status: { $in: ['booking_pending', 'refill_payment_pending'] } 
//       },
//       { $set: { status: 'cancelled' } },
//       { new: true }
//     );

//     if (!cancelledBooking) {
//       return res.status(404).json({ message: "No pending booking found to cancel." });
//     }
    
//     // Ensure the user's KYC status remains 'active'
//     await KYC.findOneAndUpdate(
//       { email: userEmail },
//       { $set: { status: 'active' } }
//     );
    
//     console.log(`Booking cancelled for ${userEmail}`);
//     res.json({ 
//       message: "Booking cancelled successfully!", 
//       cancelledBooking: cancelledBooking 
//     });
//   } catch (err) {
//     console.error("❌ Booking Cancellation Error:", err);
//     res.status(500).json({ message: "Error cancelling booking." });
//   }
// });

// router.post("/:email/rebook", async (req, res) => {
//   try {
//     const userEmail = req.params.email;

//     const user = await KYC.findOne({ email: userEmail });
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }
    
//     const existingActiveBooking = await AutoBooking.findOne({
//       email: userEmail,
//       status: { $in: ['booking_pending', 'refill_payment_pending', 'paid'] }
//     });

//     if (existingActiveBooking) {
//       return res.status(409).json({ message: "An active booking already exists. Please proceed to payment." });
//     }

//     const newBooking = new AutoBooking({
//       userId: user._id,
//       email: userEmail,
//       status: 'booking_pending'
//     });
//     await newBooking.save();

//     res.status(201).json({ message: "Booking created successfully. Proceed to payment.", booking: newBooking });

//   } catch (err) {
//     console.error("❌ Manual Re-booking Error:", err);
//     res.status(500).json({ message: "Server error while creating new booking." });
//   }
// });


// module.exports = router;






























const express = require("express");
const router = express.Router();
const KYC = require("../models/Newconnection");
const Payment = require("../models/Payment");
const GasLevel = require("../models/Gaslevel");
const AutoBooking = require("../models/AutoBooking"); // Import the new model

// GET all pending approval requests for admin
router.get("/requests/pending", async (req, res) => {
  try {
    const pendingRequests = await KYC.find({ status: 'pending_approval' });
    res.json(pendingRequests);
  } catch (err) {
    console.error("❌ Error fetching pending requests:", err);
    res.status(500).json({ message: "Server error while fetching pending KYC requests" });
  }
});

// GET all users/KYC records for admin 'Users' section
router.get("/", async (req, res) => {
  try {
    const allUsers = await KYC.find({});
    res.json(allUsers);
  } catch (err) {
    console.error("❌ Error fetching all users:", err);
    res.status(500).json({ message: "Server error while fetching all user data" });
  }
});

// GET existing KYC data by email
router.get("/:email", async (req, res) => {
  try {
    const kycData = await KYC.findOne({ email: req.params.email });
    if (kycData) {
      return res.json(kycData);
    }
    return res.status(404).json({ message: "No KYC data found." });
  } catch (err) {
    console.error("Server error fetching KYC data:", err);
    res.status(500).json({ message: "Server error while fetching KYC data" });
  }
});

// POST new KYC form
router.post("/", async (req, res) => {
  try {
    const { email, mobileNumber } = req.body;

    const existingConnection = await KYC.findOne({ $or: [{ email }, { mobileNumber }] });

    if (existingConnection) {
      return res.status(409).json({ message: "A connection with this email or mobile number already exists. Please check its status or update your existing application." });
    }

    const newForm = new KYC(req.body);
    await newForm.save();
    res.status(201).json({ message: "KYC Form saved successfully!", kycData: newForm });
  } catch (err) {
    console.error("❌ Save Error:", err);
    res.status(500).json({ message: "Error saving form" });
  }
});

// PUT to update KYC status after payment (or admin approval/rejection)
router.put("/:email/status", async (req, res) => {
    try {
      const { status } = req.body;
      const userEmail = req.params.email;

      if (status === 'rejected') {
        const deletedKYC = await KYC.findOneAndDelete({ email: userEmail });
        if (!deletedKYC) {
          return res.status(404).json({ message: "KYC record not found for rejection." });
        }
        await Payment.deleteMany({ kycId: deletedKYC._id }); 
        await GasLevel.deleteOne({ email: userEmail });
        await AutoBooking.deleteMany({ userId: deletedKYC._id });
        return res.json({ message: "KYC request rejected, user and associated data removed.", status: 'rejected' });
      } else {
        const updatedKYC = await KYC.findOneAndUpdate(
          { email: userEmail },
          { $set: { status: status } },
          { new: true }
        ).select('+_id');
        
        if (!updatedKYC) {
          return res.status(404).json({ message: "KYC record not found for update." });
        }

        if (status === 'approved') {
          const kycDetails = {
            _id: updatedKYC._id,
            firstName: updatedKYC.firstName,
            lastName: updatedKYC.lastName,
            email: updatedKYC.email,
            mobileNumber: updatedKYC.mobileNumber,
            houseName: updatedKYC.houseName,
            streetName: updatedKYC.streetName,
            city: updatedKYC.city,
            district: updatedKYC.district,
            state: updatedKYC.state,
            pinCode: updatedKYC.pinCode,
            status: updatedKYC.status
          };
          return res.json({ 
            message: "KYC approved. Proceed to payment.", 
            kycData: kycDetails,
            requiresPayment: true
          });
        }
        
        res.json({ message: "KYC status updated.", kycData: updatedKYC });
      }
    } catch (err) {
      console.error("❌ Status Update/Deletion Error:", err);
      res.status(500).json({ message: "Error updating/deleting KYC status" });
    }
});

// PUT to update a user's profile/KYC data (used when an existing user resubmits their form)
router.put("/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;
    const updatedData = { ...req.body, status: 'pending_approval' };

    const updatedUser = await KYC.findOneAndUpdate(
      { email: userEmail },
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User profile not found." });
    }

    res.json({ message: "Application updated successfully! Awaiting admin approval.", kycData: updatedUser });
  } catch (err) {
    console.error("❌ Application Update Error:", err);
    res.status(500).json({ message: "Error updating application" });
  }
});

// For logged-in users to update their profile *without* changing status
router.put("/:email/profile", async (req, res) => {
  try {
    const userEmail = req.params.email;
    const { status, ...updateFields } = req.body;

    const existingUser = await KYC.findOne({ email: userEmail });
    if (!existingUser) {
      return res.status(404).json({ message: "User profile not found for update." });
    }

    const updatedUser = await KYC.findOneAndUpdate(
      { email: userEmail },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User profile not found after update attempt." });
    }

    res.json({ message: "Profile updated successfully!", kycData: updatedUser });
  } catch (err) {
    console.error("❌ Profile Update Error:", err);
    res.status(500).json({ message: "Error updating profile." });
  }
});

// Deactivate user account (sets status to 'deactivated')
router.put("/:email/deactivate", async (req, res) => {
  try {
    const userEmail = req.params.email;
    const updatedKYC = await KYC.findOneAndUpdate(
      { email: userEmail },
      { $set: { status: 'deactivated' } },
      { new: true }
    );

    if (!updatedKYC) {
      return res.status(404).json({ message: "User not found for deactivation." });
    }
    res.json({ message: "Account deactivated successfully!", kycData: updatedKYC });
  } catch (err) {
    console.error("❌ Deactivation Error:", err);
    res.status(500).json({ message: "Error deactivating account." });
  }
});

// Admin-specific DELETE user and their payments
router.delete("/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;
    const userToDelete = await KYC.findOne({ email: userEmail });
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found for deletion." });
    }
    const kycId = userToDelete._id;
    await Payment.deleteMany({ kycId: kycId });
    await GasLevel.deleteOne({ email: userEmail });
    await AutoBooking.deleteMany({ userId: kycId });
    await KYC.deleteOne({ email: userEmail });

    res.json({ message: "User and all associated data deleted successfully!" });
  } catch (err) {
    console.error("❌ Admin Delete User Error:", err);
    res.status(500).json({ message: "Server error while deleting user and associated data." });
  }
});

// Cancel a pending booking
router.put("/:email/cancel-booking", async (req, res) => {
  try { 
    const userEmail = req.params.email;
    const cancelledBooking = await AutoBooking.findOneAndUpdate(
      { 
        email: userEmail,
        status: { $in: ['booking_pending', 'refill_payment_pending'] } 
      },
      { $set: { status: 'cancelled' } },
      { new: true }
    );

    if (!cancelledBooking) {
      return res.status(404).json({ message: "No pending booking found to cancel." });
    }
    
    await KYC.findOneAndUpdate(
      { email: userEmail },
      { $set: { status: 'active' } }
    );
    
    console.log(`Booking cancelled for ${userEmail}`);
    res.json({ 
      message: "Booking cancelled successfully!", 
      cancelledBooking: cancelledBooking 
    });
  } catch (err) {
    console.error("❌ Booking Cancellation Error:", err);
    res.status(500).json({ message: "Error cancelling booking." });
  }
});

// Manually re-book after cancellation
router.post("/:email/rebook", async (req, res) => {
  try {
    const userEmail = req.params.email;

    const user = await KYC.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    const existingActiveBooking = await AutoBooking.findOne({
      email: userEmail,
      status: { $in: ['booking_pending', 'refill_payment_pending', 'paid'] }
    });

    if (existingActiveBooking) {
      return res.status(409).json({ message: "An active booking already exists. Please proceed to payment." });
    }

    const newBooking = new AutoBooking({
      userId: user._id,
      email: userEmail,
      status: 'booking_pending'
    });
    await newBooking.save();

    res.status(201).json({ message: "Booking created successfully. Proceed to payment.", booking: newBooking });

  } catch (err) {
    console.error("❌ Manual Re-booking Error:", err);
    res.status(500).json({ message: "Server error while creating new booking." });
  }
});


module.exports = router;