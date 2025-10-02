

import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/adminDashboard.css"; // Ensure this path is correct for your project


function Card({ title, children }) {
  return (
    <div className="card">
      {title && <h3>{title}</h3>}
      <div>{children}</div>
    </div>
  );
}

function UserDetail({ user, onBack, onDeleteUser }) {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  if (!user) return null;

  return (
    <div className="user-detail-card card">
      <button onClick={onBack} className="back-btn">← Back to Users List</button>
      <h3>User Details</h3>
      <div className="detail-section">
        <h4>Personal Information</h4>
        <p><strong>Full Name:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Mobile:</strong> {user.mobileNumber}</p>
        <p><strong>Date of Birth:</strong> {new Date(user.dob).toLocaleDateString()}</p>
        <p><strong>Status:</strong> <span className={`status ${user.status}`}>{user.status.replace(/_/g, ' ')}</span></p>
      </div>
      <div className="detail-section">
        <h4>Address</h4>
        {/* MODIFIED: Correctly display town and district */}
        <p><strong>Address:</strong> {`${user.houseName}, ${user.streetName}, ${user.town}, ${user.district}, ${user.state} - ${user.pinCode}`}</p>
      </div>
      <p><strong>Joined On:</strong> {new Date(user.createdAt).toLocaleString()}</p>
      <div className="user-actions detail-actions">
        <button onClick={() => setShowDeletePopup(true)} className="delete-btn">Delete User</button>
      </div>

      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to permanently delete this user and all their associated data?</p>
            <div className="popup-buttons">
              <button onClick={() => { onDeleteUser(user.email); setShowDeletePopup(false); }} className="confirm-yes">Yes, Delete</button>
              <button onClick={() => setShowDeletePopup(false)} className="confirm-no">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestDetail({ request, onApprove, onReject, onBack }) {
  if (!request) return null;
  return (
    <div className="request-detail-card card">
      <button onClick={onBack} className="back-btn">← Back to Requests List</button>
      <h3>Connection Request Details</h3>
      <div className="detail-section">
        <p><strong>Full Name:</strong> {request.firstName} {request.lastName}</p>
        <p><strong>Email:</strong> {request.email}</p>
        <p><strong>Mobile:</strong> {request.mobileNumber}</p>
        {/* MODIFIED: Correctly display town and district */}
        <p><strong>Address:</strong> {`${request.houseName}, ${request.streetName}, ${request.town}, ${request.district}`}</p>
        <p><strong>Requested On:</strong> {new Date(request.createdAt).toLocaleString()}</p>
      </div>
      <div className="request-actions detail-actions">
        <button onClick={() => onApprove(request._id, request.email)} className="approve-btn">Approve</button>
        <button onClick={() => onReject(request._id, request.email)} className="reject-btn">Reject</button>
      </div>
    </div>
  );
}

function PaymentDetail({ payment, onBack }) {
  if (!payment) return null;
  return (
    <div className="payment-detail-card card">
      <button onClick={onBack} className="back-btn">← Back to Payments List</button>
      <h3>Payment Details</h3>
      <div className="detail-section">
        <p><strong>Customer Name:</strong> {payment.customerName}</p>
        <p><strong>Email:</strong> {payment.email}</p>
        <p><strong>Amount Paid:</strong> ₹{payment.amountDue}</p>
        <p><strong>Payment Date:</strong> {new Date(payment.dateOfPayment || payment.createdAt).toLocaleString()}</p>
        <p><strong>Payment Type:</strong> {payment.paymentType ? payment.paymentType.replace(/_/g, ' ') : 'N/A'}</p>
        <p><strong>Payment ID:</strong> {payment._id}</p>
      </div>
    </div>
  );
}

function AutoBookingDetail({ booking, onBack }) {
  if (!booking) return null;
  return (
    <div className="auto-booking-detail-card card">
      <button onClick={onBack} className="back-btn">← Back to Bookings List</button>
      <h3>Auto-Booking Details</h3>
      <div className="detail-section">
        <p><strong>User Email:</strong> {booking.email}</p>
        <p><strong>Booking Date:</strong> {new Date(booking.bookingDate).toLocaleString()}</p>
        <p><strong>Status:</strong> <span className={`status ${booking.status}`}>{booking.status}</span></p>
        <p><strong>Booking ID:</strong> {booking._id}</p>
      </div>
    </div>
  );
}



export default function Dashboard() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [pendingAutoBookings, setPendingAutoBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard-summary');
  const [selectedItem, setSelectedItem] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const fetchData = async () => {
    try {
      const [requestsRes, usersRes, paymentsRes, pendingBookingsRes, cancelledBookingsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/newconnection/requests/pending"),
        axios.get("http://localhost:5000/api/newconnection"),
        axios.get("http://localhost:5000/api/payment"),
        axios.get("http://localhost:5000/api/autobooking"),
        axios.get("http://localhost:5000/api/autobooking/cancelled")
      ]);
      setPendingRequests(requestsRes.data);
      setAllUsers(usersRes.data);
      setAllPayments(paymentsRes.data);
      setPendingAutoBookings(pendingBookingsRes.data);
      setCancelledBookings(cancelledBookingsRes.data);
    } catch (err) {
      setError("Failed to load dashboard data. Please check the server connection and refresh.");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const handleApprove = async (kycId, userEmail) => {
    try {
      await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/status`, { status: 'approved' });
      showNotification("Request approved successfully!");
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      showNotification("Failed to approve request.", 'error');
    }
  };

  const handleReject = async (kycId, userEmail) => {
    try {
      await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/status`, { status: 'rejected' });
      showNotification("Request rejected and user removed.");
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      showNotification("Failed to reject request.", 'error');
    }
  };
  
  const handleDeleteUser = async (userEmail) => {
    try {
      await axios.delete(`http://localhost:5000/api/newconnection/${userEmail}`);
      showNotification("User and all associated data deleted permanently!");
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      showNotification("Failed to delete user.", 'error');
    }
  };

  const handleSidebarNav = (section) => {
    setSelectedItem(null);
    setActiveSection(section);
  };

  const renderContent = () => {
    if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;
    if (error) return <p className="error-message">{error}</p>;

    if (selectedItem) {
      switch (activeSection) {
        case 'users': return <UserDetail user={selectedItem} onBack={() => setSelectedItem(null)} onDeleteUser={handleDeleteUser} />;
        case 'requests-list': return <RequestDetail request={selectedItem} onBack={() => setSelectedItem(null)} onApprove={handleApprove} onReject={handleReject} />;
        case 'payments': return <PaymentDetail payment={selectedItem} onBack={() => setSelectedItem(null)} />;
        case 'auto-bookings': return <AutoBookingDetail booking={selectedItem} onBack={() => setSelectedItem(null)} />;
        default: setSelectedItem(null); return null;
      }
    }

    switch (activeSection) {
      case 'dashboard-summary':
        return (
          <div className="card-grid">
            <Card title="Total Users"><p>{allUsers.length}</p></Card>
            <Card title="Active Connections"><p>{allUsers.filter(u => u.status === 'active').length}</p></Card>
            <Card title="Pending Requests"><p>{pendingRequests.length}</p></Card>
            <Card title="Pending Bookings"><p>{pendingAutoBookings.length}</p></Card>
            <Card title="Cancelled Bookings"><p>{cancelledBookings.length}</p></Card>
            <Card title="Total Payments"><p>{allPayments.length}</p></Card>
          </div>
        );

      case 'users':
        return (
          <div className="list-container">
            {allUsers.length === 0 ? <p>No users found.</p> : allUsers.map(user => (
              <div key={user._id} className="list-item card clickable" onClick={() => setSelectedItem(user)}>
                <h4>{user.firstName} {user.lastName} ({user.email})</h4>
                <p><strong>Status:</strong> <span className={`status ${user.status}`}>{user.status.replace(/_/g, ' ')}</span></p>
              </div>
            ))}
          </div>
        );
      
      case 'requests-list':
        return (
          <div className="list-container">
            {pendingRequests.length === 0 ? <p>No pending requests.</p> : pendingRequests.map(req => (
              <div key={req._id} className="list-item card clickable" onClick={() => setSelectedItem(req)}>
                <h4>{req.firstName} {req.lastName} ({req.email})</h4>
                <p><strong>Requested On:</strong> {new Date(req.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        );

      case 'payments':
        return (
          <div className="list-container">
            {allPayments.length === 0 ? <p>No payments found.</p> : allPayments.map(p => (
              <div key={p._id} className="list-item card clickable" onClick={() => setSelectedItem(p)}>
                <h4>{p.customerName} (₹{p.amountDue})</h4>
                <p><strong>Date:</strong> {new Date(p.dateOfPayment || p.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        );

      case 'auto-bookings':
        return (
          <div className="list-container">
            {pendingAutoBookings.length === 0 ? <p>No pending auto-bookings.</p> : pendingAutoBookings.map(b => (
              <div key={b._id} className="list-item card clickable" onClick={() => setSelectedItem(b)}>
                <h4>{b.email}</h4>
                <p><strong>Booked On:</strong> {new Date(b.bookingDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span className="status booked">{b.status}</span></p>
              </div>
            ))}
          </div>
        );

      case 'cancelled-bookings':
        return (
          <div className="list-container">
            {cancelledBookings.length === 0 ? <p>No cancelled bookings.</p> : cancelledBookings.map(b => (
              <div key={b._id} className="list-item card">
                <h4>{b.email}</h4>
                <p><strong>Cancelled On:</strong> {new Date(b.updatedAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span className="status cancelled">{b.status}</span></p>
              </div>
            ))}
          </div>
        );
        
      default:
        return <p className="coming-soon">This section is under construction.</p>;
    }
  };

  const getSectionTitle = () => {
    if (selectedItem) return "Details View";
    const titles = {
      'dashboard-summary': 'Dashboard Summary',
      'users': 'All Users',
      'requests-list': 'Pending Connection Requests',
      'payments': 'All Payments',
      'auto-bookings': 'Pending Auto-Bookings',
      'cancelled-bookings': 'Cancelled Bookings',
    };
    return titles[activeSection] || 'Admin Panel';
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2 className="logo">Admin Panel</h2>
        <nav>
          <ul>
            <li className={activeSection === 'dashboard-summary' ? 'active' : ''} onClick={() => handleSidebarNav('dashboard-summary')}>Dashboard</li>
            <li className={activeSection === 'users' ? 'active' : ''} onClick={() => handleSidebarNav('users')}>Users</li>
            <li className={activeSection === 'requests-list' ? 'active' : ''} onClick={() => handleSidebarNav('requests-list')}>Requests {pendingRequests.length > 0 && <span className="pending-count">({pendingRequests.length})</span>}</li>
            <li className={activeSection === 'payments' ? 'active' : ''} onClick={() => handleSidebarNav('payments')}>Payments</li>
            <li className={activeSection === 'auto-bookings' ? 'active' : ''} onClick={() => handleSidebarNav('auto-bookings')}>Pending Bookings {pendingAutoBookings.length > 0 && <span className="pending-count">({pendingAutoBookings.length})</span>}</li>
            <li className={activeSection === 'cancelled-bookings' ? 'active' : ''} onClick={() => handleSidebarNav('cancelled-bookings')}>Cancelled Bookings</li>
          </ul>
        </nav>
        <div className="user-info">
          <div className="avatar"></div>
          <div>
            <p className="username">Admin User</p>
            <p className="signout">Sign Out</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-center">
          <h1 className="page-title">{getSectionTitle()}</h1>
          {renderContent()}
        </div>
      </main>

      {notification.show && (
        <div className="popup-overlay">
          <div className={`popup-content notification ${notification.type}`}>
            <h3>{notification.type === 'success' ? '✅ Success' : '❌ Error'}</h3>
            <p>{notification.message}</p>
            <button onClick={() => setNotification({ ...notification, show: false })} className="popup-ok">OK</button>
          </div>
        </div>
      )}
    </div>
  );
}