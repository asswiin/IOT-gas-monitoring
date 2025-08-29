
// const express = require("express");
// const router = express.Router();
// const KYC = require("../models/Newconnection");

// // GET existing KYC data by email
// router.get("/:email", async (req, res) => {
//   try {
//     const kycData = await KYC.findOne({ email: req.params.email });
//     if (kycData) {
//       return res.json(kycData);
//     }
//     return res.status(404).json({ message: "No KYC data found." });
//   } catch (err) {
//     res.status(500).json({ message: "Server error while fetching KYC data" });
//   }
// });

// // POST new KYC form (with improved duplicate check)
// router.post("/", async (req, res) => {
//   try {
//     const { email, mobileNumber } = req.body;

//     // ✅ Explicitly check if email or mobile number is already in use
//     const existingConnection = await KYC.findOne({ $or: [{ email }, { mobileNumber }] });

//     if (existingConnection) {
//       // ✅ Return a 409 Conflict status
//       return res.status(409).json({ message: "connection already exists" });
//     }

//     // If no existing connection, create a new one
//     const newForm = new KYC(req.body);
//     await newForm.save();
//     res.status(201).json({ message: "KYC Form saved successfully!", kycData: newForm });
//   } catch (err) {
//     // This will catch other database errors, including the unique index violation
//     console.error("❌ Save Error:", err);
//     res.status(500).json({ message: "Error saving form" });
//   }
// });

// // PUT to update KYC status after payment
// router.put("/:email/status", async (req, res) => {
//     try {
//       const { status } = req.body; // Expecting { "status": "active" } in the body
//       const updatedKYC = await KYC.findOneAndUpdate(
//         { email: req.params.email },
//         { $set: { status: status } }, // Use $set for better practice
//         { new: true }
//       );
  
//       if (!updatedKYC) {
//         return res.status(404).json({ message: "KYC record not found." });
//       }
  
//       res.json({ message: "KYC status updated.", kycData: updatedKYC });
//     } catch (err) {
//       console.error("❌ Status Update Error:", err);
//       res.status(500).json({ message: "Error updating KYC status" });
//     }
// });


// // ✅ ADD THIS NEW ROUTE FOR UPDATING A USER'S PROFILE
// router.put("/:email", async (req, res) => {
//   try {
//     const userEmail = req.params.email;
//     const updatedData = req.body;

//     // Find the user by email and update their data
//     // { new: true } ensures the updated document is returned
//     const updatedUser = await KYC.findOneAndUpdate(
//       { email: userEmail },
//       updatedData,
//       { new: true, runValidators: true } // runValidators ensures schema rules are checked
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User profile not found." });
//     }

//     res.json({ message: "Profile updated successfully!", kycData: updatedUser });
//   } catch (err) {
//     console.error("❌ Profile Update Error:", err);
//     res.status(500).json({ message: "Error updating profile" });
//   }
// });

// module.exports = router;




// --- START OF FILE newconnection.js ---

const express = require("express");
const router = express.Router();
const KYC = require("../models/Newconnection"); // Assuming this is your Mongoose model

// ✅ NEW: GET all pending approval requests for admin
router.get("/requests/pending", async (req, res) => {
  try {
    const pendingRequests = await KYC.find({ status: 'pending_approval' });
    res.json(pendingRequests);
  } catch (err) {
    console.error("❌ Error fetching pending requests:", err);
    res.status(500).json({ message: "Server error while fetching pending KYC requests" });
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
    res.status(500).json({ message: "Server error while fetching KYC data" });
  }
});

// POST new KYC form (with improved duplicate check and status)
router.post("/", async (req, res) => {
  try {
    const { email, mobileNumber } = req.body;

    const existingConnection = await KYC.findOne({ $or: [{ email }, { mobileNumber }] });

    if (existingConnection) {
      // If a connection exists, check its status.
      // If it's already approved, or pending, prevent new creation but allow updates.
      // For now, if found, tell the user to check their status or update.
      return res.status(409).json({ message: "A connection with this email or mobile number already exists. Please check its status or update your existing application." });
    }

    // If no existing connection, create a new one
    // ✅ Ensure status is set from req.body (or default to 'pending_approval')
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
      const { status } = req.body; // Expecting { "status": "active" }, { "status": "approved" }, or { "status": "rejected" }
      const updatedKYC = await KYC.findOneAndUpdate(
        { email: req.params.email },
        { $set: { status: status } },
        { new: true }
      );
  
      if (!updatedKYC) {
        return res.status(404).json({ message: "KYC record not found." });
      }
  
      res.json({ message: "KYC status updated.", kycData: updatedKYC });
    } catch (err) {
      console.error("❌ Status Update Error:", err);
      res.status(500).json({ message: "Error updating KYC status" });
    }
});

// PUT to update a user's profile/KYC data (used when an existing user resubmits their form)
router.put("/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;
    const updatedData = { ...req.body, status: 'pending_approval' }; // ✅ Ensure status is set to pending on update too

    const updatedUser = await KYC.findOneAndUpdate(
      { email: userEmail },
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User profile not found." });
    }

    res.json({ message: "Profile updated successfully! Awaiting admin approval.", kycData: updatedUser });
  } catch (err) {
    console.error("❌ Profile Update Error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

module.exports = router;