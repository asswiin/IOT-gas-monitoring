// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "../styles/adminDashboard.css"; // Ensure your CSS is correctly linked

// // Reusable Card component (no change)
// function Card({ title, children }) {
//   return (
//     <div className="card">
//       <h3>{title}</h3>
//       <div>{children}</div>
//     </div>
//   );
// }

// // RequestDetail component (mostly unchanged, just passed props differently)
// function RequestDetail({ request, onApprove, onReject, onBack }) {
//   if (!request) return null;

//   return (
//     <div className="request-detail-card card">
//       <button onClick={onBack} className="back-btn">← Back to Requests List</button>
//       <h3>Connection Request Details</h3>
//       <div className="detail-section">
//         <h4>1) Personal Details</h4>
//         <p><strong>Salutation:</strong> {request.salutation}</p>
//         <p><strong>Full Name:</strong> {request.firstName} {request.middleName} {request.lastName}</p>
//         <p><strong>Date of Birth:</strong> {new Date(request.dob).toLocaleDateString()}</p>
//         <p><strong>Father's Name:</strong> {request.fatherName || 'N/A'}</p>
//         <p><strong>Spouse Name:</strong> {request.spouseName || 'N/A'}</p>
//         <p><strong>Mother's Name:</strong> {request.motherName || 'N/A'}</p>
//       </div>

//       <div className="detail-section">
//         <h4>2) Address / Contact Information</h4>
//         <p><strong>House/Flat #:</strong> {request.houseName}</p>
//         <p><strong>Floor No:</strong> {request.floorNo || 'N/A'}</p>
//         <p><strong>Housing Complex:</strong> {request.housingComplex || 'N/A'}</p>
//         <p><strong>Street Name:</strong> {request.streetName}</p>
//         <p><strong>Landmark:</strong> {request.landmark}</p>
//         <p><strong>City:</strong> {request.city}</p>
//         <p><strong>District:</strong> {request.district}</p>
//         <p><strong>State:</strong> {request.state}</p>
//         <p><strong>Pin Code:</strong> {request.pinCode}</p>
//         <p><strong>Mobile Number:</strong> {request.mobileNumber}</p>
//         <p><strong>Telephone Number:</strong> {request.telephoneNumber || 'N/A'}</p>
//         <p><strong>Email:</strong> {request.email}</p>
//       </div>

//       <p><strong>Requested On:</strong> {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}</p>

//       <div className="request-actions detail-actions">
//         <button onClick={() => onApprove(request._id, request.email)} className="approve-btn">Approve</button>
//         <button onClick={() => onReject(request._id, request.email)} className="reject-btn">Reject</button>
//       </div>
//     </div>
//   );
// }

// // ✅ NEW: UserDetail component
// function UserDetail({ user, onBack }) {
//   if (!user) return null;

//   return (
//     <div className="user-detail-card card">
//       <button onClick={onBack} className="back-btn">← Back to Users List</button>
//       <h3>User Details</h3>
//       <div className="detail-section">
//         <h4>Personal Information</h4>
//         <p><strong>Full Name:</strong> {user.firstName} {user.middleName} {user.lastName}</p>
//         <p><strong>Email:</strong> {user.email}</p>
//         <p><strong>Mobile:</strong> {user.mobileNumber}</p>
//         <p><strong>Date of Birth:</strong> {new Date(user.dob).toLocaleDateString()}</p>
//         <p><strong>Status:</strong> <span className={`status ${user.status}`}>{user.status.replace(/_/g, ' ')}</span></p>
//       </div>
//       <div className="detail-section">
//         <h4>Address</h4>
//         <p><strong>Address:</strong> {user.houseName}, {user.streetName}, {user.landmark}, {user.city}, {user.district}, {user.state} - {user.pinCode}</p>
//       </div>
//       <p><strong>Joined On:</strong> {new Date(user.createdAt).toLocaleDateString()} at {new Date(user.createdAt).toLocaleTimeString()}</p>
//       {user.updatedAt && <p><strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()} at {new Date(user.updatedAt).toLocaleTimeString()}</p>}
//     </div>
//   );
// }

// // ✅ NEW: PaymentDetail component
// function PaymentDetail({ payment, onBack }) {
//   if (!payment) return null;

