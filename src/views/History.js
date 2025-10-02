import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/history.css'; // Create this CSS file next

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const userEmail = localStorage.getItem("userEmail");
    const navigate = useNavigate();

    useEffect(() => {
        if (!userEmail) {
            navigate('/login');
            return;
        }

        const fetchHistory = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/history/${userEmail}`);
                setHistory(response.data);
            } catch (err) {
                setError('Failed to load history data. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [userEmail, navigate]);

    if (loading) {
        return <div className="history-container"><p>Loading history...</p></div>;
    }

    if (error) {
        return <div className="history-container"><p className="error-message">{error}</p></div>;
    }

    return (
        <div className="history-container">
            <header className="history-header">
                <h1>Gas Level History</h1>
                <button onClick={() => navigate('/userdashboard')} className="back-btn">
                    &larr; Back to Dashboard
                </button>
            </header>
            <main className="history-main">
                {history.length === 0 ? (
                    <p>No history data available. Start the simulation to generate data.</p>
                ) : (
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Gas Level (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((entry) => (
                                <tr key={entry._id}>
                                    <td>{new Date(entry.timestamp).toLocaleString()}</td>
                                    <td>{entry.gasLevel.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </main>
        </div>
    );
};

export default History;