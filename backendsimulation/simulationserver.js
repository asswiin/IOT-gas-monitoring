// require('dotenv').config(); // Load .env variables for this script
// const mongoose = require('mongoose');
// const KYC = require('./models/Newconnection'); // Import the copied KYC model
// const GasLevel = require('./models/Gaslevel'); // Import the copied GasLevel model
// const axios = require('axios'); // For sending notifications (optional)

// const MONGO_URI = process.env.MONGO_URI; // Use the URI from .env

// // --- Configuration for Simulation ---
// const GAS_CONSUMPTION_RATE_PER_SECOND = 0.005; // Adjust this value (e.g., 0.005% per second)
// const LEAKAGE_CHANCE = 0.005; // 0.5% chance to start a leak per interval
// const LEAK_FIX_CHANCE = 0.02; // 2% chance to stop a leak per interval if one is active
// const AUTO_BOOKING_THRESHOLD = 10; // If currentLevel drops below this, trigger auto-booking
// const SIMULATION_INTERVAL_MS = 1000; // Update gas levels every 1 second

// let simulationActive = false;
// let simulationInterval;

// // Function to send SMS/Email (Placeholder)
// const sendNotification = async (phoneNumber, email, message) => {
//   console.log(`--- SENDING NOTIFICATION ---`);
//   console.log(`To Phone: ${phoneNumber}, Email: ${email}`);
//   console.log(`Message: ${message}`);
//   // In a real application, you'd integrate with an SMS/Email API here (e.g., Twilio, SendGrid)
//   // For now, this is just a console log.
//   // Example with Twilio (pseudocode):
//   /*
//   try {
//     await axios.post('https://api.twilio.com/2010-04-01/Accounts/ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/Messages.json',
//       `To=${phoneNumber}&From=+15017122661&Body=${encodeURIComponent(message)}`,
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Authorization': 'Basic ' + Buffer.from(`ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:your_auth_token`).toString('base64')
//         }
//       }
//     );
//     console.log("SMS notification sent successfully via Twilio.");
//   } catch (apiError) {
//     console.error("Failed to send SMS notification via Twilio:", apiError.response ? apiError.response.data : apiError.message);
//   }
//   */
//   console.log(`--- NOTIFICATION SENT ---`);
// };

// // Main simulation function
// const runSimulation = async () => {
//   // console.log("Running simulation step...");
//   try {
//     // Find all 'active' users from the KYC collection
//     const activeUsers = await KYC.find({ status: 'active' });

//     for (const user of activeUsers) {
//       let gasLevelEntry = await GasLevel.findOne({ userId: user._id });

//       if (!gasLevelEntry) {
//         // If no gas level entry exists, create one for the active user
//         gasLevelEntry = new GasLevel({
//           userId: user._id,
//           email: user.email,
//           currentLevel: 100, // Start full
//           isLeaking: false,
//         });
//         await gasLevelEntry.save();
//         console.log(`Initialized gas level for new active user: ${user.email}`);
//       }

//       let { currentLevel, isLeaking } = gasLevelEntry;

//       // --- Simulate Gas Consumption ---
//       // If leaking, consume gas much faster
//       const consumptionRate = GAS_CONSUMPTION_RATE_PER_SECOND * (isLeaking ? 10 : 1);
//       currentLevel -= consumptionRate;

//       // --- Simulate Leakage Start/Stop ---
//       if (currentLevel > 0) { // Can't leak if no gas left
//         if (Math.random() < LEAKAGE_CHANCE && !isLeaking) {
//           isLeaking = true;
//           console.warn(`🚨 ${user.email}: Leakage STARTED! Current Level: ${currentLevel.toFixed(2)}%`);
//           sendNotification(user.mobileNumber, user.email, `URGENT: Gas leakage detected at your connection! Level: ${currentLevel.toFixed(2)}%. Please check immediately.`);
//         } else if (isLeaking && Math.random() < LEAK_FIX_CHANCE) {
//           isLeaking = false;
//           console.log(`✅ ${user.email}: Leakage STOPPED.`);
//           sendNotification(user.mobileNumber, user.email, `Gas leakage at your connection has stopped. Always ensure safety.`);
//         }
//       } else {
//         isLeaking = false; // Cannot be leaking if gas is empty
//       }


