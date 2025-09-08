// ADD THIS LINE AT THE VERY TOP
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const GasLevel = require('./models/Gaslevel');
const app = express();
const PORT = 5001;

// MongoDB Connection
// Use the environment variable for the connection string
const MONGO_URI = process.env.MONGO_URI;

// Add a check to ensure the MONGO_URI is loaded
if (!MONGO_URI) {
    console.error('❌ FATAL ERROR: MONGO_URI is not defined in the .env file.');
    process.exit(1); // Exit the application if the database connection string is missing
}

mongoose.connect(MONGO_URI, { // <-- CHANGE THIS LINE
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('🟢 MongoDB Connected to Atlas Cluster');
}).catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); 

// LPG Gas Monitoring Simulation Constants
const NORMAL_CONSUMPTION_RATE = 0.02;
const LEAKAGE_CHANCE = 0.003;
const LEAK_RATE = 0.15;
const LEAK_FIX_CHANCE = 0.01;
const SIMULATION_INTERVAL_MS = 1000;
const REFILL_LEVEL = 100;
const CRITICAL_LEVEL = 15;
const WARNING_LEVEL = 30;

const activeSimulations = new Map();

const runUserSimulation = async (userEmail) => {
  let gasLevelDoc = await GasLevel.findOne({ email: userEmail });
  
  if (!gasLevelDoc) {
    gasLevelDoc = new GasLevel({
      email: userEmail,
      userId: new mongoose.Types.ObjectId(),
      currentLevel: 100,
      isLeaking: false,
    });
  }

  if (gasLevelDoc.currentLevel > 0) {
    gasLevelDoc.currentLevel -= NORMAL_CONSUMPTION_RATE;
    
    if (Math.random() < LEAKAGE_CHANCE && !gasLevelDoc.isLeaking) {
      gasLevelDoc.isLeaking = true;
      console.warn(`🚨 LPG LEAK DETECTED for ${userEmail}! Current level: ${gasLevelDoc.currentLevel.toFixed(2)}%`);
    } else if (gasLevelDoc.isLeaking && Math.random() < LEAK_FIX_CHANCE) {
      gasLevelDoc.isLeaking = false;
      console.log(`✅ LPG leak repaired for ${userEmail}. Current level: ${gasLevelDoc.currentLevel.toFixed(2)}%`);
    }
    
    if (gasLevelDoc.isLeaking) {
      gasLevelDoc.currentLevel -= LEAK_RATE;
      console.warn(`💨 Active leak for ${userEmail}: -${LEAK_RATE}% per second. Level: ${gasLevelDoc.currentLevel.toFixed(2)}%`);
    }
    
    if (gasLevelDoc.currentLevel < 0) {
      gasLevelDoc.currentLevel = 0;
      gasLevelDoc.isLeaking = false; 
      console.log(`🪫 LPG tank empty for ${userEmail}. Simulation stopped.`);
    }
    
    if (gasLevelDoc.currentLevel <= CRITICAL_LEVEL && gasLevelDoc.currentLevel > 0) {
      console.warn(`🔴 CRITICAL LPG LEVEL for ${userEmail}: ${gasLevelDoc.currentLevel.toFixed(2)}%`);
    } else if (gasLevelDoc.currentLevel <= WARNING_LEVEL && gasLevelDoc.currentLevel > CRITICAL_LEVEL) {
      console.warn(`🟡 LOW LPG LEVEL for ${userEmail}: ${gasLevelDoc.currentLevel.toFixed(2)}%`);
    }
  }
  
  gasLevelDoc.lastUpdated = new Date();
  
  await GasLevel.findOneAndUpdate(
    { email: userEmail },
    { 
      currentLevel: gasLevelDoc.currentLevel,
      isLeaking: gasLevelDoc.isLeaking,
      lastUpdated: gasLevelDoc.lastUpdated,
      userId: gasLevelDoc.userId
    },
    { new: true, upsert: true }
  );
};

// =================================================================
//                   PER-USER CONTROL FUNCTIONS
// =================================================================
const startSimulationForUser = (userEmail) => {
  if (activeSimulations.has(userEmail)) {
    console.log(`Simulation for ${userEmail} is already active.`);
    return false;
  }
  console.log(`Starting Gas Level Simulation for user: ${userEmail}...`);
  const intervalId = setInterval(() => {
    try {
      runUserSimulation(userEmail);
    } catch (error) {
      console.error(`Error in simulation for ${userEmail}:`, error);
    }
  }, SIMULATION_INTERVAL_MS);
  activeSimulations.set(userEmail, intervalId);
  return true;
};

