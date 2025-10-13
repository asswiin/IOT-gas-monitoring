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

  // NEW: Report-related state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDate, setReportDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
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
      
      // Separate payments by type
      const initial = paymentsRes.data.filter(payment => 
        payment.paymentType === 'initial_connection' || !payment.paymentType
      );
      const refill = paymentsRes.data.filter(payment => 
        payment.paymentType === 'gas_refill'
      );
      
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
    
    // Add auto-refresh every 10 seconds to catch real-time updates
    const interval = setInterval(fetchData, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handler functions remain unchanged
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

  const handleSignOutClick = () => {
    setShowSignOutPopup(true);
  };

  const handleSignOutConfirm = () => {
    setShowSignOutPopup(false);
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const handleSignOutCancel = () => {
    setShowSignOutPopup(false);
  };

  const handleSidebarNav = (section) => {
    setSelectedItem(null);
    setActiveSection(section);
  };

  // NEW: Generate comprehensive monthly report
  const generateReport = async () => {
    if (!reportDate) {
      alert('Please select a date for the report');
      return;
    }

    setGeneratingReport(true);
    try {
      const selectedDate = new Date(reportDate);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      
      // Start and end of the selected month
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

      // Filter data for the selected month
      const newUsersInMonth = allUsers.filter(user => {
        const joinDate = new Date(user.createdAt);
        return joinDate >= startOfMonth && joinDate <= endOfMonth;
      });

      const deactivatedUsersInMonth = allUsers.filter(user => {
        const updateDate = new Date(user.updatedAt || user.createdAt);
        return user.status === 'deactivated' && updateDate >= startOfMonth && updateDate <= endOfMonth;
      });

      const autoBookingsInMonth = allBookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate >= startOfMonth && bookingDate <= endOfMonth;
      });

      const refillPaymentsInMonth = refillPayments.filter(payment => {
        const paymentDate = new Date(payment.dateOfPayment || payment.createdAt);
        return paymentDate >= startOfMonth && paymentDate <= endOfMonth;
      });

      const initialPaymentsInMonth = initialPayments.filter(payment => {
        const paymentDate = new Date(payment.dateOfPayment || payment.createdAt);
        return paymentDate >= startOfMonth && paymentDate <= endOfMonth;
      });

      const cancelledBookingsInMonth = allBookings.filter(booking => {
        const cancelDate = new Date(booking.updatedAt);
        return booking.status === 'cancelled' && cancelDate >= startOfMonth && cancelDate <= endOfMonth;
      });

      const approvedRequestsInMonth = allUsers.filter(user => {
        const updateDate = new Date(user.updatedAt || user.createdAt);
        return user.status === 'approved' && updateDate >= startOfMonth && updateDate <= endOfMonth;
      });

      const monthName = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

      // Calculate revenue (assuming ₹900 per payment)
      const totalRevenue = (refillPaymentsInMonth.length + initialPaymentsInMonth.length) * 900;

      setReportData({
        month: monthName,
        year: year,
        newUsers: newUsersInMonth.length,
        deactivatedUsers: deactivatedUsersInMonth.length,
        totalBookings: autoBookingsInMonth.length,
        cancelledBookings: cancelledBookingsInMonth.length,
        activeBookings: autoBookingsInMonth.filter(b => b.status === 'booked').length,
        refillPayments: refillPaymentsInMonth.length,
        initialPayments: initialPaymentsInMonth.length,
        approvedRequests: approvedRequestsInMonth.length,
        totalRevenue: totalRevenue,
        details: {
          newUsersData: newUsersInMonth,
          deactivatedUsersData: deactivatedUsersInMonth,
          bookingsData: autoBookingsInMonth,
          refillPaymentsData: refillPaymentsInMonth,
          initialPaymentsData: initialPaymentsInMonth,
          approvedRequestsData: approvedRequestsInMonth
        }
      });

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  // NEW: Download report as text file
  const downloadReport = () => {
    if (!reportData) return;

    const reportContent = `
MONTHLY REPORT - ${reportData.month}
=====================================

SUMMARY STATISTICS:
- New Users Joined: ${reportData.newUsers}
- Users Deactivated: ${reportData.deactivatedUsers}
- Requests Approved: ${reportData.approvedRequests}
- Total Auto-Bookings: ${reportData.totalBookings}
- Active Bookings: ${reportData.activeBookings}
- Cancelled Bookings: ${reportData.cancelledBookings}
- Refill Payments: ${reportData.refillPayments}
- Initial Connection Payments: ${reportData.initialPayments}
- Total Revenue Generated: ₹${reportData.totalRevenue}

DETAILED BREAKDOWN:
==================

NEW USERS JOINED (${reportData.newUsers}):
${reportData.details.newUsersData.map(user => 
  `- ${user.firstName} ${user.lastName} (${user.email}) - Joined: ${new Date(user.createdAt).toLocaleDateString()}`
).join('\n') || 'No new users this month'}

USERS DEACTIVATED (${reportData.deactivatedUsers}):
${reportData.details.deactivatedUsersData.map(user => 
  `- ${user.firstName} ${user.lastName} (${user.email}) - Deactivated: ${new Date(user.updatedAt).toLocaleDateString()}`
).join('\n') || 'No users deactivated this month'}

AUTO-BOOKINGS MADE (${reportData.totalBookings}):
${reportData.details.bookingsData.map(booking => 
  `- ${booking.email} - ${booking.status} - Date: ${new Date(booking.bookingDate).toLocaleDateString()}`
).join('\n') || 'No bookings made this month'}

REFILL PAYMENTS (${reportData.refillPayments}):
${reportData.details.refillPaymentsData.map(payment => 
  `- ${payment.customerName} - ₹${payment.amountDue} - Date: ${new Date(payment.dateOfPayment || payment.createdAt).toLocaleDateString()}`
).join('\n') || 'No refill payments this month'}

INITIAL CONNECTION PAYMENTS (${reportData.initialPayments}):
${reportData.details.initialPaymentsData.map(payment => 
  `- ${payment.customerName} - ₹${payment.amountDue} - Date: ${new Date(payment.dateOfPayment || payment.createdAt).toLocaleDateString()}`
).join('\n') || 'No initial payments this month'}

Report Generated: ${new Date().toLocaleString()}
Administrator: Quick LPG Connect Admin Panel
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Monthly_Report_${reportData.month.replace(' ', '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        case 'auto-bookings': return <AutoBookingDetail booking={selectedItem} onBack={() => setSelectedItem(null)} />;
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
            <Card title="Initial Payments"><p>{initialPayments.length}</p></Card>
            <Card title="Refill Payments"><p>{refillPayments.length}</p></Card>
            <Card title="Total Bookings"><p>{allBookings.length}</p></Card>
            <Card title="Total Payments"><p>{allPayments.length}</p></Card>
            <div className="card">
              <h3>📊 Generate Report</h3>
              <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '1rem' }}>
                Generate comprehensive monthly reports with detailed statistics
              </p>
              <button 
                onClick={() => setShowReportModal(true)} 
                className="report-btn"
                style={{
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  width: '100%'
                }}
              >
                📊 Generate Monthly Report
              </button>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="list-container">
            {allUsers.map(user => (
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
            {pendingRequests.map(req => (
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
            {initialPayments.length === 0 ? <p>No initial connection payments found.</p> : initialPayments.map(p => (
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
            {refillPayments.length === 0 ? <p>No refill payments found.</p> : refillPayments.map(p => (
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
            {allBookings.length === 0 ? <p>No bookings found.</p> : allBookings.map(b => (
              <div key={b._id} className="list-item card clickable" onClick={() => setSelectedItem(b)}>
                <h4>{b.email}</h4>
                <p><strong>Booked On:</strong> {new Date(b.bookingDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span className={`status ${b.status}`}>{b.status}</span></p>
                {b.status === 'cancelled' && (
                  <p><strong>Cancelled On:</strong> {new Date(b.updatedAt).toLocaleDateString()}</p>
                )}
              </div>
            ))}
          </div>
        );

      case 'my-feedback':
        return (
          <div className="list-container">
            {myFeedback.length === 0 ? <p>You have no personal feedback messages yet.</p> : myFeedback.map(fb => (
              <div key={fb._id} className={`list-item card feedback-card ${getFeedbackCardClass(fb.type)}`}>
                <div className="feedback-header">
                  <h4>{fb.email}</h4>
                  <span className="feedback-type">{fb.type}</span>
                </div>
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

  const getSectionTitle = () => {
    if (selectedItem) return "Details View";
    const titles = {
      'dashboard-summary': 'Dashboard Summary',
      'users': 'All Users',
      'requests-list': 'Pending Connection Requests',
      'initial-payments': 'Initial Connection Payments',
      'refill-payments': 'Gas Refill Payments',
      'auto-bookings': 'Bookings',
      'my-feedback': "Feedback"
    };
    return titles[activeSection] || 'Admin Panel';
  };
  
  const myUrgentFeedbackCount = myFeedback.filter(fb => fb.type === 'Urgent').length;
  const pendingBookingsCount = allBookings.filter(b => b.status === 'booked').length;

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
            <li className={activeSection === 'auto-bookings' ? 'active' : ''} onClick={() => handleSidebarNav('auto-bookings')}>Bookings {pendingBookingsCount > 0 && <span className="pending-count">({pendingBookingsCount})</span>}</li>
            <li className={activeSection === 'my-feedback' ? 'active' : ''} onClick={() => handleSidebarNav('my-feedback')}>
              Feedback 
              {myUrgentFeedbackCount > 0 && 
                <span className="pending-count urgent-count">({myUrgentFeedbackCount})</span>
              }
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

      {/* Popups remain unchanged */}
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

      {/* NEW: Report Generation Modal */}
      {showReportModal && (
        <div className="popup-overlay">
          <div className="popup-content report-modal">
            <h3>📊 Generate Monthly Report</h3>
            <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Select a month and year to generate a comprehensive report including user statistics, bookings, payments, and revenue data.
            </p>
            <div className="report-form">
              <label htmlFor="reportDate">Select Month and Year:</label>
              <input
                type="month"
                id="reportDate"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                max={new Date().toISOString().slice(0, 7)}
                style={{
                  padding: '0.5rem',
                  margin: '1rem 0',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '100%',
                  fontSize: '1rem'
                }}
              />
              <div className="popup-buttons">
                <button 
                  onClick={generateReport} 
                  disabled={generatingReport}
                  className="confirm-yes"
                >
                  {generatingReport ? 'Generating...' : '📊 Generate Report'}
                </button>
                <button 
                  onClick={() => {
                    setShowReportModal(false);
                    setReportData(null);
                    setReportDate('');
                  }} 
                  className="confirm-no"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Display Generated Report */}
            {reportData && (
              <div className="report-results">
                <h4>📊 Report for {reportData.month}</h4>
                <div className="report-summary">
                  <div className="report-grid">
                    <div className="report-item">
                      <span className="report-label">👥 New Users:</span>
                      <span className="report-value">{reportData.newUsers}</span>
                    </div>
                    <div className="report-item">
                      <span className="report-label">❌ Deactivated Users:</span>
                      <span className="report-value">{reportData.deactivatedUsers}</span>
                    </div>
                    <div className="report-item">
                      <span className="report-label">✅ Approved Requests:</span>
                      <span className="report-value">{reportData.approvedRequests}</span>
                    </div>
                    <div className="report-item">
                      <span className="report-label">📋 Total Bookings:</span>
                      <span className="report-value">{reportData.totalBookings}</span>
                    </div>
                    <div className="report-item">
                      <span className="report-label">🚫 Cancelled Bookings:</span>
                      <span className="report-value">{reportData.cancelledBookings}</span>
                    </div>
                    <div className="report-item">
                      <span className="report-label">🔄 Refill Payments:</span>
                      <span className="report-value">{reportData.refillPayments}</span>
                    </div>
                    <div className="report-item">
                      <span className="report-label">🆕 Initial Payments:</span>
                      <span className="report-value">{reportData.initialPayments}</span>
                    </div>
                    <div className="report-item highlight">
                      <span className="report-label">💰 Total Revenue:</span>
                      <span className="report-value">₹{reportData.totalRevenue}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={downloadReport} 
                  className="download-btn"
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginTop: '1rem',
                    width: '100%'
                  }}
                >
                  📥 Download Detailed Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
















