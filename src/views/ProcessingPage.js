// --- START OF FILE ProcessingPage.js ---

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/processingPage.css'; // Create this CSS file

function ProcessingPage() {
  const [statusMessage, setStatusMessage] = useState("Your new connection request is under review by the admin.");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail"); // Get current user's email

  useEffect(() => {
    if (!userEmail) {
      navigate('/login'); // Redirect to login if no user email found
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/newconnection/${userEmail}`);
        const kycData = response.data;

        if (kycData) {
          if (kycData.status === 'approved') {
            setStatusMessage("Your request has been APPROVED! Redirecting to payment...");
            localStorage.setItem("kycFormData", JSON.stringify(kycData)); // Update local storage with approved data
            setTimeout(() => navigate('/payment'), 2000);
            return;
          } else if (kycData.status === 'rejected') {
            setStatusMessage("Your request has been REJECTED. Please check your details and re-apply.");
            localStorage.removeItem("kycFormData"); // Clear local storage for a fresh start
            setTimeout(() => navigate('/newconnection'), 3000);
            return;
          } else if (kycData.status === 'pending_approval') {
            setStatusMessage("Your new connection request is still under review by the admin. Please wait.");
          }
        } else {
            // This case might happen if admin rejects and deletes the record, or if there's an issue
            setStatusMessage("No pending request found or an error occurred. Redirecting to new connection form.");
            localStorage.removeItem("kycFormData");
            setTimeout(() => navigate('/newconnection'), 3000);
            return;
        }
      } catch (err) {
        console.error("Error checking status:", err);
        setStatusMessage("An error occurred while checking status. Please try again later.");
        // If the record isn't found (404), treat it as needing to apply again
        if (err.response && err.response.status === 404) {
            localStorage.removeItem("kycFormData");
            setTimeout(() => navigate('/newconnection'), 3000);
        }
      } finally {
        setLoading(false);
      }
    };

    // Poll every 5 seconds (adjust as needed)
    const intervalId = setInterval(checkStatus, 5000);
    checkStatus(); // Check immediately on mount

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [userEmail, navigate]);

  return (
    <div className="processing-container">
      <div className="processing-card">
        <h2>Request Status</h2>
        {loading ? (
          <div className="spinner"></div> // Optional spinner for visual feedback
        ) : (
          <p className="status-message">{statusMessage}</p>
        )}
        {!loading && statusMessage.includes("under review") && (
            <p className="hint-message">This page will automatically update once the admin reviews your request.</p>
        )}
      </div>
    </div>
  );
}

export default ProcessingPage;