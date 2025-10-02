
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');

// // --- Route Imports ---
// const loginRoute = require('./routes/login');
// const registerRoute = require('./routes/register');
// const newconnectionRoute = require('./routes/newconnection');
// const paymentRoute = require('./routes/payment');
// const gasLevelRoute = require('./routes/gaslevel');
// const autoBookingRoute = require('./routes/autobooking');
// const simulationRoute = require('./routes/simulation');
// const historyRoute = require('./routes/history');
// const simulationStates = require('./simulationState'); // Manages running state
// const GasLevel = require('./models/Gaslevel');         // Direct DB access for gas level
// const GasDataHistory = require('./models/GasDataHistory'); // To log history

// const app = express();
// const PORT = process.env.PORT || 5000;

// // --- Middleware Setup ---
// app.use(cors());
// app.use(express.json());

// // --- API Routes ---
// app.use('/api/login', loginRoute);
// app.use('/api/register', registerRoute);
// app.use('/api/newconnection', newconnectionRoute);
// app.use('/api/payment', paymentRoute);
// app.use('/api/gaslevel', gasLevelRoute);
// app.use('/api/autobooking', autoBookingRoute);
// app.use('/api/simulation', simulationRoute);
// app.use('/api/history', historyRoute);

// // =================================================================
// //  BACKEND-DRIVEN GAS SIMULATION ENGINE
// //  This loop runs on the server to decrease the gas level for any
// //  user whose simulation has been started via the web dashboard.
// // =================================================================

// const SIMULATION_INTERVAL_MS = 3000;  // Run the simulation logic every 3 seconds
// const GAS_DECREASE_AMOUNT = 0.5;      // The amount of gas to decrease in each interval
// const HISTORY_LOG_INTERVAL_MS = 60000; // Log to history every 60 seconds
// let timeSinceLastHistoryLog = {};     // Tracks time for each user separately

// setInterval(async () => {
//   // Find all users who have an active simulation running
//   const activeSimulations = Object.keys(simulationStates).filter(
//     email => simulationStates[email] && simulationStates[email].isRunning
//   );

//   // If there are no active simulations, do nothing until the next interval
//   if (activeSimulations.length === 0) {
//     return;
//   }

//   console.log(`[Simulation Engine] Running for users: ${activeSimulations.join(', ')}`);

//   // Process each active simulation
//   for (const email of activeSimulations) {
//     try {
//       // Find the user's current gas level document and decrease the level,
//       // but only if the current level is greater than 0.
//       const updatedGasDoc = await GasLevel.findOneAndUpdate(
//         { email: email, currentLevel: { $gt: 0 } },
//         { $inc: { currentLevel: -GAS_DECREASE_AMOUNT } },
//         { new: true } // Return the updated document
//       );

//       // If the gas level was updated and is now 0 or less, clamp it to 0.
//       if (updatedGasDoc && updatedGasDoc.currentLevel < 0) {
//         updatedGasDoc.currentLevel = 0;
//         await updatedGasDoc.save();
//       }

//       // --- History Logging Logic ---
//       if (updatedGasDoc) {
//         const now = Date.now();
//         // Initialize the timer for the user if it's their first run
//         if (!timeSinceLastHistoryLog[email]) {
//           timeSinceLastHistoryLog[email] = now;
//         }

//         // Check if enough time has passed to log to history
//         if (now - timeSinceLastHistoryLog[email] >= HISTORY_LOG_INTERVAL_MS) {
//           const historyEntry = new GasDataHistory({
//             email: email,
//             gasLevel: updatedGasDoc.currentLevel
//           });
//           await historyEntry.save();
//           console.log(`[Simulation Engine] Logged history for ${email}.`);
//           timeSinceLastHistoryLog[email] = now; // Reset the timer for this user
//         }
//       }

//     } catch (error) {
//       console.error(`[Simulation Engine] Error updating gas level for ${email}:`, error);
//     }
//   }
// }, SIMULATION_INTERVAL_MS);


// // --- Simple Health Check Route ---
// app.get('/', (req, res) => res.send('API is running successfully!'));

// // --- MongoDB Connection ---
// const MONGO_URI = process.env.MONGO_URI;

// mongoose.connect(MONGO_URI)
//   .then(() => {
//     console.log('✅ ✅ ✅  Backend connected to MongoDB successfully!');
//     app.listen(PORT, () => console.log(`🚀 🚀 🚀  Server is running on port ${PORT}`));
//   })
//   .catch(err => {
//     console.error('❌ ❌ ❌  MongoDB connection error:', err.message);
//     process.exit(1); // Exit the process with an error code if DB connection fails
//   });






























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