// import React from "react";
// import "../styles/adminDashboard.css";

// function Card({ title, children }) {
//   return (
//     <div className="card">
//       <h3>{title}</h3>
//       <div>{children}</div>
//     </div>
//   );
// }

// export default function Dashboard() {
//   return (
//     <div className="dashboard">
//       {/* Sidebar */}
//       <aside className="sidebar">
//         <h2 className="logo">Admin</h2>
//         <nav>
//           <ul>
//             <li className="active">Dashboard</li>
//             <li>Users</li>
//             <li>Requests</li>
//             <li>Payments</li>
//             <li>Reports</li>
//             <li>Settings</li>
//           </ul>
//         </nav>
//         <div className="user-info">
//           <div className="avatar"></div>
//           <div>
//             <p className="username">Admin User</p>
//             <p className="signout">Sign Out</p>
//           </div>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="main-content">
//         <div className="content-center">
//           <h1 className="page-title">Dashboard</h1>

//           {/* Stats */}
//           <div className="card-grid">
//             <Card title="Total Users"></Card>
//             <Card title="Active Connections"></Card>
//           </div>

//           {/* System Overview */}
//           <h2 className="section-title">System Overview</h2>
//           <div className="card-grid">
//             <Card title="User Growth">h</Card>
//             <Card title="Connection Activity"> </Card>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }













// --- START OF FILE AdminDashboard.js ---

import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/adminDashboard.css";

function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/newconnection/requests/pending");
      setPendingRequests(response.data);
      setLoading(false);
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
      fetchPendingRequests(); // Refresh the list
    } catch (err) {
      console.error("Error approving request:", err);
      alert("Failed to approve request.");
    }
  };

  const handleReject = async (kycId, userEmail) => {
    try {
      await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/status`, { status: 'rejected' });
      alert("Request rejected!");
      fetchPendingRequests(); // Refresh the list
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Failed to reject request.");
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">Admin</h2>
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>Users</li>
            <li className="active">Requests</li> {/* ✅ Highlight Requests */}
            <li>Payments</li>
            <li>Reports</li>
            <li>Settings</li>
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
          <h1 className="page-title">Admin Dashboard</h1> {/* Changed title */}

          {/* Stats */}
          <div className="card-grid">
            <Card title="Total Users">
              <p>...</p> {/* Add actual data here */}
            </Card>
            <Card title="Active Connections">
              <p>...</p> {/* Add actual data here */}
            </Card>
            <Card title="Pending Requests">
              <p>{pendingRequests.length}</p> {/* Display count */}
            </Card>
          </div>

          {/* System Overview */}
          <h2 className="section-title">Pending Connection Requests</h2>
          {loading && <p>Loading requests...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && pendingRequests.length === 0 && <p>No pending requests found.</p>}
          
          {!loading && pendingRequests.length > 0 && (
            <div className="requests-list">
              {pendingRequests.map((request) => (
                <div key={request._id} className="request-item card"> {/* Reuse card style */}
                  <h4>{request.firstName} {request.lastName} ({request.email})</h4>
                  <p><strong>Mobile:</strong> {request.mobileNumber}</p>
                  <p><strong>Address:</strong> {request.houseName}, {request.streetName}, {request.city}, {request.state} - {request.pinCode}</p>
                  <p><strong>Requested On:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                  <div className="request-actions">
                    <button onClick={() => handleApprove(request._id, request.email)} className="approve-btn">Approve</button>
                    <button onClick={() => handleReject(request._id, request.email)} className="reject-btn">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="section-title">System Overview</h2>
          <div className="card-grid">
            <Card title="User Growth">
              <p>Chart or data placeholder</p>
            </Card>
            <Card title="Connection Activity">
              <p>Chart or data placeholder</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}