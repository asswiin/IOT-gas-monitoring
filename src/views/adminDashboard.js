// --- START OF FILE AdminDashboard.js ---

import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/adminDashboard.css"; // Ensure your CSS is correctly linked

// Reusable Card component (no change)
function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

// RequestDetail component (mostly unchanged, just passed props differently)
function RequestDetail({ request, onApprove, onReject, onBack }) {
  if (!request) return null;

  return (
    <div className="request-detail-card card">
      <button onClick={onBack} className="back-btn">← Back to Requests List</button>
      <h3>Connection Request Details</h3>
      <div className="detail-section">
        <h4>1) Personal Details</h4>
        <p><strong>Salutation:</strong> {request.salutation}</p>
        <p><strong>Full Name:</strong> {request.firstName} {request.middleName} {request.lastName}</p>
        <p><strong>Date of Birth:</strong> {new Date(request.dob).toLocaleDateString()}</p>
        <p><strong>Father's Name:</strong> {request.fatherName || 'N/A'}</p>
        <p><strong>Spouse Name:</strong> {request.spouseName || 'N/A'}</p>
        <p><strong>Mother's Name:</strong> {request.motherName || 'N/A'}</p>
      </div>

      <div className="detail-section">
        <h4>2) Address / Contact Information</h4>
        <p><strong>House/Flat #:</strong> {request.houseName}</p>
        <p><strong>Floor No:</strong> {request.floorNo || 'N/A'}</p>
        <p><strong>Housing Complex:</strong> {request.housingComplex || 'N/A'}</p>
        <p><strong>Street Name:</strong> {request.streetName}</p>
        <p><strong>Landmark:</strong> {request.landmark}</p>
        <p><strong>City:</strong> {request.city}</p>
        <p><strong>District:</strong> {request.district}</p>
        <p><strong>State:</strong> {request.state}</p>
        <p><strong>Pin Code:</strong> {request.pinCode}</p>
        <p><strong>Mobile Number:</strong> {request.mobileNumber}</p>
        <p><strong>Telephone Number:</strong> {request.telephoneNumber || 'N/A'}</p>
        <p><strong>Email:</strong> {request.email}</p>
      </div>

      <p><strong>Requested On:</strong> {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}</p>

      <div className="request-actions detail-actions">
        <button onClick={() => onApprove(request._id, request.email)} className="approve-btn">Approve</button>
        <button onClick={() => onReject(request._id, request.email)} className="reject-btn">Reject</button>
      </div>
    </div>
  );
}


