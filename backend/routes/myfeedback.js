const express = require('express');
const router = express.Router();
const MyFeedback = require('../models/MyFeedback');

// POST a new feedback/complaint to your personal collection
router.post('/', async (req, res) => {
  try {
    const { email, type, message } = req.body;

    if (!email || !type || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    // Use the new MyFeedback model here
    const newFeedback = new MyFeedback({
      email,
      type,
      message,
    });

    await newFeedback.save();
    res.status(201).json({ message: 'Your personal message has been submitted successfully!' });
  } catch (err) {
    console.error('❌ My Feedback Submission Error:', err);
    res.status(500).json({ message: 'Server error while submitting your feedback.' });
  }
});

// GET all feedback for the admin from your personal collection
router.get('/', async (req, res) => {
  try {
    // Use the new MyFeedback model here
    const allMyFeedback = await MyFeedback.find({}).sort({ createdAt: -1 });
    res.json(allMyFeedback);
  } catch (err) {
    console.error('❌ Error fetching your personal feedback:', err);
    res.status(500).json({ message: 'Server error while fetching your feedback.' });
  }
});

router.get('/:email', async (req, res) => {
  try {
    const userEmail = req.params.email.toLowerCase();
    const feedbackHistory = await MyFeedback.find({ email: userEmail }).sort({ createdAt: -1 });
    
    // It's okay if it's an empty array, the frontend will handle it.
    res.json(feedbackHistory);

  } catch (err) {
    console.error(`❌ Error fetching feedback history for ${req.params.email}:`, err);
    res.status(500).json({ message: 'Server error while fetching feedback history.' });
  }
});

module.exports = router;