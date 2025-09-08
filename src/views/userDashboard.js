
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
    paymentDue: false,
  });

  const AUTO_BOOKING_THRESHOLD = 10;

  // --- MODIFICATION START ---

  // New comprehensive function to trigger both sound and system notification for leaks.
  const triggerLeakAlerts = () => {
    // 1. Play Sound Alert
    const audio = new Audio('/alert.mp3'); // Ensure alert.mp3 is in the /public folder
    audio.play().catch(e => console.error('Audio play failed:', e));

    // 2. Show System Notification
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notifications.");
      // Fallback for unsupported browsers
      alert("⚠️ GAS LEAK DETECTED! Please check your dashboard.");
      return;
    }

    const showNotification = () => {
      new Notification("⚠️ GAS LEAK DETECTED!", {
        body: "Immediate action required! Ventilate the area and contact emergency services.",
        icon: "/danger-icon.png", // Ensure danger-icon.png is in the /public folder
        tag: "gas-leak-alert", // Using a tag prevents multiple notifications from stacking up
      });
    };

    // Check notification permission status
    if (Notification.permission === "granted") {
      showNotification();
    } else if (Notification.permission !== "denied") {
      // Request permission from the user
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          showNotification();
        }
      });
    }
  };
  
  // Removed the old playLeakAlert function as its logic is now inside triggerLeakAlerts.

  // --- MODIFICATION END ---


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
        
        // --- MODIFICATION ---
        // Play sound and show notification if leak is detected and the state has just changed
        if (currentGasData.isLeaking && (!gasLevel || !gasLevel.isLeaking)) {
          triggerLeakAlerts(); // Call the new comprehensive alert function
        }
        
        setGasLevel(currentGasData);
        setErrorGas(null);

        // Logic for auto-booking notification on frontend
        if (currentGasData.currentLevel <= AUTO_BOOKING_THRESHOLD && !currentGasData.isLeaking && currentGasData.currentLevel > 0) {
          if (!bookingStatus.booked) {
            setBookingStatus({
              booked: true,
              message: `Your gas level is low (${currentGasData.currentLevel.toFixed(2)}%). A new cylinder has been automatically booked.`,
              paymentDue: true,
            });
            console.log("Gas booked logic triggered in frontend.");
          }
        } else if (currentGasData.currentLevel > AUTO_BOOKING_THRESHOLD && bookingStatus.booked) {
          setBookingStatus({ booked: false, message: '', paymentDue: false });
        }

      } catch (err) {
        console.error("Failed to fetch gas level:", err);
        setErrorGas("Could not fetch gas level. Is the simulation running?");
        setGasLevel(null);
        setBookingStatus({ booked: false, message: '', paymentDue: false });
      } finally {
        setLoadingGas(false);
      }
    };

    fetchGasLevel(); // Initial fetch
    const interval = setInterval(fetchGasLevel, 3000); // Poll every 3 seconds

    return () => clearInterval(interval); // Cleanup interval

  }, [userEmail, gasLevel, bookingStatus.booked]); // Added gasLevel to dependency array for accurate state comparison

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handlePayNow = () => {
    alert("Proceeding to payment for gas booking.");
    setBookingStatus({ ...bookingStatus, paymentDue: false, message: 'Payment confirmed! Cylinder on its way.' });
  };

  const handleCancelBooking = () => {
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

        <div className="notifications-container">
          <h3>Notifications</h3>

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



