import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/history.css';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const userEmail = localStorage.getItem("userEmail");
    const navigate = useNavigate();

    // Prevent navigation flicker
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            document.body.style.overflow = 'auto';
        }, 500);
    }, []);

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getConsumptionStatus = (consumption) => {
        if (consumption <= 5) return { text: 'Low', class: 'low' };
        if (consumption <= 20) return { text: 'Medium', class: 'medium' };
        return { text: 'High', class: 'high' };
    };

    const calculateStats = () => {
        if (history.length === 0) return null;
        
        const totalConsumption = history.reduce((sum, entry) => sum + entry.gasConsumed, 0);
        const avgConsumption = totalConsumption / history.length;
        const maxConsumption = Math.max(...history.map(entry => entry.gasConsumed));
        const minConsumption = Math.min(...history.map(entry => entry.gasConsumed));
        
        return {
            total: totalConsumption,
            average: avgConsumption,
            max: maxConsumption,
            min: minConsumption,
            days: history.length
        };
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <div className="history-container">
                <header className="dashboard-header no-print">
                    <h1>⛽ Gas Monitor</h1>
                    <div className="nav-actions">
                        <button className="nav-btn" onClick={() => navigate("/userdashboard")}>Dashboard</button>
                        <button className="nav-btn" onClick={() => navigate("/history")}>History</button>
                        <button className="nav-btn" onClick={() => navigate("/report")}>Report</button>
                        <button className="nav-btn" onClick={() => navigate("/feedback")}>Feedback</button>
                    </div>
                </header>
                <main className="dashboard-main">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading your gas consumption history...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="history-container">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <p className="error-message">{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="history-container">
            <header className="dashboard-header no-print">
                <h1>⛽ Gas Monitor</h1>
                <div className="nav-actions">
                    <button className="nav-btn" onClick={() => navigate("/userdashboard")}>Dashboard</button>
                    <button className="nav-btn" onClick={() => navigate("/history")}>History</button>
                    <button className="nav-btn" onClick={() => navigate("/report")}>Report</button>
                    <button className="nav-btn" onClick={() => navigate("/feedback")}>Feedback</button>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="history-header">
                    <div className="header-content">
                        <h1>📊 Gas Usage History</h1>
                        <p className="header-subtitle">Track your daily gas consumption patterns</p>
                    </div>
                </div>

                {history.length === 0 ? (
                    <div className="no-data-container">
                        <div className="no-data-icon">📈</div>
                        <h3>No History Available</h3>
                        <p>Start using gas to see your consumption patterns here.</p>
                    </div>
                ) : (
                    <div className="history-content">
                        {/* Statistics Cards */}
                        {stats && (
                            <div className="stats-grid">
                                <div className="stat-card total">
                                    <div className="stat-icon">📊</div>
                                    <div className="stat-content">
                                        <h3>{stats.total.toFixed(1)}%</h3>
                                        <p>Total Gas Used</p>
                                    </div>
                                </div>
                                <div className="stat-card average">
                                    <div className="stat-icon">📈</div>
                                    <div className="stat-content">
                                        <h3>{stats.average.toFixed(1)}%</h3>
                                        <p>Average Daily Use</p>
                                    </div>
                                </div>
                                <div className="stat-card max">
                                    <div className="stat-icon">🔥</div>
                                    <div className="stat-content">
                                        <h3>{stats.max.toFixed(1)}%</h3>
                                        <p>Highest Daily Use</p>
                                    </div>
                                </div>
                                <div className="stat-card days">
                                    <div className="stat-icon">📅</div>
                                    <div className="stat-content">
                                        <h3>{stats.days}</h3>
                                        <p>Days Tracked</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* History Table */}
                        <div className="table-container">
                            <div className="table-header">
                                <h2>Daily Consumption Details</h2>
                                <p>Daily gas usage percentage - Last {history.length} days</p>
                            </div>
                            
                            <div className="table-wrapper">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Gas Used</th>
                                            <th>Usage Bar</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((entry, index) => {
                                            const status = getConsumptionStatus(entry.gasConsumed);
                                            const gasUsed = entry.gasConsumed;
                                            return (
                                                <tr key={entry.date || index} className="table-row">
                                                    <td className="date-cell">
                                                        <div className="date-info">
                                                            <span className="date-main">{formatDate(entry.date)}</span>
                                                            {index === 0 && <span className="date-badge">Latest</span>}
                                                        </div>
                                                    </td>
                                                    <td className="gas-used-cell">
                                                        <div className="gas-used-text">
                                                            <strong>{gasUsed < 0.01 ? '< 0.01' : gasUsed.toFixed(2)}%</strong>
                                                        </div>
                                                    </td>
                                                    <td className="consumption-cell">
                                                        <div className="consumption-bar-container">
                                                            <div 
                                                                className={`consumption-bar ${status.class}`}
                                                                style={{ width: `${Math.min(gasUsed * 5, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                    <td className="status-cell">
                                                        <div className="level-indicator">
                                                            <div className={`level-dot ${status.class}`}></div>
                                                            <span className={`status-badge ${status.class}`}>
                                                                {status.text}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default History;