//   return (
//     <div className="payment-detail-card card">
//       <button onClick={onBack} className="back-btn">← Back to Payments List</button>
//       <h3>Payment Details</h3>
//       <div className="detail-section">
//         <p><strong>Customer Name:</strong> {payment.customerName}</p>
//         <p><strong>Email:</strong> {payment.email}</p>
//         <p><strong>Mobile Number:</strong> {payment.mobileNumber}</p>
//         <p><strong>Amount Paid:</strong> ₹{payment.amountDue}</p>
//         <p><strong>Date of Payment:</strong> {new Date(payment.dateOfPayment).toLocaleDateString()}</p>
//         <p><strong>Payment ID:</strong> {payment._id}</p>
//       </div>
//       <p><strong>Recorded On:</strong> {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}</p>
//     </div>
//   );
// }


// export default function Dashboard() {
//   const [pendingRequests, setPendingRequests] = useState([]);
//   const [allUsers, setAllUsers] = useState([]); // ✅ NEW state for all users
//   const [allPayments, setAllPayments] = useState([]); // ✅ NEW state for all payments

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [selectedUser, setSelectedUser] = useState(null); // ✅ NEW state for selected user
//   const [selectedPayment, setSelectedPayment] = useState(null); // ✅ NEW state for selected payment


//   // NEW STATE: Controls which main content section is active
//   const [activeSection, setActiveSection] = useState('dashboard-summary'); // Default view

//   useEffect(() => {
//     setLoading(true);
//     setError(null); // Clear previous errors

//     const fetchData = async () => {
//       try {
//         if (activeSection === 'requests-list' || activeSection === 'dashboard-summary') {
//           await fetchPendingRequests();
//         } else if (activeSection === 'users') {
//           await fetchAllUsers();
//         } else if (activeSection === 'payments') {
//           await fetchAllPayments();
//         }
//       } catch (err) {
//         console.error("Error in useEffect fetchData:", err);
//         setError("Failed to load data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [activeSection]); // Fetch when activeSection changes

//   const fetchPendingRequests = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/api/newconnection/requests/pending");
//       setPendingRequests(response.data);
//     } catch (err) {
//       console.error("Error fetching pending requests:", err);
//       setError("Failed to load pending requests.");
//     }
//   };

//   // ✅ NEW: Function to fetch all users
//   const fetchAllUsers = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/api/newconnection"); // Using the new root GET endpoint
//       setAllUsers(response.data);
//     } catch (err) {
//       console.error("Error fetching all users:", err);
//       setError("Failed to load user data.");
//     }
//   };

//   // ✅ NEW: Function to fetch all payments
//   const fetchAllPayments = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/api/payment"); // Using the new root GET endpoint
//       setAllPayments(response.data);
//     } catch (err) {
//       console.error("Error fetching all payments:", err);
//       setError("Failed to load payment data.");
//     }
//   };


//   const handleApprove = async (kycId, userEmail) => {
//     try {
//       await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/status`, { status: 'approved' });
//       alert("Request approved successfully!");
//       fetchPendingRequests(); // Refresh list
//       setSelectedRequest(null); // Clear detail view
//       setActiveSection('requests-list'); // Go back to the requests list
//     } catch (err) {
//       console.error("Error approving request:", err);
//       alert("Failed to approve request.");
//     }
//   };

//   const handleReject = async (kycId, userEmail) => {
//     try {
//       const response = await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/status`, { status: 'rejected' });

//       if (response.data.status === 'rejected') {
//           alert("Request rejected and data removed successfully!");
//           fetchPendingRequests(); // Refresh list
//           setSelectedRequest(null); // Clear detail view
//           setActiveSection('requests-list'); // Go back to the requests list
//       } else {
//           alert("Request rejected (but data not explicitly removed from database).");
//           fetchPendingRequests();
//           setSelectedRequest(null);
//           setActiveSection('requests-list');
//       }
//     } catch (err) {
//       console.error("Error rejecting request:", err);
//       alert("Failed to reject request.");
//     }
//   };

//   // Handler for clicking a request in the list to view details
//   const handleViewRequestDetails = (request) => {
//     setSelectedRequest(request);
//     setActiveSection('request-detail'); // Change active section to detail view
//   };

