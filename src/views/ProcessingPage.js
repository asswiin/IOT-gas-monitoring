// --- START OF FILE ProcessingPage.js ---

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/processingPage.css';

function ProcessingPage() {
  const [statusMessage, setStatusMessage] = useState("Your new connection request is under review by the admin.");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/newconnection/${userEmail}`);
        const kycData = response.data;

        if (kycData) {
          if (kycData.status === 'approved') {
            setStatusMessage("Your request has been APPROVED! Redirecting to payment...");
            localStorage.setItem("kycFormData", JSON.stringify(kycData)); // Store for payment page if needed
            setTimeout(() => navigate('/payment', { state: { isRefill: false } }), 2000); // Navigate for initial payment
            return;
          } else if (kycData.status === 'rejected') {
            setStatusMessage("Your request has been REJECTED. Please check your details and re-apply.");
            localStorage.removeItem("kycFormData");
            setTimeout(() => navigate('/newconnection'), 3000);
            return;
          } else if (kycData.status === 'pending_approval') {
            setStatusMessage("Your new connection request is still under review by the admin. Please wait.");
          }
        } else {
            // This scenario might happen if a rejected record was deleted and no new one was made.
            setStatusMessage("No pending request found or an error occurred. Redirecting to new connection form.");
            localStorage.removeItem("kycFormData");
            setTimeout(() => navigate('/newconnection'), 3000);
            return;
        }
      } catch (err) {
        console.error("Error checking status:", err);
        setStatusMessage("An error occurred while checking status. Please try again later.");
        if (err.response && err.response.status === 404) {
            // If the record is not found (e.g., deleted by admin rejection)
            localStorage.removeItem("kycFormData");
            setTimeout(() => navigate('/newconnection'), 3000);
        }
      } finally {
        setLoading(false);
      }
    };

    // Poll every 5 seconds
    const intervalId = setInterval(checkStatus, 5000);
    checkStatus(); // Initial check immediately

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [userEmail, navigate]); // Dependencies

  return (
    <div className="processing-container">
      <div className="processing-card">
        <h2>Request Status</h2>
        {loading ? (
          <div className="spinner"></div>
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