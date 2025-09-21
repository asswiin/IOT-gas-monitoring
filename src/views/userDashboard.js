

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/userDashboard.css';
import { getEndpoint } from '../config';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [gasLevel, setGasLevel] = useState(null);
  const [loadingGas, setLoadingGas] = useState(true);
  const [errorGas, setErrorGas] = useState(null);
  const userEmail = localStorage.getItem("userEmail");

  const triggerLeakAlerts = () => {
    const audio = new Audio('/alert.mp3');
    audio.play().catch(e => console.error('Audio play failed:', e));
    if (!("Notification" in window)) {
      alert("⚠️ GAS LEAK DETECTED! Please check your dashboard.");
      return;
    }
    const showNotification = () => {
      new Notification("⚠️ GAS LEAK DETECTED!", {
        body: "Immediate action required! Ventilate the area and contact emergency services.",
        icon: "/danger-icon.png",
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
      const currentData = response.data;

      setGasLevel(prevGasLevel => {
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
      } else {
        setErrorGas("Could not fetch gas level. Is the simulation running?");
      }
      setGasLevel(null);
    } finally {
      setLoadingGas(false);
    }
  }, [userEmail]);

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
      const response = await axios.get(getEndpoint.newConnection(userEmail));
      const kycData = response.data;

      // Ensure the status is appropriate for payment
      if (!kycData || (kycData.status !== 'booking_pending' && kycData.status !== 'refill_payment_pending')) {
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
      await axios.put(getEndpoint.cancelBooking(userEmail)); // Assuming this endpoint exists and handles status change
      alert("Booking cancelled successfully.");
      fetchGasLevel(); // Refresh data to reflect cancellation
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Could not cancel the booking. Please try again.");
    }
  }, [userEmail, fetchGasLevel]);

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
              <p>Immediate Action: Gas Leak Detected! Ventilate and contact emergency services.</p>
            </div>
          )}
          {/* MODIFICATION HERE: Check for 'booking_pending' OR 'refill_payment_pending' */}
          {gasLevel && (gasLevel.status === 'booking_pending' || gasLevel.status === 'refill_payment_pending') && !gasLevel.isLeaking && (
            <div className="alert-box info">
              <i className="info-icon">ℹ️</i>
              <p>Your gas level is low. A new cylinder has been automatically booked for you.</p>
              <div className="booking-actions">
                <button onClick={handlePayNow} className="pay-now-btn">Pay Now</button>
                <button onClick={handleCancelBooking} className="cancel-booking-btn">Cancel Booking</button>
              </div>
            </div>
          )}
          {gasLevel && gasLevel.currentLevel <= 20 && gasLevel.status === 'active' && !gasLevel.isLeaking && (
            <div className="alert-box warning">
              <i className="warning-icon">⚠️</i>
              <p>Low Gas: Cylinder needs to be replaced soon. Auto-booking in progress...</p>
            </div>
          )}
          {(!gasLevel || (gasLevel && !gasLevel.isLeaking && gasLevel.status !== 'booking_pending' && gasLevel.status !== 'refill_payment_pending' && gasLevel.currentLevel > 20)) && (
            <div className="alert-box success">
              <i className="success-icon">✅</i>
              <p>All systems nominal. No immediate alerts.</p>
            </div>
          )}
        </div>
        <div className="notifications-container">
          <h3>Notifications</h3>
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