
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Import axios for API calls
// import '../styles/userDashboard.css';

// const UserDashboard = () => {
//   const navigate = useNavigate();
//   const [gasLevel, setGasLevel] = useState(null);
//   const [loadingGas, setLoadingGas] = useState(true);
//   const [errorGas, setErrorGas] = useState(null);
//   const userEmail = localStorage.getItem("userEmail");

//   useEffect(() => {
//     if (!userEmail) {
//       setErrorGas("User not logged in.");
//       setLoadingGas(false);
//       return;
//     }

//     const fetchGasLevel = async () => {
//       try {
//         const response = await axios.get(`http://localhost:5000/api/gaslevel/${userEmail}`);
//         setGasLevel(response.data);
//         setErrorGas(null); // Clear any previous errors
//       } catch (err) {
//         console.error("Failed to fetch gas level:", err);
//         setErrorGas("Could not fetch gas level. Is the simulation running?");
//         setGasLevel(null); // Clear gas level if there's an error
//       } finally {
//         setLoadingGas(false);
//       }
//     };

//     fetchGasLevel(); // Initial fetch
//     const interval = setInterval(fetchGasLevel, 3000); // Poll every 3 seconds for real-time updates

//     return () => clearInterval(interval); // Cleanup interval on component unmount

//   }, [userEmail]); // Depend on userEmail to refetch if it changes

//   const handleProfileClick = () => {
//     navigate('/profile'); // Ensure direct navigation to profile page
//   };

//   const handleEditProfile = () => {
//     navigate("/editprofile");
//   };

//   const handleSignOut = () => {
//     localStorage.clear();
//     navigate("/login", { replace: true });
//   };

//   const getGasLevelColor = (level) => {
//     if (level === null || level === undefined) return 'gray';
//     if (level > 60) return 'green';
//     if (level > 20) return 'orange';
//     return 'red';
//   };

//   return (
//     <div className="dashboard-container">
//       <header className="dashboard-header">
//         <h1>Gas Monitor</h1>
//         <div className="nav-actions">
//           <button className="nav-btn" onClick={() => navigate("/userdashboard")}>Dashboard</button>
//           <button className="nav-btn" onClick={() => navigate("/history")}>History</button> {/* Assuming you'll create these routes */}
//           <button className="nav-btn" onClick={() => navigate("/payment-history")}>Payment</button>
//           <button className="nav-btn" onClick={() => navigate("/feedback")}>Feedback</button>

//           <div className="profile-section">
//             <button 
//               className="profile-button" 
//               onClick={handleProfileClick}
//               title="View Profile"
//             >
//               <img src="/profileicon.jpg" alt="Profile" />
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="dashboard-main">
//         <h2>Dashboard</h2>

//         {/* Stats Section */}
//         <div className="stats-container">
//           <div className="stat-box gas-level-box">
//             <h3>Current Gas Level</h3>
//             {loadingGas ? (
//               <p>Loading...</p>
//             ) : errorGas ? (
//               <p className="error-message">{errorGas}</p>
//             ) : gasLevel ? (
//               <>
//                 <div className="gas-indicator">
//                   <span
//                     className="gas-level-percentage"
//                     style={{ color: getGasLevelColor(gasLevel.currentLevel) }}
//                   >
//                     {gasLevel.currentLevel.toFixed(2)}%
//                   </span>
//                   <div className="gas-bar-container">
//                     <div
//                       className="gas-bar"
//                       style={{
//                         width: `${gasLevel.currentLevel}%`,
//                         backgroundColor: getGasLevelColor(gasLevel.currentLevel),
//                       }}
//                     ></div>
//                   </div>
//                 </div>
//                 {gasLevel.isLeaking && (
//                   <p className="leak-alert">⚠️ Gas Leak Detected!</p>
//                 )}
//               </>
//             ) : (
//               <p>No gas data available.</p>
//             )}
//           </div>

//           <div className="stat-box">
//             <h3>Estimated Refill Date</h3>
//             <p>Calculated based on usage...</p> {/* You can implement this logic later */}
//           </div>

//           <div className="stat-box">
//             <h3>Tube Expiry Date</h3>
//             <p>DD/MM/YYYY</p> {/* Static or fetched from KYC later */}
//           </div>
//         </div>