const stopSimulationForUser = (userEmail) => {
  if (!activeSimulations.has(userEmail)) {
    console.log(`Simulation for ${userEmail} is not active.`);
    return false;
  }
  console.log(`Stopping Gas Level Simulation for user: ${userEmail}...`);
  clearInterval(activeSimulations.get(userEmail));
  activeSimulations.delete(userEmail);
  return true;
};

const isSimulationActiveForUser = (userEmail) => activeSimulations.has(userEmail);

// =================================================================
//                         API ROUTES (Unchanged)
// =================================================================

// ... (The rest of your API routes remain the same)
// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to start the simulation for a specific user
app.post('/api/simulation/start', (req, res) => {
    const { userEmail } = req.body;
    if (!userEmail) {
        return res.status(400).json({ 
            message: "User email is required to start simulation.",
            status: "error"
        });
    }
    if (startSimulationForUser(userEmail)) {
      res.json({ 
        message: `Gas monitoring simulation started successfully for ${userEmail}!`, 
        status: "active",
        userEmail: userEmail,
        timestamp: new Date()
      });
    } else {
      res.json({ 
        message: `Simulation for ${userEmail} is already running.`,
        status: "already_active",
        userEmail: userEmail,
        timestamp: new Date()
      });
    }
});

// Route to stop the simulation for a specific user
app.post('/api/simulation/stop', (req, res) => {
    const { userEmail } = req.body;
    if (!userEmail) {
        return res.status(400).json({ 
            message: "User email is required to stop simulation.",
            status: "error"
        });
    }
    if (stopSimulationForUser(userEmail)) {
      res.json({ 
        message: `Gas monitoring simulation stopped successfully for ${userEmail}!`, 
        status: "inactive",
        userEmail: userEmail,
        timestamp: new Date()
      });
    } else {
      res.status(400).json({ 
        message: `Simulation for ${userEmail} is not currently active.`,
        status: "not_active",
        userEmail: userEmail
      });
    }
});

// Route to get the current running status of a user's simulation
app.get('/api/simulation/status/:userEmail', (req, res) => {
    const { userEmail } = req.params;
    if (!userEmail) {
        return res.status(400).json({ message: "User email is required to get simulation status." });
    }
    res.json({ status: isSimulationActiveForUser(userEmail) ? "active" : "inactive" });
});

// Route to get the current gas level data for a user
app.get('/api/simulation/gaslevel/:userEmail', async (req, res) => {
    const { userEmail } = req.params;
    if (!userEmail) {
        return res.status(400).json({ message: "User email is required to get gas level." });
    }

    try {
        const gasLevelData = await GasLevel.findOne({ email: userEmail });
        
        if (!gasLevelData) {
            return res.json({
                currentLevel: 100,
                isLeaking: false,
                lastUpdated: new Date(),
                status: "No simulation data available",
                criticalLevel: false,
                warningLevel: false,
                tankStatus: 'NORMAL'
            });
        }
        
        res.json({
            currentLevel: parseFloat(gasLevelData.currentLevel.toFixed(2)),
            isLeaking: gasLevelData.isLeaking,
            lastUpdated: gasLevelData.lastUpdated,
            criticalLevel: gasLevelData.currentLevel <= CRITICAL_LEVEL,
            warningLevel: gasLevelData.currentLevel <= WARNING_LEVEL,
            tankStatus: gasLevelData.currentLevel <= CRITICAL_LEVEL ? 'CRITICAL' : 
                       gasLevelData.currentLevel <= WARNING_LEVEL ? 'LOW' : 'NORMAL'
        });
    } catch (error) {
        console.error('Error fetching gas level:', error);
        res.status(500).json({ 
            message: "Failed to fetch gas level data",
            status: "error"
        });
    }
});

app.listen(PORT, () => {
  console.log(`🚀 LPG Gas Monitoring Server is running!`);
  console.log(`📡 API Server: http://localhost:${PORT}`);
  console.log(`🌐 Frontend URL: http://localhost:${PORT}`);
  console.log(`=====================================`);
});