export default function Dashboard() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // NEW STATE: Controls which main content section is active
  const [activeSection, setActiveSection] = useState('dashboard-summary'); // Default view

  useEffect(() => {
    // Only fetch requests if we are in a section that requires them
    if (activeSection === 'requests-list' || activeSection === 'dashboard-summary') {
      fetchPendingRequests();
    }
  }, [activeSection]); // Fetch when activeSection changes

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/newconnection/requests/pending");
      setPendingRequests(response.data);
      setLoading(false);
      // Do NOT clear selectedRequest here if we're currently in a detail view,
      // only clear it if we're explicitly returning to the list or dashboard summary.
    } catch (err) {
      console.error("Error fetching pending requests:", err);
      setError("Failed to load pending requests.");
      setLoading(false);
    }
  };

  const handleApprove = async (kycId, userEmail) => {
    try {
      await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/status`, { status: 'approved' });
      alert("Request approved successfully!");
      fetchPendingRequests(); // Refresh list
      setSelectedRequest(null); // Clear detail view
      setActiveSection('requests-list'); // Go back to the requests list
    } catch (err) {
      console.error("Error approving request:", err);
      alert("Failed to approve request.");
    }
  };

  const handleReject = async (kycId, userEmail) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/status`, { status: 'rejected' });

      if (response.data.status === 'rejected') {
          alert("Request rejected and data removed successfully!");
          fetchPendingRequests(); // Refresh list
          setSelectedRequest(null); // Clear detail view
          setActiveSection('requests-list'); // Go back to the requests list
      } else {
          alert("Request rejected (but data not explicitly removed from database).");
          fetchPendingRequests();
          setSelectedRequest(null);
          setActiveSection('requests-list');
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Failed to reject request.");
    }
  };

  // Handler for clicking a request in the list to view details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setActiveSection('request-detail'); // Change active section to detail view
  };

  // Handler to go back to the list from the detail view
  const handleBackToList = () => {
    setSelectedRequest(null); // Clear selected request
    setActiveSection('requests-list'); // Go back to the requests list
    fetchPendingRequests(); // Refresh the list in case something changed while in detail view
  };

  // Handler for sidebar navigation
  const handleSidebarNav = (section) => {
    setSelectedRequest(null); // Always clear selected request when navigating sidebar
    setActiveSection(section);
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">Admin</h2>
        <nav>
          <ul>
            <li
              className={activeSection === 'dashboard-summary' ? 'active' : ''}
              onClick={() => handleSidebarNav('dashboard-summary')}
            >
              Dashboard
            </li>
            <li
              className={activeSection === 'users' ? 'active' : ''}
              onClick={() => handleSidebarNav('users')}
            >
              Users
            </li>
            <li
              className={activeSection === 'requests-list' || activeSection === 'request-detail' ? 'active' : ''}
              onClick={() => handleSidebarNav('requests-list')} // Clicking 'Requests' always goes to the list
            >
              Requests {pendingRequests.length > 0 && <span className="pending-count">({pendingRequests.length})</span>}
            </li>
            <li
              className={activeSection === 'payments' ? 'active' : ''}
              onClick={() => handleSidebarNav('payments')}
            >
              Payments
            </li>
            <li
              className={activeSection === 'reports' ? 'active' : ''}
              onClick={() => handleSidebarNav('reports')}
            >
              Reports
            </li>
            <li
              className={activeSection === 'settings' ? 'active' : ''}
              onClick={() => handleSidebarNav('settings')}
            >
              Settings
            </li>
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

      {/* Main Content */}
      <main className="main-content">
        <div className="content-center">
          <h1 className="page-title">Admin Dashboard</h1>

          {/* Conditional Rendering based on activeSection */}
          {activeSection === 'dashboard-summary' && (
            <>
              {/* Stats */}
              <div className="card-grid">
                <Card title="Total Users">
                  <p>...</p>
                </Card>
                <Card title="Active Connections">
                  <p>...</p>
                </Card>
                <Card title="Pending Requests">
                  <p>{pendingRequests.length}</p>
                </Card>
              </div>

              <h2 className="section-title">System Overview</h2>
              <div className="card-grid">
                <Card title="User Growth">
                  <p>Chart or data placeholder</p>
                </Card>
                <Card title="Connection Activity">
                  <p>Chart or data placeholder</p>
                </Card>
              </div>
            </>
          )}

          {activeSection === 'requests-list' && (
            <>
              <h2 className="section-title">Pending Connection Requests</h2>
              {loading && <p>Loading requests...</p>}
              {error && <p className="error-message">{error}</p>}
              {!loading && pendingRequests.length === 0 && <p>No pending requests found.</p>}

              {!loading && pendingRequests.length > 0 && (
                <div className="requests-list">
                  {pendingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="request-item card clickable"
                      onClick={() => handleViewDetails(request)}
                    >
                      <h4>{request.firstName} {request.lastName} ({request.email})</h4>
                      <p><strong>Mobile:</strong> {request.mobileNumber}</p>
                      <p><strong>Address:</strong> {request.city}, {request.state} - {request.pinCode}</p>
                      <p><strong>Status:</strong> <span className={`status ${request.status}`}>{request.status.replace(/_/g, ' ')}</span></p>
                      <p><em>Click to view full details</em></p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeSection === 'request-detail' && selectedRequest && (
            <RequestDetail
              request={selectedRequest}
              onApprove={handleApprove}
              onReject={handleReject}
              onBack={handleBackToList}
            />
          )}

          {/* Placeholders for other sections if needed */}
          {activeSection === 'users' && <h2 className="section-title">Users Management (Coming Soon)</h2>}
          {activeSection === 'payments' && <h2 className="section-title">Payments Overview (Coming Soon)</h2>}
          {activeSection === 'reports' && <h2 className="section-title">Reports (Coming Soon)</h2>}
          {activeSection === 'settings' && <h2 className="section-title">Settings (Coming Soon)</h2>}

        </div>
      </main>
    </div>
  );
}