//         {/* Alerts Section */}
//         <div className="alerts-container">
//           <h3>Alerts</h3>
//           {gasLevel && gasLevel.isLeaking && (
//              <div className="alert-box danger">
//                <i className="danger-icon">🔥</i>
//                <p>Immediate Action: Gas Leak Detected!</p>
//              </div>
//           )}
//           {gasLevel && gasLevel.currentLevel <= 10 && !gasLevel.isLeaking && (
//             <div className="alert-box warning">
//               <i className="warning-icon">⚠️</i>
//               <p>Low Gas: Cylinder needs to be replaced soon.</p>
//             </div>
//           )}
//           {(!gasLevel || (gasLevel && !gasLevel.isLeaking && gasLevel.currentLevel > 10)) && (
//             <div className="alert-box success">
//               <i className="success-icon">✅</i>
//               <p>All systems nominal. No alerts.</p>
//             </div>
//           )}
//         </div>

//         {/* Notifications Section */}
//         <div className="notifications-container">
//           <h3>Notifications</h3>
//           <div className="notification-box success">
//             <i className="success-icon">✅</i>
//             <p>Your connection is active and running smoothly.</p>
//           </div>
//           {/* Add more dynamic notifications here based on gasLevel.isLeaking, auto-booking etc. */}
//           <div className="notification-box info">
//             <i className="info-icon">ℹ️</i>
//             <p>Welcome to Quick LPG Connect!</p>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default UserDashboard;
























