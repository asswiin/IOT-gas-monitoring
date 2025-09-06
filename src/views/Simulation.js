import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/simulation.css'; // You'll create this CSS file

const SimulationControl = () => {
  const [simulationStatus, setSimulationStatus] = useState('unknown');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const SIMULATION_API_BASE_URL = 'http://localhost:5000/api/simulation'; // Ensure this matches your backend route

  useEffect(() => {
    fetchSimulationStatus();
  }, []);

  const fetchSimulationStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${SIMULATION_API_BASE_URL}/status`);
      setSimulationStatus(response.data.status);
      setMessage(`Simulation is currently: ${response.data.status}`);
    } catch (error) {
      console.error('Error fetching simulation status:', error);
      setMessage('Error fetching simulation status.');
      setSimulationStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSimulation = async () => {
    try {
      const response = await axios.post(`${SIMULATION_API_BASE_URL}/start`);
      setMessage(response.data.message);
      setSimulationStatus('active');
    } catch (error) {
      console.error('Error starting simulation:', error);
      setMessage(error.response?.data?.message || 'Error starting simulation.');
    }
  };

  const handleStopSimulation = async () => {
    try {
      const response = await axios.post(`${SIMULATION_API_BASE_URL}/stop`);
      setMessage(response.data.message);
      setSimulationStatus('inactive');
    } catch (error) {
      console.error('Error stopping simulation:', error);
      setMessage(error.response?.data?.message || 'Error stopping simulation.');
    }
  };

  return (
    <div className="simulation-control-container">
      <h1>Simulation Control Panel</h1>
      {loading ? (
        <p>Loading simulation status...</p>
      ) : (
        <>
          <p className={`status-display ${simulationStatus}`}>
            Status: <strong>{simulationStatus.toUpperCase()}</strong>
          </p>
          <div className="simulation-actions">
            <button
              onClick={handleStartSimulation}
              disabled={simulationStatus === 'active'}
              className="start-btn"
            >
              Start Simulation
            </button>
            <button
              onClick={handleStopSimulation}
              disabled={simulationStatus === 'inactive'}
              className="stop-btn"
            >
              Stop Simulation
            </button>
          </div>
          {message && <p className="simulation-message">{message}</p>}
        </>
      )}
    </div>
  );
};

export default SimulationControl;