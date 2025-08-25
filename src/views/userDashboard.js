import React, { useState } from 'react'; // Import useState
import { useNavigate } from 'react-router-dom';
import '../styles/userDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [showDropdown] = useState(false); // State to control dropdown visibility

  const handleProfileClick = () => {
    navigate('/profile'); // Toggle dropdown on/off
  };

  const handleEditProfile = () => {
    navigate("/editprofile"); // Navigate to the new edit page
  };

  const handleSignOut = () => {
    // Clear all user-related data from storage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    // Navigate to the login page
    navigate("/login",{replcae:true});
  };

  // Other navigation handlers

  const handleGasLevelClick = () => { navigate("/gas-level"); };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Gas Monitor</h1>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate("")}>Dashboard</button>
          <button className="nav-btn" onClick={() => navigate("")}>History</button>
          <button className="nav-btn" onClick={() => navigate("")}>Payment</button>
          <button className="nav-btn" onClick={() => navigate("")}>Feedback</button>


          {/* --- PROFILE BUTTON AND DROPDOWN --- */}
          <div className="profile-section">
            <button className="profile-button" onClick={handleProfileClick}>
              <img src="/profileicon.jpg" alt="Profile" />
            </button>

            {/* Conditionally render the dropdown */}
            {showDropdown && (
              <div className="profile-dropdown">
                <button className="dropdown-item" onClick={handleEditProfile}>
                  Edit Profile
                </button>
                <button className="dropdown-item" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ... (rest of your dashboard main content) ... */}
      <main className="dashboard-main">
  <h2>Dashboard</h2>

  {/* Stats Section */}
  <div className="stats-container">
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

  {/* Alerts Section */}
  <div className="alerts-container">
    <h3>Alerts</h3>
    <div className="alert-box warning">
      <i className="warning-icon">⚠️</i>
      <p></p>
    </div>
    <div className="alert-box danger">
      <i className="danger-icon">🔥</i>
      <p></p>
    </div>
  </div>

  {/* Notifications Section */}
  <div className="notifications-container">
    <h3>Notifications</h3>
    <div className="notification-box success">
      <i className="success-icon">✅</i>
      <p></p>
    </div>
    <div className="notification-box info">
      <i className="info-icon">ℹ️</i>
      <p></p>
    </div>
  </div>
</main>


    </div>
  );
};

export default UserDashboard;