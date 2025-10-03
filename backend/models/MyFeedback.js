const mongoose = require('mongoose');

const MyFeedbackSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Feedback', 'Complaint', 'Urgent'],
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('MyFeedback', MyFeedbackSchema, 'my_feedbacks');