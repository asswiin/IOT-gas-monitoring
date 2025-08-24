// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../styles/userDashboard.css';

// const UserDashboard = () => {
//   const navigate = useNavigate();

//   const handleProfileClick = () => {
//     navigate("")
//   };

//   // ✅ Navigate to gasbook page
//   const handleBookGas = () => {navigate("") };

//   // ✅ Navigate to gasbook page
//   const handleGasLevelClick = () => {
//     navigate("");
//   };

//   return (
//     <div className="dashboard-container">
//       <header className="dashboard-header">
//         <h1>Gas Monitor</h1>

//         {/* ✅ Navigation buttons */}
//         <div className="nav-actions">
//           <button className="nav-btn" onClick={() => navigate("")}>Dashboard</button>
//           <button className="nav-btn" onClick={() => navigate("")}>History</button>
//           <button className="nav-btn" onClick={() => navigate("")}>Payment</button>
//           <button className="nav-btn" onClick={() => navigate("")}>Feedback</button>

//           <button className="profile-button" onClick={handleProfileClick}>
//             <img src="/profileicon.jpg" alt="Profile" />
//           </button>
//         </div>
//       </header>

//       <main className="dashboard-main">
//         <h2>Dashboard</h2>
//         <div className="stats-container">

//           {/* ✅ Current Gas Level button goes to GasBook */}
//           <button className="stat-box gas-level-button" onClick={handleGasLevelClick}>
//             <h3>Current Gas Level</h3>
//           </button>

//           <div className="stat-box">
//             <h3>Estimated Refill Date</h3>
//           </div>

//           <div className="stat-box">
//             <h3>Tube Expiry Date</h3>
//           </div>
//         </div>

//         <div className="alerts-container">
//           <h3>Alerts</h3>
//           <div className="alert-box warning">
//             <i className="warning-icon"></i>
//             <p>Low Gas Warning</p>
//           </div>
//         </div>

//         <div className="notifications-container">
//           <h3>Notifications</h3>
//           <div className="notification-box success">
//             <i className="success-icon"></i>
//             <p>Gas booked successfully</p>
//           </div>
//         </div>
//       </main>

//       {/* ✅ Book Gas Now Button also goes to GasBook */}
//       <div className="book-gas-container">
//         <button className="book-gas-button" onClick={handleBookGas}>
//           Book Gas Now
//         </button>
//       </div>
//     </div>
//   );
// };

// export default UserDashboard;



import React, { useState } from 'react'; // Import useState
import { useNavigate } from 'react-router-dom';
import '../styles/userDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown); // Toggle dropdown on/off
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
    navigate("/login");
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

    </div>
  );
};

export default UserDashboard;