

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/adminDashboard.css"; // Ensure this path is correct

// ===================================================================================
//  1. SUB-COMPONENTS (These are unchanged)
// ===================================================================================

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

// ===================================================================================
//  2. MAIN DASHBOARD COMPONENT
// ===================================================================================

export default function Dashboard() {
  // Original data states
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [initialPayments, setInitialPayments] = useState([]);
  const [refillPayments, setRefillPayments] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);

  // States for filtered data
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filteredInitialPayments, setFilteredInitialPayments] = useState([]);
  const [filteredRefillPayments, setFilteredRefillPayments] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);

  // NEW: State for the search term
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard-summary');
  const [selectedItem, setSelectedItem] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showSignOutPopup, setShowSignOutPopup] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    // This function is slightly modified to also reset the filtered data on fetch
    setLoading(true);
    try {
      const [requestsRes, usersRes, paymentsRes, allBookingsRes, myFeedbackRes] = await Promise.all([
        axios.get("http://localhost:5000/api/newconnection/requests/pending"),
        axios.get("http://localhost:5000/api/newconnection"),
        axios.get("http://localhost:5000/api/payment"),
        axios.get("http://localhost:5000/api/autobooking/all"),
        axios.get("http://localhost:5000/api/myfeedback")
      ]);
      
      setPendingRequests(requestsRes.data);
      setAllUsers(usersRes.data);
      
      const allPayments = paymentsRes.data;
      const initial = allPayments.filter(p => p.paymentType === 'initial_connection' || !p.paymentType);
      const refill = allPayments.filter(p => p.paymentType === 'gas_refill');
      
      setInitialPayments(initial);
      setRefillPayments(refill);
      setAllBookings(allBookingsRes.data);
      setMyFeedback(myFeedbackRes.data);

    } catch (err) {
      setError("Failed to load dashboard data. Please check the server connection and refresh.");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // NEW: useEffect hook to handle filtering whenever the search term or data changes
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    
    // Define a helper to check against multiple fields
    const searchInUser = (user, term) => 
        user.email?.toLowerCase().includes(term) ||
        user.mobileNumber?.includes(searchTerm) || // Phone number search doesn't need toLowerCase
        user.firstName?.toLowerCase().includes(term) ||
        user.lastName?.toLowerCase().includes(term);

    const searchInPayment = (payment, term) =>
        payment.email?.toLowerCase().includes(term) ||
        payment.mobileNumber?.includes(searchTerm) ||
        payment.customerName?.toLowerCase().includes(term);

    setFilteredUsers(allUsers.filter(user => searchInUser(user, term)));
    setFilteredRequests(pendingRequests.filter(req => searchInUser(req, term)));
    setFilteredInitialPayments(initialPayments.filter(p => searchInPayment(p, term)));
    setFilteredRefillPayments(refillPayments.filter(p => searchInPayment(p, term)));
    setFilteredBookings(allBookings.filter(b => b.email?.toLowerCase().includes(term)));
    setFilteredFeedback(myFeedback.filter(fb => fb.email?.toLowerCase().includes(term)));

  }, [searchTerm, allUsers, pendingRequests, initialPayments, refillPayments, allBookings, myFeedback]);

  // Handler functions
  const showNotification = (message, type = 'success') => setNotification({ show: true, message, type });
  const handleApprove = async (kycId, userEmail) => { /* ... (no change) ... */ };
  const handleReject = async (kycId, userEmail) => { /* ... (no change) ... */ };
  const handleDeleteUser = async (userEmail) => { /* ... (no change) ... */ };
  const handleSignOutClick = () => setShowSignOutPopup(true);
  const handleSignOutConfirm = () => { /* ... (no change) ... */ };
  const handleSignOutCancel = () => setShowSignOutPopup(false);

  // MODIFIED: handleSidebarNav now resets the search term
  const handleSidebarNav = (section) => {
    setSelectedItem(null);
    setActiveSection(section);
    setSearchTerm(""); // Reset search when changing sections
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const renderContent = () => {
    if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;
    if (error) return <p className="error-message">{error}</p>;

    if (selectedItem) {
        // This part remains unchanged
        switch (activeSection) {
            case 'users': return <UserDetail user={selectedItem} onBack={() => setSelectedItem(null)} onDeleteUser={handleDeleteUser} />;
            case 'requests-list': return <RequestDetail request={selectedItem} onBack={() => setSelectedItem(null)} onApprove={handleApprove} onReject={handleReject} />;
            case 'initial-payments': case 'refill-payments': return <PaymentDetail payment={selectedItem} onBack={() => setSelectedItem(null)} />;
            case 'auto-bookings': return <AutoBookingDetail booking={selectedItem} onBack={() => setSelectedItem(null)} />;
            default: setSelectedItem(null); return null;
        }
    }
    
    const getFeedbackCardClass = (type) => { /* ... (no change) ... */ };

    // MODIFIED: The switch statement now uses the filtered data arrays
    switch (activeSection) {
      case 'dashboard-summary':
        const totalPayments = initialPayments.length + refillPayments.length;
        return (
          <div className="card-grid">
            <Card title="Total Users"><p>{allUsers.length}</p></Card>
            <Card title="Active Connections"><p>{allUsers.filter(u => u.status === 'active').length}</p></Card>
            <Card title="Pending Requests"><p>{pendingRequests.length}</p></Card>
            <Card title="Initial Payments"><p>{initialPayments.length}</p></Card>
            <Card title="Refill Payments"><p>{refillPayments.length}</p></Card>
            <Card title="Total Bookings"><p>{allBookings.length}</p></Card>
            <Card title="Total Payments"><p>{totalPayments}</p></Card>
          </div>
        );

      case 'users':
        return (
          <div className="list-container">
            {filteredUsers.length === 0 ? <p>No users found.</p> : filteredUsers.map(user => (
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
            {filteredRequests.length === 0 ? <p>No pending requests found.</p> : filteredRequests.map(req => (
              <div key={req._id} className="list-item card clickable" onClick={() => setSelectedItem(req)}>
                <h4>{req.firstName} {req.lastName} ({req.email})</h4>
                <p><strong>Requested On:</strong> {new Date(req.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        );

      case 'initial-payments':
        return (
          <div className="list-container">
            {filteredInitialPayments.length === 0 ? <p>No initial payments found.</p> : filteredInitialPayments.map(p => (
              <div key={p._id} className="list-item card clickable" onClick={() => setSelectedItem(p)}>
                <h4>{p.customerName} (₹{p.amountDue})</h4>
                <p><strong>Date:</strong> {new Date(p.dateOfPayment || p.createdAt).toLocaleDateString()}</p>
                <p><strong>Type:</strong> <span className="payment-type initial">Initial Connection</span></p>
              </div>
            ))}
          </div>
        );

      case 'refill-payments':
        return (
          <div className="list-container">
            {filteredRefillPayments.length === 0 ? <p>No refill payments found.</p> : filteredRefillPayments.map(p => (
              <div key={p._id} className="list-item card clickable" onClick={() => setSelectedItem(p)}>
                <h4>{p.customerName} (₹{p.amountDue})</h4>
                <p><strong>Date:</strong> {new Date(p.dateOfPayment || p.createdAt).toLocaleDateString()}</p>
                <p><strong>Type:</strong> <span className="payment-type refill">Gas Refill</span></p>
              </div>
            ))}
          </div>
        );

      case 'auto-bookings':
        return (
          <div className="list-container">
            {filteredBookings.length === 0 ? <p>No bookings found.</p> : filteredBookings.map(b => (
              <div key={b._id} className="list-item card clickable" onClick={() => setSelectedItem(b)}>
                <h4>{b.email}</h4>
                <p><strong>Booked On:</strong> {new Date(b.bookingDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span className={`status ${b.status}`}>{b.status}</span></p>
                {b.status === 'cancelled' && <p><strong>Cancelled On:</strong> {new Date(b.updatedAt).toLocaleDateString()}</p>}
              </div>
            ))}
          </div>
        );

      case 'my-feedback':
        return (
          <div className="list-container">
            {filteredFeedback.length === 0 ? <p>No feedback messages found.</p> : filteredFeedback.map(fb => (
              <div key={fb._id} className={`list-item card feedback-card ${getFeedbackCardClass(fb.type)}`}>
                <div className="feedback-header"><h4>{fb.email}</h4><span className="feedback-type">{fb.type}</span></div>
                <p className="feedback-message">{fb.message}</p>
                <p className="feedback-date"><strong>Received On:</strong> {new Date(fb.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        );
        
      default:
        return <p className="coming-soon">This section is under construction.</p>;
    }
  };

  const getSectionTitle = () => { /* ... (no change) ... */ };
  
  const myUrgentFeedbackCount = myFeedback.filter(fb => fb.type === 'Urgent').length;
  const pendingBookingsCount = allBookings.filter(b => b.status === 'booked').length;
  
  // NEW: A flag to determine if the search bar should be visible
  const isSearchable = ['users', 'requests-list', 'initial-payments', 'refill-payments', 'auto-bookings', 'my-feedback'].includes(activeSection);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        {/* Sidebar content remains unchanged */}
        <h2 className="logo">Admin Panel</h2>
        <nav>
          <ul>
            <li className={activeSection === 'dashboard-summary' ? 'active' : ''} onClick={() => handleSidebarNav('dashboard-summary')}>Dashboard</li>
            <li className={activeSection === 'users' ? 'active' : ''} onClick={() => handleSidebarNav('users')}>Users</li>
            <li className={activeSection === 'requests-list' ? 'active' : ''} onClick={() => handleSidebarNav('requests-list')}>Requests {pendingRequests.length > 0 && <span className="pending-count">({pendingRequests.length})</span>}</li>
            <li className={activeSection === 'initial-payments' ? 'active' : ''} onClick={() => handleSidebarNav('initial-payments')}>Initial Payments</li>
            <li className={activeSection === 'refill-payments' ? 'active' : ''} onClick={() => handleSidebarNav('refill-payments')}>Refill Payments</li>
            <li className={activeSection === 'auto-bookings' ? 'active' : ''} onClick={() => handleSidebarNav('auto-bookings')}>Bookings {pendingBookingsCount > 0 && <span className="pending-count">({pendingBookingsCount})</span>}</li>
            <li className={activeSection === 'my-feedback' ? 'active' : ''} onClick={() => handleSidebarNav('my-feedback')}>
              Feedback 
              {myUrgentFeedbackCount > 0 && <span className="pending-count urgent-count">({myUrgentFeedbackCount})</span>}
            </li>
          </ul>
        </nav>
        <div className="user-info">
            <div className="avatar"></div>
            <div>
                <p className="username">Admin User</p>
                <p className="signout" onClick={handleSignOutClick}>Sign Out</p>
            </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-center">
          {/* MODIFIED: Header now includes the search bar */}
          <div className="page-header">
            <h1 className="page-title">{getSectionTitle()}</h1>
            {isSearchable && !selectedItem && (
              <div className="search-bar-container">
                <input
                  type="text"
                  placeholder="Search by email, name, or phone..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </div>
            )}
          </div>
          {renderContent()}
        </div>
      </main>

      {/* Popups remain unchanged */}
      {notification.show && ( <div className="popup-overlay"><div className={`popup-content notification ${notification.type}`}><h3>{notification.type === 'success' ? '✅ Success' : '❌ Error'}</h3><p>{notification.message}</p><button onClick={() => setNotification({ ...notification, show: false })} className="popup-ok">OK</button></div></div> )}
      {showSignOutPopup && ( <div className="popup-overlay"><div className="popup-content"><h3>Confirm Sign Out</h3><p>Are you sure you want to sign out?</p><div className="popup-buttons"><button onClick={handleSignOutConfirm} className="confirm-yes">Yes, Sign Out</button><button onClick={handleSignOutCancel} className="confirm-no">Cancel</button></div></div></div> )}
    </div>
  );
}