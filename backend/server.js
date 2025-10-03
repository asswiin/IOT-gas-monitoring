

// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// --- Route Imports ---
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const newconnectionRoute = require('./routes/newconnection');
const paymentRoute = require('./routes/payment');
const gasLevelRoute = require('./routes/gaslevel');
const autoBookingRoute = require('./routes/autobooking');
const simulationRoute = require('./routes/simulation');
const historyRoute = require('./routes/history');
const myFeedbackRoutes = require('./routes/myfeedback');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware Setup ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use('/api/login', loginRoute);
app.use('/api/register', registerRoute);
app.use('/api/newconnection', newconnectionRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/gaslevel', gasLevelRoute);
app.use('/api/autobooking', autoBookingRoute);
app.use('/api/simulation', simulationRoute);
app.use('/api/history', historyRoute);
app.use('/api/myfeedback', myFeedbackRoutes);

// --- Simple Health Check Route ---
app.get('/', (req, res) => res.send('API is running successfully!'));

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ ✅ ✅  Backend connected to MongoDB successfully!');
    app.listen(PORT, () => console.log(`🚀 🚀 🚀  Server is running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ ❌ ❌  MongoDB connection error:', err.message);
    process.exit(1);
  });