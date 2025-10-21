
const express = require('express');
const router = express.Router();
const AutoBooking = require('../models/AutoBooking');

// GET only PENDING auto-bookings (for the main admin view)
router.get('/', async (req, res) => {
  try {
    // This correctly finds 'booking_pending' status for actionable requests
    const pendingBookings = await AutoBooking.find({ status: 'booking_pending' }).sort({ bookingDate: -1 });
    res.json(pendingBookings);
  } catch (err) {
    console.error("❌ Error fetching pending auto-bookings:", err);
    res.status(500).json({ message: "Server error while fetching pending auto-bookings." });
  }
});

// ✅ NEW: GET only PAID auto-bookings (awaiting delivery/fulfillment)
router.get('/paid', async (req, res) => {
  try {
    const paidBookings = await AutoBooking.find({ status: 'paid' }).sort({ updatedAt: -1 });
    res.json(paidBookings);
  } catch (err) {
    console.error("❌ Error fetching paid auto-bookings:", err);
    res.status(500).json({ message: "Server error while fetching paid auto-bookings." });
  }
});

// ✅ NEW: GET only FULFILLED auto-bookings (for history)
router.get('/fulfilled', async (req, res) => {
  try {
    const fulfilledBookings = await AutoBooking.find({ status: 'fulfilled' }).sort({ updatedAt: -1 });
    res.json(fulfilledBookings);
  } catch (err) {
    console.error("❌ Error fetching fulfilled auto-bookings:", err);
    res.status(500).json({ message: "Server error while fetching fulfilled auto-bookings." });
  }
});

// GET all CANCELLED auto-bookings
router.get('/cancelled', async (req, res) => {
  try {
    const cancelledBookings = await AutoBooking.find({ status: 'cancelled' }).sort({ updatedAt: -1 });
    res.json(cancelledBookings);
  } catch (err) {
    console.error("❌ Error fetching cancelled auto-bookings:", err);
    res.status(500).json({ message: "Server error while fetching cancelled auto-bookings." });
  }
});

// GET all auto-bookings (for comprehensive reports or a combined view)
router.get('/all', async (req, res) => {
  try {
    const allBookings = await AutoBooking.find({}).sort({ bookingDate: -1 });
    res.json(allBookings);
  } catch (err) {
    console.error("❌ Error fetching all auto-bookings:", err);
    res.status(500).json({ message: "Server error while fetching all auto-bookings." });
  }
});

// GET all bookings for a specific user
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