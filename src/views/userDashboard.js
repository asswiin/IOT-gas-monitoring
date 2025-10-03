import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/userDashboard.css'; // Make sure your CSS path is correct
import { getEndpoint } from '../config';

// Define BOOKING_THRESHOLD here as it's used in frontend logic
const BOOKING_THRESHOLD = 20;

const UserDashboard = () => {
  const navigate = useNavigate();
  const [gasLevelData, setGasLevelData] = useState(null); // Renamed to gasLevelData for clarity
  const [loadingGas, setLoadingGas] = useState(true);
  const [errorGas, setErrorGas] = useState(null);
  const userEmail = localStorage.getItem("userEmail");

  const triggerLeakAlerts = () => {
    const audio = new Audio('/alert.mp3'); // Ensure this path is correct
    audio.play().catch(e => console.error('Audio play failed:', e));
    if (!("Notification" in window)) {
      alert("⚠️ GAS LEAK DETECTED! Please check your dashboard.");
      return;
    }
    const showNotification = () => {
      new Notification("⚠️ GAS LEAK DETECTED!", {
        body: "Immediate action required! Ventilate the area and contact emergency services.",
        icon: "/danger-icon.png", // Ensure this path is correct
        tag: "gas-leak-alert",
      });
    };
    if (Notification.permission === "granted") {
      showNotification();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          showNotification();
        }
      });
    }
  };

  const fetchGasLevel = useCallback(async () => {
    if (!userEmail) {
      setErrorGas("User not logged in.");
      setLoadingGas(false);
      return;
    }
    try {
      const response = await axios.get(getEndpoint.gasLevel(userEmail));
      const currentData = response.data; // This now includes hasPaidForRefill field

      setGasLevelData(prevGasLevel => {
        // Trigger alert only if it wasn't leaking before and is leaking now
        if (currentData.isLeaking && (!prevGasLevel || !prevGasLevel.isLeaking)) {
          triggerLeakAlerts();
        }
        return currentData;
      });

      setErrorGas(null);
    } catch (err) {
      console.error("Failed to fetch gas level:", err);
      if (err.response && err.response.status === 404) {
        setErrorGas("Your user profile was not found. Please log in again.");
        // Optionally, force logout if profile is missing
        // localStorage.removeItem("userEmail");
        // navigate('/login');
      } else {
        setErrorGas("Could not fetch gas level. Is the simulation running?");
      }
      setGasLevelData(null); // Clear gas data on error
    } finally {
      setLoadingGas(false);
    }
  }, [userEmail]); // Removed navigate from dependencies, as it's not directly used in the effect's core logic

  useEffect(() => {
    fetchGasLevel(); // Initial fetch
    const interval = setInterval(fetchGasLevel, 3000); // Poll every 3 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [fetchGasLevel]);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handlePayNow = useCallback(async () => {
    try {
      if (!userEmail) {
        alert("User email not found. Please log in again.");
        return;
      }

      // Fetch the latest KYC data for the user
      const kycResponse = await axios.get(getEndpoint.newConnection(userEmail));
      const kycData = kycResponse.data;

      // Fetch current gas level data (includes hasPaidForRefill)
      const gasResponse = await axios.get(getEndpoint.gasLevel(userEmail));
      const currentGasData = gasResponse.data;

      if (!kycData) {
          alert("Your user profile data is missing. Please contact support.");
          return;
      }

      // If they've already paid for a refill, inform them
      if (currentGasData && currentGasData.hasPaidForRefill) {
          alert("You have already paid for a refill. It will be activated once your current cylinder is empty.");
          return;
      }

      // Ensure the status is appropriate for payment
      if (kycData.status !== 'booking_pending' && kycData.status !== 'refill_payment_pending') {
        alert("Payment is not required at this time or booking is not pending.");
        return;
      }

      // Store in localStorage for the payment page to use
      localStorage.setItem("kycFormData", JSON.stringify(kycData));

      // Navigate to payment page, passing state to indicate this is a refill
      navigate('/payment', { state: { isRefill: true } });

    } catch (err) {
      alert("Could not fetch user details for payment. Please try again.");
      console.error("Error fetching KYC data for payment:", err);
    }
  }, [userEmail, navigate]);

  const handleCancelBooking = useCallback(async () => {
    if (!window.confirm("Are you sure you want to cancel this booking? Your gas level will continue to decrease.")) {
      return;
    }
    try {
      // You need to implement this backend endpoint to change KYC status
      await axios.put(getEndpoint.cancelBooking(userEmail));
      alert("Booking cancelled successfully.");
      fetchGasLevel(); // Refresh data to reflect cancellation
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Could not cancel the booking. Please try again.");
    }
  }, [userEmail, fetchGasLevel]);

  const getGasLevelColor = (level) => {
    if (level === null || level === undefined) return '#6c757d';
    if (level > 60) return '#28a745'; // Green for high levels
    if (level > BOOKING_THRESHOLD) return '#ffc107'; // Yellow for medium levels
    return '#dc3545'; // Red for low levels
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>⛽ Gas Monitor</h1>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate("/userdashboard")}>
            Dashboard
          </button>
          <button className="nav-btn" onClick={() => navigate("/history")}>
            History
          </button>
          <button className="nav-btn" onClick={() => navigate("/feedback")}>
            Feedback
          </button>
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
        <h2>🎛️ Control Center</h2>
        <div className="stats-container">
          <div className="stat-box gas-level-box">
            <h3>⛽ Current Gas Level</h3>
            {loadingGas ? (
              <p>Loading...</p>
            ) : errorGas ? (
              <p className="error-message">{errorGas}</p>
            ) : gasLevelData ? ( // Use gasLevelData here
              <>
                <div className="gas-indicator">
                  <span
                    className="gas-level-percentage"
                    style={{ color: getGasLevelColor(gasLevelData.currentLevel) }}
                  >
                    {gasLevelData.currentLevel.toFixed(2)}%
                  </span>
                  <div className="gas-bar-container">
                    <div
                      className="gas-bar"
                      style={{
                        width: `${gasLevelData.currentLevel}%`,
                        backgroundColor: getGasLevelColor(gasLevelData.currentLevel),
                      }}
                    ></div>
                  </div>
                </div>
                {gasLevelData.isLeaking && (
                  <p className="leak-alert">⚠️ Gas Leak Detected!</p>
                )}
                {/* NEW: Info if refill is paid for but not yet activated */}
                {gasLevelData.hasPaidForRefill && gasLevelData.currentLevel > 0 && (
                  <p className="refill-pending-info">
                    ✅ Refill paid! New cylinder activates when current one is depleted.
                  </p>
                )}
              </>
            ) : (
              <p>No gas data available.</p>
            )}
          </div>
          <div className="stat-box">
            <h3>📅 Estimated Refill Date</h3>
            <p>📈 Calculated based on usage...</p> {/* You might want to implement this logic */}
          </div>
          <div className="stat-box">
            <h3>⏰ Tube Expiry Date</h3>
            <p>📋 DD/MM/YYYY</p> {/* You might want to implement this logic */}
          </div>
        </div>
        <div className="alerts-container">
          <h3>Alerts</h3>
          {gasLevelData && gasLevelData.isLeaking && (
            <div className="alert-box danger">
              <i className="danger-icon">🔥</i> {/* You need a CSS class for danger-icon or use an actual icon library */}
              <p>Immediate Action: Gas Leak Detected! Ventilate and contact emergency services.</p>
            </div>
          )}
          {/* MODIFIED: Auto-booking/Pay Now if gas is low AND not already paid for refill */}
          {gasLevelData && (gasLevelData.status === 'booking_pending' || gasLevelData.status === 'refill_payment_pending') && !gasLevelData.isLeaking && !gasLevelData.hasPaidForRefill && (
            <div className="alert-box info">
              <i className="info-icon">ℹ️</i> {/* You need a CSS class for info-icon */}
              <p>Your gas level is low. A new cylinder has been automatically booked for you.</p>
              <div className="booking-actions">
                <button onClick={handlePayNow} className="pay-now-btn">Pay Now</button>
                <button onClick={handleCancelBooking} className="cancel-booking-btn">Cancel Booking</button>
              </div>
            </div>
          )}
          {/* NEW: Alert if refill paid, waiting for current cylinder to deplete */}
          {gasLevelData && (gasLevelData.status === 'booking_pending' || gasLevelData.status === 'refill_payment_pending') && !gasLevelData.isLeaking && gasLevelData.hasPaidForRefill && (
            <div className="alert-box success"> {/* Using success class as it's a positive state */}
              <i className="info-icon">ℹ️</i>
              <p>Payment for new cylinder received! It will be installed once your current cylinder is fully depleted.</p>
            </div>
          )}
          {/* MODIFIED: Low gas warning if active, below threshold, not leaking, AND no refill paid for */}
          {gasLevelData && gasLevelData.currentLevel <= BOOKING_THRESHOLD && gasLevelData.status === 'active' && !gasLevelData.isLeaking && !gasLevelData.hasPaidForRefill && (
            <div className="alert-box warning">
              <i className="warning-icon">⚠️</i> {/* You need a CSS class for warning-icon */}
              <p>Low Gas: Cylinder needs to be replaced soon. Auto-booking in progress...</p>
            </div>
          )}
          {/* Default 'All nominal' message if no other alerts */}
          {(!gasLevelData || (gasLevelData && !gasLevelData.isLeaking && gasLevelData.status === 'active' && gasLevelData.currentLevel > BOOKING_THRESHOLD && !gasLevelData.hasPaidForRefill)) && (
            <div className="alert-box success">
              <i className="success-icon">✅</i> {/* You need a CSS class for success-icon */}
              <p>All systems nominal. No immediate alerts.</p>
            </div>
          )}
        </div>
        <div className="notifications-container">
          <h3>Notifications</h3>
          {/* NEW: Notification for paid refill */}
          {gasLevelData && gasLevelData.hasPaidForRefill && (
            <div className="notification-box info">
              <i className="info-icon">ℹ️</i>
              <p>Refill payment confirmed. A new cylinder is ready for activation.</p>
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