import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/userDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [gasLevel, setGasLevel] = useState(null);
  const [loadingGas, setLoadingGas] = useState(true);
  const [errorGas, setErrorGas] = useState(null);
  const userEmail = localStorage.getItem("userEmail");

  // State for booking status
  const [bookingStatus, setBookingStatus] = useState({
    booked: false,
    message: '',
    paymentDue: false, // For future payment integration
    // You might want to store a booking ID here too
  });

  const AUTO_BOOKING_THRESHOLD = 10; // Must match simulationserver.js

  useEffect(() => {
    if (!userEmail) {
      setErrorGas("User not logged in.");
      setLoadingGas(false);
      return;
    }

    const fetchGasLevel = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/gaslevel/${userEmail}`);
        const currentGasData = response.data;
        setGasLevel(currentGasData);
        setErrorGas(null);

        // Logic for auto-booking notification on frontend
        if (currentGasData.currentLevel <= AUTO_BOOKING_THRESHOLD && !currentGasData.isLeaking && currentGasData.currentLevel > 0) {
          // If the simulation just auto-refilled, we might not want to show "booked"
          // This assumes `simulationserver.js` immediately refills.
          // In a real scenario, you'd have a 'booking_status' field in `GasLevel` model.
          // For now, we'll assume if it's low and not leaking, it implies a booking scenario.
          if (!bookingStatus.booked) { // Prevent multiple 'booked' messages
            setBookingStatus({
              booked: true,
              message: `Your gas level is low (${currentGasData.currentLevel.toFixed(2)}%). A new cylinder has been automatically booked.`,
              paymentDue: true, // Assuming payment is due upon booking
            });
            console.log("Gas booked logic triggered in frontend.");
          }
        } else if (currentGasData.currentLevel > AUTO_BOOKING_THRESHOLD && bookingStatus.booked) {
          // If gas level is now high (e.g., after a refill), clear booking status
          setBookingStatus({ booked: false, message: '', paymentDue: false });
        }

      } catch (err) {
        console.error("Failed to fetch gas level:", err);
        setErrorGas("Could not fetch gas level. Is the simulation running?");
        setGasLevel(null);
        setBookingStatus({ booked: false, message: '', paymentDue: false }); // Clear booking on error
      } finally {
        setLoadingGas(false);
      }
    };

    fetchGasLevel(); // Initial fetch
    const interval = setInterval(fetchGasLevel, 3000); // Poll every 3 seconds

    return () => clearInterval(interval); // Cleanup interval

  }, [userEmail, bookingStatus.booked]); // Depend on userEmail and bookingStatus.booked

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleEditProfile = () => {
    navigate("/editprofile");
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const handlePayNow = () => {
    // Implement payment logic here
    alert("Proceeding to payment for gas booking.");
    // After successful payment, you might update the booking status in the backend
    setBookingStatus({ ...bookingStatus, paymentDue: false, message: 'Payment confirmed! Cylinder on its way.' });
  };

  const handleCancelBooking = () => {
    // Implement cancellation logic here (e.g., API call to backend)
    alert("Booking cancelled.");
    setBookingStatus({ booked: false, message: '', paymentDue: false });
  };

  const getGasLevelColor = (level) => {
    if (level === null || level === undefined) return 'gray';
    if (level > 60) return 'green';
    if (level > 20) return 'orange';
    return 'red';
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Gas Monitor</h1>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate("/userdashboard")}>Dashboard</button>
          <button className="nav-btn" onClick={() => navigate("/history")}>History</button>
          <button className="nav-btn" onClick={() => navigate("/payment-history")}>Payment</button>
          <button className="nav-btn" onClick={() => navigate("/feedback")}>Feedback</button>
          {/* Add simulation control button - maybe only for admin/dev or hidden */}
          <button className="nav-btn" onClick={() => navigate("/simulation-control")}>Simulation Control</button>

          <div className="profile-section">
            <button
              className="profile-button"
              onClick={handleProfileClick}
              title="View Profile"
            >
              <img src="/profileicon.jpg" alt="Profile" />
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <h2>Dashboard</h2>

        {/* Stats Section */}
        <div className="stats-container">
          <div className="stat-box gas-level-box">
            <h3>Current Gas Level</h3>
            {loadingGas ? (
              <p>Loading...</p>
            ) : errorGas ? (
              <p className="error-message">{errorGas}</p>
            ) : gasLevel ? (
              <>
                <div className="gas-indicator">
                  <span
                    className="gas-level-percentage"
                    style={{ color: getGasLevelColor(gasLevel.currentLevel) }}
                  >
                    {gasLevel.currentLevel.toFixed(2)}%
                  </span>
                  <div className="gas-bar-container">
                    <div
                      className="gas-bar"
                      style={{
                        width: `${gasLevel.currentLevel}%`,
                        backgroundColor: getGasLevelColor(gasLevel.currentLevel),
                      }}
                    ></div>
                  </div>
                </div>
                {gasLevel.isLeaking && (
                  <p className="leak-alert">⚠️ Gas Leak Detected!</p>
                )}
              </>
            ) : (
              <p>No gas data available.</p>
            )}
          </div>

          <div className="stat-box">
            <h3>Estimated Refill Date</h3>
            <p>Calculated based on usage...</p>
          </div>

          <div className="stat-box">
            <h3>Tube Expiry Date</h3>
            <p>DD/MM/YYYY</p>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="alerts-container">
          <h3>Alerts</h3>
          {gasLevel && gasLevel.isLeaking && (
             <div className="alert-box danger">
               <i className="danger-icon">🔥</i>
               <p>Immediate Action: Gas Leak Detected! Please ventilate and contact emergency services.</p>
             </div>
          )}
          {gasLevel && gasLevel.currentLevel <= 20 && !gasLevel.isLeaking && (
            <div className="alert-box warning">
              <i className="warning-icon">⚠️</i>
              <p>Low Gas: Cylinder needs to be replaced soon.</p>
              <div className="booking-actions">
                <button onClick={handlePayNow} className="pay-now-btn">Payment</button>
                <button onClick={handleCancelBooking} className="cancel-booking-btn">Cancel Booking</button>
              </div>
            </div>
          )}
          {(!gasLevel || (gasLevel && !gasLevel.isLeaking && gasLevel.currentLevel > 20)) && (
            <div className="alert-box success">
              <i className="success-icon">✅</i>
              <p>All systems nominal. No immediate alerts.</p>
            </div>
          )}
        </div>

        {/* Notifications Section */}
        <div className="notifications-container">
          <h3>Notifications</h3>

          {/* Booking Notification */}
          {bookingStatus.booked && (
            <div className="notification-box info booking-notification">
              <i className="info-icon">ℹ️</i>
              <p>{bookingStatus.message}</p>
              {bookingStatus.paymentDue && (
                <div className="booking-actions">
                  <button onClick={handlePayNow} className="pay-now-btn">Pay Now</button>
                  <button onClick={handleCancelBooking} className="cancel-booking-btn">Cancel Booking</button>
                </div>
              )}
            </div>
          )}

          <div className="notification-box success">
            <i className="success-icon">✅</i>
            <p>Your connection is active and running smoothly.</p>
          </div>
          <div className="notification-box info">
            <i className="info-icon">ℹ️</i>
            <p>Welcome to Quick LPG Connect!</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;