//   // Handler to go back to the requests list from the detail view
//   const handleBackToRequestsList = () => {
//     setSelectedRequest(null); // Clear selected request
//     setActiveSection('requests-list'); // Go back to the requests list
//     fetchPendingRequests(); // Refresh the list in case something changed while in detail view
//   };

//   // ✅ NEW: Handler for clicking a user in the list to view details
//   const handleViewUserDetails = (user) => {
//     setSelectedUser(user);
//     setActiveSection('user-detail'); // Change active section to user detail view
//   };

//   // ✅ NEW: Handler to go back to the users list from the detail view
//   const handleBackToUsersList = () => {
//     setSelectedUser(null);
//     setActiveSection('users');
//     fetchAllUsers(); // Refresh list
//   };

//   // ✅ NEW: Handler for clicking a payment in the list to view details
//   const handleViewPaymentDetails = (payment) => {
//     setSelectedPayment(payment);
//     setActiveSection('payment-detail'); // Change active section to payment detail view
//   };

//   // ✅ NEW: Handler to go back to the payments list from the detail view
//   const handleBackToPaymentsList = () => {
//     setSelectedPayment(null);
//     setActiveSection('payments');
//     fetchAllPayments(); // Refresh list
//   };


//   // Handler for sidebar navigation
//   const handleSidebarNav = (section) => {
//     setSelectedRequest(null); // Always clear selected request when navigating sidebar
//     setSelectedUser(null); // ✅ Clear selected user
//     setSelectedPayment(null); // ✅ Clear selected payment
//     setActiveSection(section);
//   };

//   return (
//     <div className="dashboard">
//       {/* Sidebar */}
//       <aside className="sidebar">
//         <h2 className="logo">Admin</h2>
//         <nav>
//           <ul>
//             <li
//               className={activeSection === 'dashboard-summary' ? 'active' : ''}
//               onClick={() => handleSidebarNav('dashboard-summary')}
//             >
//               Dashboard
//             </li>
//             <li
//               className={activeSection === 'users' || activeSection === 'user-detail' ? 'active' : ''}
//               onClick={() => handleSidebarNav('users')}
//             >
//               Users
//             </li>
//             <li
//               className={activeSection === 'requests-list' || activeSection === 'request-detail' ? 'active' : ''}
//               onClick={() => handleSidebarNav('requests-list')} // Clicking 'Requests' always goes to the list
//             >
//               Requests {pendingRequests.length > 0 && <span className="pending-count">({pendingRequests.length})</span>}
//             </li>
//             <li
//               className={activeSection === 'payments' || activeSection === 'payment-detail' ? 'active' : ''}
//               onClick={() => handleSidebarNav('payments')}
//             >
//               Payments
//             </li>
//             <li
//               className={activeSection === 'reports' ? 'active' : ''}
//               onClick={() => handleSidebarNav('reports')}
//             >
//               Reports
//             </li>
//             <li
//               className={activeSection === 'settings' ? 'active' : ''}
//               onClick={() => handleSidebarNav('settings')}
//             >
//               Settings
//             </li>
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
//           <h1 className="page-title">Admin Dashboard</h1>

//           {/* Conditional Rendering based on activeSection */}
//           {activeSection === 'dashboard-summary' && (
//             <>
//               {/* Stats */}
//               <div className="card-grid">
//                 <Card title="Total Users">
//                   <p>{loading ? '...' : allUsers.length}</p> {/* Use actual count */}
//                 </Card>
//                 <Card title="Active Connections">
//                   <p>{loading ? '...' : allUsers.filter(u => u.status === 'active').length}</p>
//                 </Card>
//                 <Card title="Pending Requests">
//                   <p>{loading ? '...' : pendingRequests.length}</p>
//                 </Card>
//                  <Card title="Total Payments">
//                   <p>{loading ? '...' : allPayments.length}</p>
//                 </Card>
//               </div>

//               <h2 className="section-title">System Overview</h2>
//               <div className="card-grid">
//                 <Card title="User Growth">
//                   <p>Chart or data placeholder</p>
//                 </Card>
//                 <Card title="Connection Activity">
//                   <p>Chart or data placeholder</p>
//                 </Card>
//               </div>
//             </>
//           )}

