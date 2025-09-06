// backend/routes/simulation.js
const express = require('express');
const router = express.Router();
// CORRECTED PATH for routes/simulation.js:
// From backend/routes, go up two levels (to miniproject), then into backendsimulation
const simulationModule = require('../../backendsimulation/simulationserver');

router.post('/start', (req, res) => {
  if (simulationModule.isSimulationActive()) {
    return res.status(400).json({ message: "Simulation is already active." });
  }
  simulationModule.startSimulation();
  res.json({ message: "Simulation started successfully!", status: "active" });
});

router.post('/stop', (req, res) => {
  if (!simulationModule.isSimulationActive()) {
    return res.status(400).json({ message: "Simulation is already inactive." });
  }
  simulationModule.stopSimulation();
  res.json({ message: "Simulation stopped successfully!", status: "inactive" });
});

router.get('/status', (req, res) => {
  res.json({ status: simulationModule.isSimulationActive() ? "active" : "inactive" });
});

module.exports = router;