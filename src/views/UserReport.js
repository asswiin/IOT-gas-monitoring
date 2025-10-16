import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/userReport.css'; // Create this new CSS file
import '../styles/userDashboard.css'; // Reuse some styles

const UserReport = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // IMPORTANT: Add these endpoints to your config.js or define them here
        const userPaymentsEndpoint = `http://localhost:5000/api/payment/user/${userEmail}`;
        const userBookingsEndpoint = `http://localhost:5000/api/autobooking/user/${userEmail}`;

        const [paymentsResponse, bookingsResponse] = await Promise.all([
          axios.get(userPaymentsEndpoint),
          axios.get(userBookingsEndpoint)
        ]);

        setPayments(paymentsResponse.data);
        setBookings(bookingsResponse.data);
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
  
  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="dashboard-container report-container">
      <header className="dashboard-header no-print">
        <h1>📜 My Report</h1>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate("/userdashboard")}>Dashboard</button>
          <button className="nav-btn" onClick={() => navigate("/history")}>History</button>
          <button className="nav-btn" onClick={() => navigate("/report")}>Report</button>
          <button className="nav-btn" onClick={() => navigate("/feedback")}>Feedback</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="report-header">
            <h2>Payment & Booking History for {userEmail}</h2>
            <button onClick={handlePrint} className="print-btn no-print">🖨️ Print Report</button>
        </div>

        {loading && <p>Loading your report...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <>
            <div className="report-section">
              <h3>💳 Payment History</h3>
              {payments.length > 0 ? (
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment._id}>
                        <td data-label="Payment ID">{payment._id}</td>
                        <td data-label="Date">{new Date(payment.createdAt).toLocaleString()}</td>
                        <td data-label="Amount">₹{payment.amountDue}</td>
                        <td data-label="Type">{formatStatus(payment.paymentType)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No payment records found.</p>
              )}
            </div>

            <div className="report-section">
              <h3>📦 Booking History</h3>
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
                    {bookings.map(booking => (
                      <tr key={booking._id}>
                        <td data-label="Booking ID">{booking._id}</td>
                        <td data-label="Last Updated">{new Date(booking.updatedAt).toLocaleString()}</td>
                        <td data-label="Status">
                          <span className={`status-pill ${booking.status}`}>{formatStatus(booking.status)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No booking records found.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default UserReport;