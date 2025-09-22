

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const newconnectionRoute = require('./routes/newconnection');
const paymentRoute = require('./routes/payment');
const gasLevelRoute = require('./routes/gaslevel');
const autoBookingRoute = require('./routes/autobooking');

const app = express();
const PORT = process.env.PORT || 5000; // Main backend continues on port 5000

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/login', loginRoute);
app.use('/api/register', registerRoute);
app.use('/api/newconnection', newconnectionRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/gaslevel', gasLevelRoute);
app.use('/api/autobooking', autoBookingRoute);


// Simple health check
app.get('/', (req, res) => res.send('API running'));

// MongoDB URI from .env
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Main Backend connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Main Server started on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Main Backend MongoDB connection error:', err.message);
  });