//       // Ensure level doesn't go below 0 or above 100
//       if (currentLevel < 0) currentLevel = 0;
//       if (currentLevel > 100) currentLevel = 100; // In case of refill logic

//       // --- Check for Auto-Booking ---
//       if (currentLevel <= AUTO_BOOKING_THRESHOLD && user.status === 'active' && !isLeaking) {
//         // Only auto-book if not currently leaking, to avoid booking during an emergency
//         console.log(`⛽ ${user.email}: Gas low (${currentLevel.toFixed(2)}%)! Auto-booking new cylinder...`);
//         sendNotification(user.mobileNumber, user.email, `Your gas level is low (${currentLevel.toFixed(2)}%). A new cylinder has been automatically booked and is on its way.`);
        
//         // Simulate a new cylinder arriving by resetting gas level after a delay (or immediately for this simulation)
//         setTimeout(async () => {
//           gasLevelEntry.currentLevel = 100;
//           gasLevelEntry.isLeaking = false; // Assume new cylinder is not leaking
//           gasLevelEntry.lastUpdated = new Date();
//           await gasLevelEntry.save();
//           console.log(`🎉 ${user.email}: Gas cylinder refilled to 100%!`);
//           sendNotification(user.mobileNumber, user.email, `Your gas cylinder has been refilled to 100%!`);
//         }, 5000); // Simulate 5 seconds for delivery
        
//         // For immediate simulation reset:
//         // currentLevel = 100;
//         // isLeaking = false; 
//       }

//       // --- Update GasLevel in DB ---
//       gasLevelEntry.currentLevel = currentLevel;
//       gasLevelEntry.isLeaking = isLeaking;
//       gasLevelEntry.lastUpdated = new Date();
//       await gasLevelEntry.save();
//       // console.log(`Updated ${user.email}: Level ${currentLevel.toFixed(2)}%, Leaking: ${isLeaking}`);
//     }
//   } catch (err) {
//     console.error("Error in simulation step:", err);
//   }
// };

// // --- Control functions for simulation ---
// const startSimulation = async () => {
//   if (simulationActive) {
//     console.log("Simulation is already active.");
//     return;
//   }
//   console.log("Starting Gas Level Simulation...");
//   simulationActive = true;
//   simulationInterval = setInterval(runSimulation, SIMULATION_INTERVAL_MS);
// };

// const stopSimulation = () => {
//   if (!simulationActive) {
//     console.log("Simulation is not active.");
//     return;
//   }
//   console.log("Stopping Gas Level Simulation...");
//   clearInterval(simulationInterval);
//   simulationActive = false;
// };

// // --- Initialize and connect to DB ---
// mongoose.connect(MONGO_URI)
//   .then(() => {
//     console.log('✅ Simulation connected to MongoDB');
//     // Start simulation automatically when this script runs
//     startSimulation();
//   })
//   .catch(err => {
//     console.error('❌ Simulation MongoDB connection error:', err.message);
//     process.exit(1); // Exit if DB connection fails
//   });

// // Handle graceful shutdown
// process.on('SIGINT', () => {
//   console.log('Shutting down simulation...');
//   stopSimulation();
//   mongoose.disconnect(() => {
//     console.log('MongoDB disconnected.');
//     process.exit(0);
//   });
// });








require('dotenv').config();
const mongoose = require('mongoose');
const KYC = require('./models/Newconnection');
const GasLevel = require('./models/Gaslevel');
const axios = require('axios');

const MONGO_URI = process.env.MONGO_URI;

const GAS_CONSUMPTION_RATE_PER_SECOND = 0.005;
const LEAKAGE_CHANCE = 0.005;
const LEAK_FIX_CHANCE = 0.02;
const AUTO_BOOKING_THRESHOLD = 48;
const SIMULATION_INTERVAL_MS = 1000;

let simulationActive = false;
let simulationInterval;

const sendNotification = async (phoneNumber, email, message) => {
  console.log(`--- SENDING NOTIFICATION ---`);
  console.log(`To Phone: ${phoneNumber}, Email: ${email}`);
  console.log(`Message: ${message}`);
  // In a real application, integrate with an SMS/Email API here.
  console.log(`--- NOTIFICATION SENT ---`);
};

