import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/adminDashboard.css"; // Ensure this path is correct

// ===================================================================================
//  1. SUB-COMPONENTS & HELPERS
// ===================================================================================

const formatBookingStatus = (status) => {
  return (status || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

function Card({ title, children }) {
  return (
    <div className="card">
      {title && <h3>{title}</h3>}
      <div>{children}</div>
    </div>
  );
}

function SearchBar({ section, placeholder, value, onChange, onClear }) {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(section, e.target.value)}
        className="search-input"
      />
      <span className="search-icon">🔍</span>
      {value && (
        <button
          onClick={() => onClear(section, '')}
          className="clear-search-btn"
          title="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function ResultsCount({ total, filtered, query }) {
  return (
    <div className="results-count">
      {query ? (
        <span>Showing {filtered} of {total} results for "{query}"</span>
      ) : (
        <span>Total: {total} items</span>
      )}
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
        <p><strong>Event Date:</strong> {new Date(booking.updatedAt).toLocaleString()}</p>
        <p><strong>Status:</strong> <span className={`status ${booking.status}`}>{formatBookingStatus(booking.status)}</span></p>
        <p><strong>Booking ID:</strong> {booking._id}</p>
      </div>
    </div>
  );
}

// ===================================================================================
//  2. MAIN DASHBOARD COMPONENT
// ===================================================================================

export default function Dashboard() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [initialPayments, setInitialPayments] = useState([]);
  const [refillPayments, setRefillPayments] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard-summary');
  const [selectedItem, setSelectedItem] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showSignOutPopup, setShowSignOutPopup] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDate, setReportDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const [searchQueries, setSearchQueries] = useState({
    users: '',
    requests: '',
    initialPayments: '',
    refillPayments: '',
    bookings: '',
    feedback: ''
  });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        requestsRes, usersRes, paymentsRes,
        allBookingsRes,
        myFeedbackRes
      ] = await Promise.all([
        axios.get("http://localhost:5000/api/newconnection/requests/pending"),
        axios.get("http://localhost:5000/api/newconnection"),
        axios.get("http://localhost:5000/api/payment"),
        axios.get("http://localhost:5000/api/autobooking/all"),
        axios.get("http://localhost:5000/api/myfeedback")
      ]);

      setPendingRequests(requestsRes.data);
      setAllUsers(usersRes.data);
      setAllPayments(paymentsRes.data);
      
      // Improved payment filtering with better logging
      const initialPayments = paymentsRes.data.filter(p => 
        p.paymentType === 'initial_connection' || !p.paymentType
      );
      const refillPayments = paymentsRes.data.filter(p => 
        p.paymentType === 'gas_refill'
      );
      
      console.log(`📊 Admin Dashboard Payment Summary:`);
      console.log(`   - Total payments: ${paymentsRes.data.length}`);
      console.log(`   - Initial payments: ${initialPayments.length}`);
      console.log(`   - Refill payments: ${refillPayments.length}`);
      
      setInitialPayments(initialPayments);
      setRefillPayments(refillPayments);
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
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
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

  const handleSignOutClick = () => setShowSignOutPopup(true);
  
  const handleSignOutConfirm = () => {
    setShowSignOutPopup(false);
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const handleSignOutCancel = () => setShowSignOutPopup(false);

  const handleSidebarNav = (section) => {
    setSelectedItem(null);
    setActiveSection(section);
  };

  // ========================================================
  //  ✅ --- REPORT GENERATION LOGIC ---
  // ========================================================
  
  const generateReport = async () => {
    if (!reportDate) {
      showNotification("Please select a month and year to generate a report.", 'error');
      return;
    }
    
    setGeneratingReport(true);
    setReportData(null); // Clear previous report

    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const [year, month] = reportDate.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      
      const filterByMonth = (items, dateField = 'createdAt') => {
        return items.filter(item => {
          const itemDate = new Date(item[dateField]);
          return itemDate >= startDate && itemDate <= endDate;
        });
      };

      // Calculate statistics
      const monthlyNewUsers = filterByMonth(allUsers, 'createdAt');
      const monthlyDeactivatedUsers = allUsers.filter(user => 
        user.status === 'deactivated' && 
        new Date(user.updatedAt) >= startDate && 
        new Date(user.updatedAt) <= endDate
      );
      const monthlyBookings = filterByMonth(allBookings, 'createdAt');
      const monthlyCancelledBookings = monthlyBookings.filter(b => b.status === 'cancelled');
      const monthlyInitialPayments = filterByMonth(initialPayments, 'createdAt');
      const monthlyRefillPayments = filterByMonth(refillPayments, 'createdAt');
      
      const totalRevenue = [...monthlyInitialPayments, ...monthlyRefillPayments]
        .reduce((sum, payment) => sum + (payment.amountDue || 0), 0);

      const report = {
        month: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        newUsers: monthlyNewUsers.length,
        deactivatedUsers: monthlyDeactivatedUsers.length,
        approvedRequests: monthlyNewUsers.filter(u => u.status !== 'pending_approval').length,
        totalBookings: monthlyBookings.length,
        cancelledBookings: monthlyCancelledBookings.length,
        initialPayments: monthlyInitialPayments.length,
        refillPayments: monthlyRefillPayments.length,
        totalRevenue: totalRevenue.toFixed(2),
        // Store detailed data for download
        details: {
          monthlyInitialPayments,
          monthlyRefillPayments
        }
      };
      
      setReportData(report);

    } catch (e) {
      showNotification("An error occurred while generating the report.", 'error');
    } finally {
      setGeneratingReport(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) {
      showNotification("Please generate a report first.", 'error');
      return;
    }

    let content = `Quick LPG Connect - Monthly Report\n`;
    content += `Month: ${reportData.month}\n\n`;
    content += `========================================\n`;
    content += `SUMMARY\n`;
    content += `========================================\n`;
    content += `New Users: ${reportData.newUsers}\n`;
    content += `Deactivated Users: ${reportData.deactivatedUsers}\n`;
    content += `Total Bookings: ${reportData.totalBookings}\n`;
    content += `Cancelled Bookings: ${reportData.cancelledBookings}\n`;
    content += `Initial Connection Payments: ${reportData.initialPayments}\n`;
    content += `Gas Refill Payments: ${reportData.refillPayments}\n`;
    content += `----------------------------------------\n`;
    content += `TOTAL REVENUE: ₹${reportData.totalRevenue}\n`;
    content += `========================================\n\n`;

    content += `DETAILED PAYMENTS\n`;
    content += `========================================\n`;
    content += `Initial Payments:\n`;
    if (reportData.details.monthlyInitialPayments.length > 0) {
      reportData.details.monthlyInitialPayments.forEach(p => {
        content += `- ${p.customerName} (${p.email}) paid ₹${p.amountDue} on ${new Date(p.createdAt).toLocaleDateString()}\n`;
      });
    } else {
      content += `- None\n`;
    }
    
    content += `\nRefill Payments:\n`;
    if (reportData.details.monthlyRefillPayments.length > 0) {
      reportData.details.monthlyRefillPayments.forEach(p => {
        content += `- ${p.customerName} (${p.email}) paid ₹${p.amountDue} on ${new Date(p.createdAt).toLocaleDateString()}\n`;
      });
    } else {
      content += `- None\n`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  // ========================================================

  const handleSearchChange = (section, value) => {
    setSearchQueries(prev => ({ ...prev, [section]: value.toLowerCase() }));
  };

  const filterBySearch = (items, query, searchFields) => {
    if (!query.trim()) return items;
    return items.filter(item =>
      searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value && value.toString().toLowerCase().includes(query);
      })
    );
  };

  const getFilteredUsers = () => filterBySearch(allUsers, searchQueries.users, ['firstName', 'lastName', 'email', 'mobileNumber']);
  const getFilteredRequests = () => filterBySearch(pendingRequests, searchQueries.requests, ['firstName', 'lastName', 'email', 'mobileNumber']);
  const getFilteredInitialPayments = () => filterBySearch(initialPayments, searchQueries.initialPayments, ['customerName', 'email']);
  const getFilteredRefillPayments = () => filterBySearch(refillPayments, searchQueries.refillPayments, ['customerName', 'email']);
  const getFilteredFeedback = () => filterBySearch(myFeedback, searchQueries.feedback, ['email']);
  const getFilteredBookings = () => filterBySearch(allBookings, searchQueries.bookings, ['email', 'status']);

  const renderContent = () => {
    if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;
    if (error) return <p className="error-message">{error}</p>;

    if (selectedItem) {
      switch (activeSection) {
        case 'users': return <UserDetail user={selectedItem} onBack={() => setSelectedItem(null)} onDeleteUser={handleDeleteUser} />;
        case 'requests-list': return <RequestDetail request={selectedItem} onBack={() => setSelectedItem(null)} onApprove={handleApprove} onReject={handleReject} />;
        case 'initial-payments':
        case 'refill-payments':
          return <PaymentDetail payment={selectedItem} onBack={() => setSelectedItem(null)} />;
        case 'auto-bookings':
          return <AutoBookingDetail booking={selectedItem} onBack={() => setSelectedItem(null)} />;
        default: setSelectedItem(null); return null;
      }
    }

    const getFeedbackCardClass = (type) => {
      switch (type) {
        case 'Urgent': return 'urgent';
        case 'Complaint': return 'complaint';
        default: return '';
      }
    };

    switch (activeSection) {
      case 'dashboard-summary':
        return (
          <div className="card-grid">
            <Card title="Total Users"><p>{allUsers.length}</p></Card>
            <Card title="Active Connections"><p>{allUsers.filter(u => u.status === 'active').length}</p></Card>
            <Card title="Pending Requests"><p>{pendingRequests.length}</p></Card>
            <Card title="Pending Bookings"><p>{allBookings.filter(b => b.status === 'booking_pending').length}</p></Card>
            <Card title="Fulfilled Bookings"><p>{allBookings.filter(b => b.status === 'fulfilled').length}</p></Card>
            <Card title="Initial Payments"><p>{initialPayments.length}</p></Card>
            <Card title="Refill Payments"><p>{refillPayments.length}</p></Card>
            <Card title="Total Revenue">
              <p>₹{allPayments.reduce((total, payment) => total + (payment.amountDue || 0), 0)}</p>
            </Card>
            <div className="card">
              <h3>📊 Generate Report</h3>
              <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '1rem' }}>
                Generate comprehensive monthly reports.
              </p>
              <button onClick={() => setShowReportModal(true)} className="report-btn">
                📊 Generate Monthly Report
              </button>
            </div>
          </div>
        );

      case 'users':
        const filteredUsers = getFilteredUsers();
        return (
          <div>
            <SearchBar section="users" placeholder="Search users by name, email, or phone..." value={searchQueries.users} onChange={handleSearchChange} onClear={handleSearchChange} />
            <ResultsCount total={allUsers.length} filtered={filteredUsers.length} query={searchQueries.users} />
            <div className="list-container">
              {filteredUsers.length > 0 ? filteredUsers.map(user => (
                <div key={user._id} className="list-item card clickable" onClick={() => setSelectedItem(user)}>
                  <h4>{user.firstName} {user.lastName} ({user.email})</h4>
                  <p><strong>Phone:</strong> {user.mobileNumber}</p>
                  <p><strong>Status:</strong> <span className={`status ${user.status}`}>{user.status.replace(/_/g, ' ')}</span></p>
                </div>
              )) : <p className="no-results">No users found.</p>}
            </div>
          </div>
        );

      case 'requests-list':
        const filteredRequests = getFilteredRequests();
        return (
          <div>
            <SearchBar section="requests" placeholder="Search requests by name, email, or phone..." value={searchQueries.requests} onChange={handleSearchChange} onClear={handleSearchChange} />
            <ResultsCount total={pendingRequests.length} filtered={filteredRequests.length} query={searchQueries.requests} />
            <div className="list-container">
              {filteredRequests.length > 0 ? filteredRequests.map(req => (
                <div key={req._id} className="list-item card clickable" onClick={() => setSelectedItem(req)}>
                  <h4>{req.firstName} {req.lastName} ({req.email})</h4>
                  <p><strong>Phone:</strong> {req.mobileNumber}</p>
                  <p><strong>Requested On:</strong> {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              )) : <p className="no-results">No pending requests.</p>}
            </div>
          </div>
        );

      case 'initial-payments':
        const filteredInitialPayments = getFilteredInitialPayments();
        return (
          <div>
            <SearchBar section="initialPayments" placeholder="Search by customer name or email..." value={searchQueries.initialPayments} onChange={handleSearchChange} onClear={handleSearchChange} />
            <ResultsCount total={initialPayments.length} filtered={filteredInitialPayments.length} query={searchQueries.initialPayments} />
            <div className="list-container">
              {filteredInitialPayments.length > 0 ? filteredInitialPayments.map(p => (
                <div key={p._id} className="list-item card clickable" onClick={() => setSelectedItem(p)}>
                  <h4>{p.customerName} (₹{p.amountDue})</h4>
                  <p><strong>Email:</strong> {p.email}</p>
                  <p><strong>Date:</strong> {new Date(p.dateOfPayment || p.createdAt).toLocaleDateString()}</p>
                </div>
              )) : <p className="no-results">No initial payments found.</p>}
            </div>
          </div>
        );

      case 'refill-payments':
        const filteredRefillPayments = getFilteredRefillPayments();
        return (
          <div>
            <SearchBar section="refillPayments" placeholder="Search by customer name or email..." value={searchQueries.refillPayments} onChange={handleSearchChange} onClear={handleSearchChange} />
            <ResultsCount total={refillPayments.length} filtered={filteredRefillPayments.length} query={searchQueries.refillPayments} />
            <div className="list-container">
              {filteredRefillPayments.length > 0 ? filteredRefillPayments.map(p => (
                <div key={p._id} className="list-item card clickable" onClick={() => setSelectedItem(p)}>
                  <h4>{p.customerName} (₹{p.amountDue})</h4>
                  <p><strong>Email:</strong> {p.email}</p>
                  <p><strong>Date:</strong> {new Date(p.dateOfPayment || p.createdAt).toLocaleDateString()}</p>
                  <p><strong>Type:</strong> <span className="payment-type refill">Gas Refill</span></p>
                </div>
              )) : <p className="no-results">No refill payments found.</p>}
            </div>
          </div>
        );

      case 'auto-bookings':
        const filteredBookings = getFilteredBookings();
        return (
          <div>
            <SearchBar
              section="bookings"
              placeholder="Search bookings by email or status..."
              value={searchQueries.bookings}
              onChange={handleSearchChange}
              onClear={handleSearchChange}
            />
            <ResultsCount total={allBookings.length} filtered={filteredBookings.length} query={searchQueries.bookings} />
            <div className="list-container">
              {filteredBookings.length > 0 ? filteredBookings.map(b => (
                <div key={b._id} className="list-item card clickable" onClick={() => setSelectedItem(b)}>
                  <h4>{b.email}</h4>
                  <p><strong>Event Date:</strong> {new Date(b.updatedAt).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> <span className={`status ${b.status}`}>{formatBookingStatus(b.status)}</span></p>
                </div>
              )) : <p className="no-results">No bookings found.</p>}
            </div>
          </div>
        );

      case 'my-feedback':
        const filteredFeedback = getFilteredFeedback();
        return (
          <div>
            <SearchBar section="feedback" placeholder="Search feedback by email..." value={searchQueries.feedback} onChange={handleSearchChange} onClear={handleSearchChange} />
            <ResultsCount total={myFeedback.length} filtered={filteredFeedback.length} query={searchQueries.feedback} />
            <div className="list-container">
              {filteredFeedback.length > 0 ? filteredFeedback.map(fb => (
                <div key={fb._id} className={`list-item card feedback-card ${getFeedbackCardClass(fb.type)}`}>
                  <div className="feedback-header">
                    <h4>{fb.email}</h4>
                    <span className="feedback-type">{fb.type}</span>
                  </div>
                  <p className="feedback-message">{fb.message}</p>
                  <p className="feedback-date"><strong>Received On:</strong> {new Date(fb.createdAt).toLocaleString()}</p>
                </div>
              )) : <p className="no-results">No feedback messages found.</p>}
            </div>
          </div>
        );

      default: return <p className="coming-soon">This section is under construction.</p>;
    }
  };
  
  const getSectionTitle = () => {
    if (selectedItem) return "Details View";
    const titles = {
      'dashboard-summary': 'Dashboard Summary',
      'users': 'All Users',
      'requests-list': 'Pending Connection Requests',
      'initial-payments': 'Initial Connection Payments',
      'refill-payments': 'Gas Refill Payments',
      'auto-bookings': 'All Bookings',
      'my-feedback': "Feedback"
    };
    return titles[activeSection] || 'Admin Panel';
  };

  const pendingBookingsCount = allBookings.filter(b => b.status === 'booking_pending').length;
  const myUrgentFeedbackCount = myFeedback.filter(fb => fb.type === 'Urgent').length;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2 className="logo">Admin Panel</h2>
        <nav>
          <ul>
            <li className={activeSection === 'dashboard-summary' ? 'active' : ''} onClick={() => handleSidebarNav('dashboard-summary')}>Dashboard</li>
            <li className={activeSection === 'users' ? 'active' : ''} onClick={() => handleSidebarNav('users')}>Users</li>
            <li className={activeSection === 'requests-list' ? 'active' : ''} onClick={() => handleSidebarNav('requests-list')}>Requests {pendingRequests.length > 0 && <span className="pending-count">({pendingRequests.length})</span>}</li>
            <li className={activeSection === 'initial-payments' ? 'active' : ''} onClick={() => handleSidebarNav('initial-payments')}>Initial Payments</li>
            <li className={activeSection === 'refill-payments' ? 'active' : ''} onClick={() => handleSidebarNav('refill-payments')}>Refill Payments</li>
            <li className={activeSection === 'auto-bookings' ? 'active' : ''} onClick={() => handleSidebarNav('auto-bookings')}>
              Bookings {pendingBookingsCount > 0 && <span className="pending-count">({pendingBookingsCount})</span>}
            </li>
            <li className={activeSection === 'my-feedback' ? 'active' : ''} onClick={() => handleSidebarNav('my-feedback')}>
              Feedback {myUrgentFeedbackCount > 0 && <span className="pending-count urgent-count">({myUrgentFeedbackCount})</span>}
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
      {showSignOutPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Sign Out</h3>
            <p>Are you sure you want to sign out?</p>
            <div className="popup-buttons">
              <button onClick={handleSignOutConfirm} className="confirm-yes">Yes, Sign Out</button>
              <button onClick={handleSignOutCancel} className="confirm-no">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showReportModal && (
         <div className="popup-overlay">
          <div className="popup-content report-modal">
            <h3>📊 Generate Monthly Report</h3>
            <p>Select a month and year to generate a comprehensive report.</p>
            <div className="report-form">
              <label htmlFor="reportDate">Select Month and Year:</label>
              <input type="month" id="reportDate" value={reportDate} onChange={(e) => setReportDate(e.target.value)} max={new Date().toISOString().slice(0, 7)} />
              <div className="popup-buttons">
                <button onClick={generateReport} disabled={generatingReport} className="confirm-yes">
                  {generatingReport ? 'Generating...' : '📊 Generate Report'}
                </button>
                <button onClick={() => { setShowReportModal(false); setReportData(null); setReportDate(''); }} className="confirm-no">
                  Cancel
                </button>
              </div>
            </div>
            {reportData && (
              <div className="report-results">
                <h4>📊 Report for {reportData.month}</h4>
                <div className="report-summary">
                  <div className="report-grid">
                    <div className="report-item"><span className="report-label">👥 New Users:</span><span className="report-value">{reportData.newUsers}</span></div>
                    <div className="report-item"><span className="report-label">❌ Deactivated Users:</span><span className="report-value">{reportData.deactivatedUsers}</span></div>
                    <div className="report-item"><span className="report-label">✅ Approved Requests:</span><span className="report-value">{reportData.approvedRequests}</span></div>
                    <div className="report-item"><span className="report-label">📋 Total Bookings:</span><span className="report-value">{reportData.totalBookings}</span></div>
                    <div className="report-item"><span className="report-label">🚫 Cancelled Bookings:</span><span className="report-value">{reportData.cancelledBookings}</span></div>