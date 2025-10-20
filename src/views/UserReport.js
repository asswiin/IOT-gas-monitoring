import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/userReport.css';
import '../styles/userDashboard.css';

const UserReport = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userEmail = localStorage.getItem("userEmail");

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

    const fetchData = async () => {
      try {
        const userPaymentsEndpoint = `http://localhost:5000/api/payment/user/${userEmail}`;
        const userBookingsEndpoint = `http://localhost:5000/api/autobooking/user/${userEmail}`;

        const [paymentsResponse, bookingsResponse] = await Promise.all([
          axios.get(userPaymentsEndpoint),
          axios.get(userBookingsEndpoint)
        ]);

        setPayments(paymentsResponse.data || []);
        setBookings(bookingsResponse.data || []);
      } catch (err) {
        console.error("Failed to fetch report data:", err);
        setError("Could not load your report data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail, navigate]);

  const formatStatus = (status) => {
    return (status || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPaymentType = (type) => {
    const typeMap = {
      'initial_connection': 'Initial Connection',
      'gas_refill': 'Gas Refill'
    };
    return typeMap[type] || formatStatus(type);
  };

  const truncateId = (id) => {
    return id ? `${id.substring(0, 8)}...${id.substring(id.length - 4)}` : 'N/A';
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateTotalAmount = () => {
    return payments.reduce((total, payment) => total + (payment.amountDue || 0), 0);
  };

  if (loading) {
    return (
      <div className="dashboard-container report-container">
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
          <div className="loading-message">Loading your report...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container report-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container report-container">
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
        <div className="report-header">
          <h2>Account Report for {userEmail}</h2>
          <button onClick={handlePrint} className="print-btn no-print">
            🖨️ Print Report
          </button>
        </div>

        {/* Simple Summary */}
        <div className="report-section">
          <h3>Summary</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Payments:</span>
              <span className="stat-value">{payments.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Amount Paid:</span>
              <span className="stat-value">₹{calculateTotalAmount()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Bookings:</span>
              <span className="stat-value">{bookings.length}</span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="report-section">
          <h3>Payment History</h3>
          {payments.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Date & Time</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={payment._id || index}>
                    <td data-label="Payment ID">{truncateId(payment._id)}</td>
                    <td data-label="Date & Time">{formatDate(payment.createdAt)}</td>
                    <td data-label="Amount">₹{payment.amountDue || 0}</td>
                    <td data-label="Type">
                      <span className={`payment-type ${payment.paymentType || 'unknown'}`}>
                        {formatPaymentType(payment.paymentType)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No payment records found.</p>
          )}
        </div>

        {/* Booking History */}
        <div className="report-section">
          <h3>Booking History</h3>
          {bookings.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Last Updated</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={booking._id || index}>
                    <td data-label="Booking ID">{truncateId(booking._id)}</td>
                    <td data-label="Last Updated">{formatDate(booking.updatedAt)}</td>
                    <td data-label="Status">
                      <span className={`status-pill ${booking.status || 'unknown'}`}>
                        {formatStatus(booking.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No booking records found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserReport;