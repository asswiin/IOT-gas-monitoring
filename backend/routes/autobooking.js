const express = require('express');
const router = express.Router();
const AutoBooking = require('../models/AutoBooking');

// ✅ MODIFIED: GET only PENDING auto-bookings (for the main admin view)
router.get('/', async (req, res) => {
  try {
    // We define 'pending' bookings as those with the status 'booked'
    const pendingBookings = await AutoBooking.find({ status: 'booked' }).sort({ bookingDate: -1 });
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

// ✅ NEW: GET all auto-bookings (both booked and cancelled)
router.get('/all', async (req, res) => {
  try {
    const allBookings = await AutoBooking.find({}).sort({ bookingDate: -1 });
    res.json(allBookings);
  } catch (err) {
    console.error("❌ Error fetching all auto-bookings:", err);
    res.status(500).json({ message: "Server error while fetching all auto-bookings." });
  }
});

module.exports = router;













