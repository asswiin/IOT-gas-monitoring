import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/userDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/gasbook")
  };

  // ✅ Navigate to gasbook page
  const handleBookGas = () => {navigate("/newconnection") };

  // ✅ Navigate to gasbook page
  const handleGasLevelClick = () => {
    navigate("/gasbook");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Gas Monitor</h1>

        {/* ✅ Navigation buttons */}
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate("/gasbook")}>Dashboard</button>
          <button className="nav-btn" onClick={() => navigate("/gasbook")}>History</button>
          <button className="nav-btn" onClick={() => navigate("/gasbook")}>Payment</button>
          <button className="nav-btn" onClick={() => navigate("/gasbook")}>Feedback</button>

          <button className="profile-button" onClick={handleProfileClick}>
            <img src="/profileicon.jpg" alt="Profile" />
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <h2>Dashboard</h2>
        <div className="stats-container">

          {/* ✅ Current Gas Level button goes to GasBook */}
          <button className="stat-box gas-level-button" onClick={handleGasLevelClick}>
            <h3>Current Gas Level</h3>
          </button>

          <div className="stat-box">
            <h3>Estimated Refill Date</h3>
          </div>

          <div className="stat-box">
            <h3>Tube Expiry Date</h3>
          </div>
        </div>

        <div className="alerts-container">
          <h3>Alerts</h3>
          <div className="alert-box warning">
            <i className="warning-icon"></i>
            <p>Low Gas Warning</p>
          </div>
        </div>

        <div className="notifications-container">
          <h3>Notifications</h3>
          <div className="notification-box success">
            <i className="success-icon"></i>
            <p>Gas booked successfully</p>
          </div>
        </div>
      </main>

      {/* ✅ Book Gas Now Button also goes to GasBook */}
      <div className="book-gas-container">
        <button className="book-gas-button" onClick={handleBookGas}>
          Book Gas Now
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;