const runSimulation = async () => {
  try {
    const activeUsers = await KYC.find({ status: 'active' });

    for (const user of activeUsers) {
      let gasLevelEntry = await GasLevel.findOne({ userId: user._id });

      if (!gasLevelEntry) {
        gasLevelEntry = new GasLevel({
          userId: user._id,
          email: user.email,
          currentLevel: 100,
          isLeaking: false,
        });
        await gasLevelEntry.save();
        console.log(`Initialized gas level for new active user: ${user.email}`);
      }

      let { currentLevel, isLeaking } = gasLevelEntry;

      const consumptionRate = GAS_CONSUMPTION_RATE_PER_SECOND * (isLeaking ? 10 : 1);
      currentLevel -= consumptionRate;

      if (currentLevel > 0) {
        if (Math.random() < LEAKAGE_CHANCE && !isLeaking) {
          isLeaking = true;
          console.warn(`🚨 ${user.email}: Leakage STARTED! Current Level: ${currentLevel.toFixed(2)}%`);
          sendNotification(user.mobileNumber, user.email, `URGENT: Gas leakage detected at your connection! Level: ${currentLevel.toFixed(2)}%. Please check immediately.`);
        } else if (isLeaking && Math.random() < LEAK_FIX_CHANCE) {
          isLeaking = false;
          console.log(`✅ ${user.email}: Leakage STOPPED.`);
          sendNotification(user.mobileNumber, user.email, `Gas leakage at your connection has stopped. Always ensure safety.`);
        }
      } else {
        isLeaking = false;
      }

      if (currentLevel < 0) currentLevel = 0;
      if (currentLevel > 100) currentLevel = 100;

      // --- Check for Auto-Booking (and new RefillStatus) ---
      // We need a way to track if a booking is pending or if a refill is in progress
      // For now, let's assume immediate refill for simulation simplicity.
      // In a real system, you'd add a `refillStatus: 'booked', 'delivered', 'pending_payment'` to GasLevel.
      if (currentLevel <= AUTO_BOOKING_THRESHOLD && user.status === 'active' && !isLeaking && currentLevel > 0) {
        // Prevent booking if gas is already 0, or if a leak is ongoing
        console.log(`⛽ ${user.email}: Gas low (${currentLevel.toFixed(2)}%)! Auto-booking new cylinder...`);
        sendNotification(user.mobileNumber, user.email, `Your gas level is low (${currentLevel.toFixed(2)}%). A new cylinder has been automatically booked and is on its way.`);

        // Simulate a new cylinder arriving by resetting gas level
        // For the simulation, we'll reset it to 100% instantly for simplicity.
        // In a real app, this would be triggered by a "delivery completed" event.
        gasLevelEntry.currentLevel = 100;
        gasLevelEntry.isLeaking = false;
        gasLevelEntry.lastUpdated = new Date();
        console.log(`🎉 ${user.email}: Gas cylinder refilled to 100%!`);
        sendNotification(user.mobileNumber, user.email, `Your gas cylinder has been refilled to 100%!`);
      }


      gasLevelEntry.currentLevel = currentLevel;
      gasLevelEntry.isLeaking = isLeaking;
      gasLevelEntry.lastUpdated = new Date();
      await gasLevelEntry.save();
    }
  } catch (err) {
    console.error("Error in simulation step:", err);
  }
};

const startSimulation = () => {
  if (simulationActive) {
    console.log("Simulation is already active.");
    return;
  }
  console.log("Starting Gas Level Simulation...");
  simulationActive = true;
  simulationInterval = setInterval(runSimulation, SIMULATION_INTERVAL_MS);
};

const stopSimulation = () => {
  if (!simulationActive) {
    console.log("Simulation is not active.");
    return;
  }
  console.log("Stopping Gas Level Simulation...");
  clearInterval(simulationInterval);
  simulationActive = false;
};

const isSimulationActive = () => simulationActive;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Simulation connected to MongoDB');
    // We will no longer auto-start here. It will be controlled by the API.
    // startSimulation();
  })
  .catch(err => {
    console.error('❌ Simulation MongoDB connection error:', err.message);
    process.exit(1);
  });

process.on('SIGINT', () => {
  console.log('Shutting down simulation...');
  stopSimulation();
  mongoose.disconnect(() => {
    console.log('MongoDB disconnected.');
    process.exit(0);
  });
});

// Export the functions and status for the API route
module.exports = {
  startSimulation,
  stopSimulation,
  isSimulationActive
};