//           {/* Requests List View */}
//           {activeSection === 'requests-list' && (
//             <>
//               <h2 className="section-title">Pending Connection Requests</h2>
//               {loading && <p>Loading requests...</p>}
//               {error && <p className="error-message">{error}</p>}
//               {!loading && pendingRequests.length === 0 && <p>No pending requests found.</p>}

//               {!loading && pendingRequests.length > 0 && (
//                 <div className="requests-list">
//                   {pendingRequests.map((request) => (
//                     <div
//                       key={request._id}
//                       className="request-item card clickable"
//                       onClick={() => handleViewRequestDetails(request)}
//                     >
//                       <h4>{request.firstName} {request.lastName} ({request.email})</h4>
//                       <p><strong>Mobile:</strong> {request.mobileNumber}</p>
//                       <p><strong>Address:</strong> {request.city}, {request.state} - {request.pinCode}</p>
//                       <p><strong>Status:</strong> <span className={`status ${request.status}`}>{request.status.replace(/_/g, ' ')}</span></p>
//                       <p><em>Click to view full details</em></p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </>
//           )}

//           {/* Request Detail View */}
//           {activeSection === 'request-detail' && selectedRequest && (
//             <RequestDetail
//               request={selectedRequest}
//               onApprove={handleApprove}
//               onReject={handleReject}
//               onBack={handleBackToRequestsList}
//             />
//           )}

//           {/* ✅ NEW: Users List View */}
//           {activeSection === 'users' && (
//             <>
//               <h2 className="section-title">All Users</h2>
//               {loading && <p>Loading users...</p>}
//               {error && <p className="error-message">{error}</p>}
//               {!loading && allUsers.length === 0 && <p>No users found.</p>}

//               {!loading && allUsers.length > 0 && (
//                 <div className="users-list">
//                   {allUsers.map((user) => (
//                     <div
//                       key={user._id}
//                       className="user-item card clickable"
//                       onClick={() => handleViewUserDetails(user)}
//                     >
//                       <h4>{user.firstName} {user.lastName} ({user.email})</h4>
//                       <p><strong>Mobile:</strong> {user.mobileNumber}</p>
//                       <p><strong>Status:</strong> <span className={`status ${user.status}`}>{user.status.replace(/_/g, ' ')}</span></p>
//                       <p><em>Click to view full profile</em></p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </>
//           )}

//           {/* ✅ NEW: User Detail View */}
//           {activeSection === 'user-detail' && selectedUser && (
//             <UserDetail user={selectedUser} onBack={handleBackToUsersList} />
//           )}

//           {/* ✅ NEW: Payments List View */}
//           {activeSection === 'payments' && (
//             <>
//               <h2 className="section-title">All Payments</h2>
//               {loading && <p>Loading payments...</p>}
//               {error && <p className="error-message">{error}</p>}
//               {!loading && allPayments.length === 0 && <p>No payment records found.</p>}

//               {!loading && allPayments.length > 0 && (
//                 <div className="payments-list">
//                   {allPayments.map((payment) => (
//                     <div
//                       key={payment._id}
//                       className="payment-item card clickable"
//                       onClick={() => handleViewPaymentDetails(payment)}
//                     >
//                       <h4>{payment.customerName} ({payment.email})</h4>
//                       <p><strong>Amount:</strong> ₹{payment.amountDue}</p>
//                       <p><strong>Date:</strong> {new Date(payment.dateOfPayment).toLocaleDateString()}</p>
//                       <p><em>Click to view full details</em></p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </>
//           )}

//           {/* ✅ NEW: Payment Detail View */}
//           {activeSection === 'payment-detail' && selectedPayment && (
//             <PaymentDetail payment={selectedPayment} onBack={handleBackToPaymentsList} />
//           )}


//           {/* Placeholders for other sections if needed */}
//           {activeSection === 'reports' && <h2 className="section-title">Reports (Coming Soon)</h2>}
//           {activeSection === 'settings' && <h2 className="section-title">Settings (Coming Soon)</h2>}

//         </div>
//       </main>
//     </div>
//   );
// }














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

// RequestDetail component (no change for this request)
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

