

// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');

// const loginRoute = require('./routes/login');
// const registerRoute = require('./routes/register');
// const newconnectionRoute = require('./routes/newconnection')
// const paymentRoute = require('./routes/payment');
// const gasLevelRoute = require('./routes/gaslevel');


// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/login', loginRoute);
// app.use('/api/register', registerRoute);
// app.use('/api/newconnection',newconnectionRoute)
// app.use('/api/payment', paymentRoute);
// app.use('/api/gaslevel', gasLevelRoute);


// // Simple health check
// app.get('/', (req, res) => res.send('API running'));

// // MongoDB URI from .env
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mydatabase';

// // Connect to MongoDB
// mongoose.connect(MONGO_URI)
//   .then(() => {
//     console.log('✅ Connected to MongoDB');
//     app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
//   })
//   .catch(err => {
//     console.error('❌ MongoDB connection error:', err.message);
//   });




require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// --- Import all your existing routes ---
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const newconnectionRoute = require('./routes/newconnection');
const paymentRoute = require('./routes/payment');
const gasLevelRoute = require('./routes/gaslevel');

// --- Import the new simulation route and the simulation module itself ---
// CORRECTED PATH: Go up one level (from backend to miniproject), then into backendsimulation, then find simulationserver.js
const simulationModule = require('../backendsimulation/simulationserver');

// The simulation *route* provides the API endpoints to control the simulation module.
const simulationRoutes = require('./routes/simulation');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Existing Routes ---
app.use('/api/login', loginRoute);
app.use('/api/register', registerRoute);
app.use('/api/newconnection', newconnectionRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/gaslevel', gasLevelRoute);

// --- New Simulation Routes ---
// This route uses the 'simulationRoutes' to expose /api/simulation/start, /api/simulation/stop, /api/simulation/status
app.use('/api/simulation', simulationRoutes);

// Simple health check
app.get('/', (req, res) => res.send('API running'));

// MongoDB URI from .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mydatabase';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Main Backend connected to MongoDB');
    // It's important that simulationserver.js also handles its own MongoDB connection.
    // When `require('../backendsimulation/simulationserver')` runs, its internal
    // `mongoose.connect()` call will also execute, connecting it to the database.
    // This is fine for this architecture.

    app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });