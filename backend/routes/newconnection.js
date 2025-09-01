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

// ✅ NEW: GET all users/KYC records for admin 'Users' section
router.get("/", async (req, res) => { // This will now handle requests to /api/newconnection
  try {
    const allUsers = await KYC.find({}); // Fetch all KYC records
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
      const { status } = req.body;
      const userEmail = req.params.email;

      if (status === 'rejected') {
        const deletedKYC = await KYC.findOneAndDelete({ email: userEmail });
        if (!deletedKYC) {
          return res.status(404).json({ message: "KYC record not found for rejection." });
        }
        return res.json({ message: "KYC request rejected and data removed.", status: 'rejected' });
      } else {
        const updatedKYC = await KYC.findOneAndUpdate(
          { email: userEmail },
          { $set: { status: status } },
          { new: true }
        );
        if (!updatedKYC) {
          return res.status(404).json({ message: "KYC record not found for update." });
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
    // For general application updates, it's reasonable to send it back for review.
    // However, for an already approved user, this route generally shouldn't be called for minor edits.
    // The `EditProfile.js` component will now use the new `/profile` route.
    const updatedData = { ...req.body, status: 'pending_approval' }; // Keep this for application re-submission context

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

// ✅ NEW ROUTE: For logged-in users to update their profile *without* changing status
router.put("/:email/profile", async (req, res) => {
  try {
    const userEmail = req.params.email;
    // Destructure req.body to exclude 'status' or only include allowed fields
    const { status, ...updateFields } = req.body; // Prevent status from being updated through this route

    // Find the current user to get their existing status
    const existingUser = await KYC.findOne({ email: userEmail });
    if (!existingUser) {
      return res.status(404).json({ message: "User profile not found for update." });
    }

    // Only update allowed fields, and do NOT touch the status field.
    // You might want to explicitly list fields that can be updated for security.
    const updatedUser = await KYC.findOneAndUpdate(
      { email: userEmail },
      { $set: updateFields }, // Only set the fields from updateFields
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


module.exports = router;