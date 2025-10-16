

const express = require('express');
const router = express.Router();
const AutoBooking = require('../models/AutoBooking');

// ✅ CORRECTED: GET only PENDING auto-bookings (for the main admin view)
router.get('/', async (req, res) => {
  try {
    // Corrected to find 'booking_pending' status to match the model and application logic
    const pendingBookings = await AutoBooking.find({ status: 'booking_pending' }).sort({ bookingDate: -1 });
    res.json(pendingBookings);
  } catch (err) {
    console.error("❌ Error fetching pending auto-bookings:", err);
    res.status(500).json({ message: "Server error while fetching pending auto-bookings." });
  }
});

// ✅ NEW: GET all CANCELLED auto-bookings
router.get('/cancelled', async (req, res) => {
  try {
    const cancelledBookings = await AutoBooking.find({ status: 'cancelled' }).sort({ updatedAt: -1 });
    res.json(cancelledBookings);
  } catch (err) {
    console.error("❌ Error fetching cancelled auto-bookings:", err);
    res.status(500).json({ message: "Server error while fetching cancelled auto-bookings." });
  }
});

// ✅ NEW: GET all auto-bookings (including paid, fulfilled, etc.)
router.get('/all', async (req, res) => {
  try {
    const allBookings = await AutoBooking.find({}).sort({ bookingDate: -1 });
    res.json(allBookings);
  } catch (err) {
    console.error("❌ Error fetching all auto-bookings:", err);
    res.status(500).json({ message: "Server error while fetching all auto-bookings." });
  }
});

router.get("/user/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;
    const userBookings = await AutoBooking.find({ email: userEmail }).sort({ createdAt: -1 });
    res.json(userBookings);
  } catch (err) {
    console.error(`❌ Error fetching bookings for user ${req.params.email}:`, err);
    res.status(500).json({ message: "Server error while fetching user booking data." });
  }
});

module.exports = router;


