// UserDetail component (no change for this request)
function UserDetail({ user, onBack }) {
  if (!user) return null;

  return (
    <div className="user-detail-card card">
      <button onClick={onBack} className="back-btn">← Back to Users List</button>
      <h3>User Details</h3>
      <div className="detail-section">
        <h4>Personal Information</h4>
        <p><strong>Full Name:</strong> {user.firstName} {user.middleName} {user.lastName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Mobile:</strong> {user.mobileNumber}</p>
        <p><strong>Date of Birth:</strong> {new Date(user.dob).toLocaleDateString()}</p>
        <p><strong>Status:</strong> <span className={`status ${user.status}`}>{user.status.replace(/_/g, ' ')}</span></p>
      </div>
      <div className="detail-section">
        <h4>Address</h4>
        <p><strong>Address:</strong> {user.houseName}, {user.streetName}, {user.landmark}, {user.city}, {user.district}, {user.state} - {user.pinCode}</p>
      </div>
      <p><strong>Joined On:</strong> {new Date(user.createdAt).toLocaleDateString()} at {new Date(user.createdAt).toLocaleTimeString()}</p>
      {user.updatedAt && <p><strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()} at {new Date(user.updatedAt).toLocaleTimeString()}</p>}
    </div>
  );
}

// ✅ MODIFIED: PaymentDetail component
function PaymentDetail({ payment, onBack }) {
  if (!payment) return null;

  return (
    <div className="payment-detail-card card">
      <button onClick={onBack} className="back-btn">← Back to Payments List</button>
      <h3>Payment Details</h3>
      <div className="detail-section">
        <p><strong>Customer Name:</strong> {payment.customerName}</p>
        <p><strong>Email:</strong> {payment.email}</p>
        <p><strong>Mobile Number:</strong> {payment.mobileNumber}</p>
        <p><strong>Amount Paid:</strong> ₹{payment.amountDue}</p>
        {/* Using dateOfPayment from form, falling back to createdAt if needed */}
        <p><strong>Payment Date:</strong> {new Date(payment.dateOfPayment || payment.createdAt).toLocaleDateString()}</p>
        <p><strong>Payment ID:</strong> {payment._id}</p>
      </div>
      {/* Show record creation timestamp if different from payment date */}
      {(payment.createdAt && (!payment.dateOfPayment || new Date(payment.createdAt).toDateString() !== new Date(payment.dateOfPayment).toDateString())) && (
        <p className="timestamp-note"><em>Recorded On: {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}</em></p>
      )}
    </div>
  );
}


