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

  const formatBookingType = (type) => {
    return type === 'manual' ? 'Manual Booking' : 'Auto-Booking';
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

  const getBookingStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'booking_pending' || b.status === 'refill_payment_pending').length,
      paid: bookings.filter(b => b.status === 'paid').length,
      fulfilled: bookings.filter(b => b.status === 'fulfilled').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      automatic: bookings.filter(b => b.bookingType === 'automatic').length,
      manual: bookings.filter(b => b.bookingType === 'manual').length
    };
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

  const bookingStats = getBookingStats();

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
        <div className="report-header-title">
          <h2>📊 Account Activity Report</h2>
          <p className="report-subtitle">Comprehensive overview of your gas connection account</p>
        </div>

        {/* Overview Summary Cards */}
        <div className="overview-grid">
          <div className="overview-card payments-card">
            <div className="overview-icon">💳</div>
            <div className="overview-content">
              <h3>Total Payments</h3>
              <p className="overview-value">{payments.length}</p>
              <p className="overview-amount">₹{calculateTotalAmount()}</p>
            </div>
          </div>
          <div className="overview-card bookings-card">
            <div className="overview-icon">📋</div>
            <div className="overview-content">
              <h3>Total Bookings</h3>
              <p className="overview-value">{bookingStats.total}</p>
              <p className="overview-detail">{bookingStats.fulfilled} Fulfilled</p>
            </div>
          </div>
          <div className="overview-card auto-card">
            <div className="overview-icon">🤖</div>
            <div className="overview-content">
              <h3>Auto-Bookings</h3>
              <p className="overview-value">{bookingStats.automatic}</p>
              <p className="overview-detail">Automated Orders</p>
            </div>
          </div>
          <div className="overview-card manual-card">
            <div className="overview-icon">👤</div>
            <div className="overview-content">
              <h3>Manual Bookings</h3>
              <p className="overview-value">{bookingStats.manual}</p>
              <p className="overview-detail">Self-Placed Orders</p>
            </div>
          </div>
        </div>

        {/* Payment History Section */}
        <div className="report-section">
          <div className="section-header">
            <h3>💳 Payment History</h3>
            <p className="section-description">All your payment transactions</p>
          </div>
          {payments.length > 0 ? (
            <div className="cards-grid">
              {payments.map((payment, index) => (
                <div key={payment._id || index} className="info-card payment-card">
                  <div className="card-header">
                    <span className={`payment-type-badge ${payment.paymentType || 'unknown'}`}>
                      {formatPaymentType(payment.paymentType)}
                    </span>
                    <span className="card-date">{formatDate(payment.createdAt)}</span>
                  </div>
                  <div className="card-body">
                    <div className="card-row">
                      <span className="card-label">Payment ID:</span>
                      <span className="card-value">{truncateId(payment._id)}</span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Amount Paid:</span>
                      <span className="card-value amount">₹{payment.amountDue || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-card">
              <p className="no-data-icon">💳</p>
              <p className="no-data-text">No payment records found</p>
            </div>
          )}
        </div>

        {/* Booking History Section */}
        <div className="report-section">
          <div className="section-header">
            <h3>📋 Booking History</h3>
            <p className="section-description">Track all your gas cylinder bookings</p>
          </div>
          
          {/* Booking Status Summary */}
          <div className="booking-status-summary">
            <div className="status-item pending">
              <span className="status-count">{bookingStats.pending}</span>
              <span className="status-label">Pending</span>
            </div>
            <div className="status-item paid">
              <span className="status-count">{bookingStats.paid}</span>
              <span className="status-label">Paid</span>
            </div>
            <div className="status-item fulfilled">
              <span className="status-count">{bookingStats.fulfilled}</span>
              <span className="status-label">Fulfilled</span>
            </div>
            <div className="status-item cancelled">
              <span className="status-count">{bookingStats.cancelled}</span>
              <span className="status-label">Cancelled</span>
            </div>
          </div>

          {bookings.length > 0 ? (
            <div className="cards-grid">
              {bookings.map((booking, index) => (
                <div key={booking._id || index} className={`info-card booking-card ${booking.status}`}>
                  <div className="card-header">
                    <span className={`booking-type-badge ${booking.bookingType || 'automatic'}`}>
                      {formatBookingType(booking.bookingType)}
                    </span>
                    <span className={`status-pill-small ${booking.status || 'unknown'}`}>
                      {formatStatus(booking.status)}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="card-row">
                      <span className="card-label">Booking ID:</span>
                      <span className="card-value">{truncateId(booking._id)}</span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Booked On:</span>
                      <span className="card-value">{formatDate(booking.createdAt)}</span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Last Updated:</span>
                      <span className="card-value">{formatDate(booking.updatedAt)}</span>
                    </div>
                    {booking.customerName && (
                      <div className="card-row">
                        <span className="card-label">Customer:</span>
                        <span className="card-value">{booking.customerName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-card">
              <p className="no-data-icon">📋</p>
              <p className="no-data-text">No booking records found</p>
            </div>
          )}
        </div>

        {/* Print Button at Bottom */}
        <div className="print-section no-print">
          <button onClick={handlePrint} className="print-btn-bottom">
            🖨️ Print Report
          </button>
        </div>
      </main>
    </div>
  );
};

export default UserReport;