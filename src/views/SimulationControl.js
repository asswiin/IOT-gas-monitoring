import React, { useState } from 'react';
import axios from 'axios';
import '../styles/simulationControl.css';

const SimulationControl = () => {
    const [message, setMessage] = useState('');
    const [targetEmail, setTargetEmail] = useState(''); 

    const handleStart = async () => {
        if (!targetEmail) {
            setMessage('Please enter a user email to start the simulation.');
            return;
        }
        try {
            // FIX: Reverted to the hardcoded URL to resolve the 'undefined' error.
            const res = await axios.post('http://localhost:5000/api/simulation/start', { email: targetEmail });
            setMessage(res.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to start simulation.');
        }
    };

    const handleStop = async () => {
        if (!targetEmail) {
            setMessage('Please enter a user email to stop the simulation.');
            return;
        }
        try {
            // FIX: Reverted to the hardcoded URL to resolve the 'undefined' error.
            const res = await axios.post('http://localhost:5000/api/simulation/stop', { email: targetEmail });
            setMessage(res.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to stop simulation.');
        }
    };

    return (
        <div className="simulation-container">
            <div className="simulation-card">
                <h2>Wokwi Device Control</h2>
                
                <div className="form-group">
                    <label htmlFor="targetEmail">User Email to Control:</label>
                    <input
                        type="email"
                        id="targetEmail"
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value.toLowerCase())}
                        placeholder="e.g., user@example.com"
                        required
                    />
                </div>

                <p className="instructions">
                    Enter a registered user's email, then use the buttons to send 'Start' and 'Stop' commands to their Wokwi simulation.
                </p>
                <div className="button-group">
                    <button onClick={handleStart} className="start-btn">Start Simulation on Device</button>
                    <button onClick={handleStop} className="stop-btn">Stop Simulation on Device</button>
                </div>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default SimulationControl;