export default function Dashboard() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allPayments, setAllPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);


  const [activeSection, setActiveSection] = useState('dashboard-summary');

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        if (activeSection === 'requests-list' || activeSection === 'dashboard-summary') {
          await fetchPendingRequests();
        } else if (activeSection === 'users') {
          await fetchAllUsers();
        } else if (activeSection === 'payments') {
          await fetchAllPayments();
        }
      } catch (err) {
        console.error("Error in useEffect fetchData:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeSection]);

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/newconnection/requests/pending");
      setPendingRequests(response.data);
    } catch (err) {
      console.error("Error fetching pending requests:", err);
      setError("Failed to load pending requests.");
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/newconnection");
      setAllUsers(response.data);
    } catch (err) {
      console.error("Error fetching all users:", err);
      setError("Failed to load user data.");
    }
  };

  const fetchAllPayments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/payment");
      setAllPayments(response.data);
    } catch (err) {
      console.error("Error fetching all payments:", err);
      setError("Failed to load payment data.");
    }
  };


  const handleApprove = async (kycId, userEmail) => {
    try {
      await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/status`, { status: 'approved' });
      alert("Request approved successfully!");
      fetchPendingRequests();
      setSelectedRequest(null);
      setActiveSection('requests-list');
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
          fetchPendingRequests();
          setSelectedRequest(null);
          setActiveSection('requests-list');
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

  const handleViewRequestDetails = (request) => {
    setSelectedRequest(request);
    setActiveSection('request-detail');
  };

  const handleBackToRequestsList = () => {
    setSelectedRequest(null);
    setActiveSection('requests-list');
    fetchPendingRequests();
  };

  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
    setActiveSection('user-detail');
  };

  const handleBackToUsersList = () => {
    setSelectedUser(null);
    setActiveSection('users');
    fetchAllUsers();
  };

  const handleViewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setActiveSection('payment-detail');
  };

  const handleBackToPaymentsList = () => {
    setSelectedPayment(null);
    setActiveSection('payments');
    fetchAllPayments();
  };


  const handleSidebarNav = (section) => {
    setSelectedRequest(null);
    setSelectedUser(null);
    setSelectedPayment(null);
    setActiveSection(section);
  };

  return (
    <div className="dashboard">
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
              className={activeSection === 'users' || activeSection === 'user-detail' ? 'active' : ''}
              onClick={() => handleSidebarNav('users')}
            >
              Users
            </li>
            <li
              className={activeSection === 'requests-list' || activeSection === 'request-detail' ? 'active' : ''}
              onClick={() => handleSidebarNav('requests-list')}
            >
              Requests {pendingRequests.length > 0 && <span className="pending-count">({pendingRequests.length})</span>}
            </li>
            <li
              className={activeSection === 'payments' || activeSection === 'payment-detail' ? 'active' : ''}
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

      <main className="main-content">
        <div className="content-center">
          <h1 className="page-title">Admin Dashboard</h1>

          {activeSection === 'dashboard-summary' && (
            <>
              <div className="card-grid">
                <Card title="Total Users">
                  <p>{loading ? '...' : allUsers.length}</p>
                </Card>
                <Card title="Active Connections">
                  <p>{loading ? '...' : allUsers.filter(u => u.status === 'active').length}</p>
                </Card>
                <Card title="Pending Requests">
                  <p>{loading ? '...' : pendingRequests.length}</p>
                </Card>
                 <Card title="Total Payments">
                  <p>{loading ? '...' : allPayments.length}</p>
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
                      onClick={() => handleViewRequestDetails(request)}
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
              onBack={handleBackToRequestsList}
            />
          )}

          {activeSection === 'users' && (
            <>
              <h2 className="section-title">All Users</h2>
              {loading && <p>Loading users...</p>}
              {error && <p className="error-message">{error}</p>}
              {!loading && allUsers.length === 0 && <p>No users found.</p>}

              {!loading && allUsers.length > 0 && (
                <div className="users-list">
                  {allUsers.map((user) => (
                    <div
                      key={user._id}
                      className="user-item card clickable"
                      onClick={() => handleViewUserDetails(user)}
                    >
                      <h4>{user.firstName} {user.lastName} ({user.email})</h4>
                      <p><strong>Mobile:</strong> {user.mobileNumber}</p>
                      <p><strong>Status:</strong> <span className={`status ${user.status}`}>{user.status.replace(/_/g, ' ')}</span></p>
                      <p><em>Click to view full profile</em></p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeSection === 'user-detail' && selectedUser && (
            <UserDetail user={selectedUser} onBack={handleBackToUsersList} />
          )}

          {/* ✅ MODIFIED: Payments List View */}
          {activeSection === 'payments' && (
            <>
              <h2 className="section-title">All Payments</h2>
              {loading && <p>Loading payments...</p>}
              {error && <p className="error-message">{error}</p>}
              {!loading && allPayments.length === 0 && <p>No payment records found.</p>}

              {!loading && allPayments.length > 0 && (
                <div className="payments-list">
                  {allPayments.map((payment) => (
                    <div
                      key={payment._id}
                      className="payment-item card clickable"
                      onClick={() => handleViewPaymentDetails(payment)}
                    >
                      <h4>{payment.customerName}</h4>
                      <p><strong>Email:</strong> {payment.email}</p>
                      <p><strong>Amount:</strong> ₹{payment.amountDue}</p>
                      <p><strong>Date:</strong> {new Date(payment.dateOfPayment || payment.createdAt).toLocaleDateString()}</p>
                      <p><em>Click to view full details</em></p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ✅ MODIFIED: Payment Detail View */}
          {activeSection === 'payment-detail' && selectedPayment && (
            <PaymentDetail payment={selectedPayment} onBack={handleBackToPaymentsList} />
          )}


          {activeSection === 'reports' && <h2 className="section-title">Reports (Coming Soon)</h2>}
          {activeSection === 'settings' && <h2 className="section-title">Settings (Coming Soon)</h2>}

        </div>
      </main>
    </div>
  );
}