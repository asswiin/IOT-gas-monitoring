
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "../styles/adminDashboard.css";

// function Card({ title, children }) {
//   return (
//     <div className="card">
//       <h3>{title}</h3>
//       <div>{children}</div>
//     </div>
//   );
// }

// // UserDetail component (MODIFIED for Delete Button and Confirmation Popup)
// function UserDetail({ user, onBack, onDeleteUser }) {
//   // ✅ Move useState to the top level, before any conditional returns
//   const [showDeletePopup, setShowDeletePopup] = useState(false);

//   if (!user) return null; // Now the conditional return is after the hook

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

//       {/* NEW: Delete User Button */}
//       <div className="user-actions detail-actions">
//         <button onClick={() => setShowDeletePopup(true)} className="delete-btn">Delete User</button>
//       </div>

//       {/* NEW: Delete Confirmation Popup */}
//       {showDeletePopup && (
//         <div className="popup-overlay">
//           <div className="popup-content">
//             <h3>Confirm Deletion</h3>
//             <p>Are you sure you want to permanently delete this user's account and all associated data, including payments, gas levels, and auto-bookings?</p>
//             <div className="popup-buttons">
//               <button onClick={() => {
//                 onDeleteUser(user.email);
//                 setShowDeletePopup(false);
//               }} className="confirm-yes">Yes, Delete Permanently</button>
//               <button onClick={() => setShowDeletePopup(false)} className="confirm-no">No, Keep User</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // RequestDetail component (no change for this request)
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

// // PaymentDetail component (MODIFIED to show paymentType)
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
//         <p><strong>Payment Date:</strong> {new Date(payment.dateOfPayment || payment.createdAt).toLocaleDateString()}</p>
//         <p><strong>Payment Type:</strong> {payment.paymentType ? payment.paymentType.replace(/_/g, ' ') : 'N/A'}</p> {/* MODIFIED */}
//         <p><strong>Payment ID:</strong> {payment._id}</p>
//       </div>
//       {(payment.createdAt && (!payment.dateOfPayment || new Date(payment.createdAt).toDateString() !== new Date(payment.dateOfPayment).toDateString())) && (
//         <p className="timestamp-note"><em>Recorded On: {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}</em></p>
//       )}
//     </div>
//   );
// }

// // NEW: AutoBookingDetail component
// function AutoBookingDetail({ booking, onBack }) {
//   if (!booking) return null;

//   return (
//     <div className="auto-booking-detail-card card">
//       <button onClick={onBack} className="back-btn">← Back to Auto-Bookings List</button>
//       <h3>Auto-Booking Details</h3>
//       <div className="detail-section">
//         <p><strong>User Email:</strong> {booking.email}</p>
//         <p><strong>Booking Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()} at {new Date(booking.bookingDate).toLocaleTimeString()}</p>
//         <p><strong>Status:</strong> <span className={`status ${booking.status}`}>{booking.status.replace(/_/g, ' ')}</span></p>
//         <p><strong>Booking ID:</strong> {booking._id}</p>
//       </div>
//       <p><em>Created On: {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}</em></p>
//       {booking.updatedAt && <p><em>Last Updated: {new Date(booking.updatedAt).toLocaleDateString()} at {new Date(booking.updatedAt).toLocaleTimeString()}</em></p>}
//     </div>
//   );
// }

// export default function Dashboard() {
//   const [pendingRequests, setPendingRequests] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [allPayments, setAllPayments] = useState([]);
//   const [allAutoBookings, setAllAutoBookings] = useState([]); // NEW state for auto-bookings

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [selectedAutoBooking, setSelectedAutoBooking] = useState(null); // NEW state for selected auto-booking

//   const [activeSection, setActiveSection] = useState('dashboard-summary');

//   // Add new state for notification popup
//   const [notification, setNotification] = useState({
//     show: false,
//     message: '',
//     type: '' // 'success' or 'error'
//   });

//   useEffect(() => {
//     setLoading(true);
//     setError(null);

//     const fetchData = async () => {
//       try {
//         if (activeSection === 'requests-list' || activeSection === 'dashboard-summary') {
//           await fetchPendingRequests();
//         }
//         await fetchAllUsers(); // Always fetch all users for summary
//         if (activeSection === 'payments' || activeSection === 'dashboard-summary') {
//           await fetchAllPayments();
//         }
//         if (activeSection === 'auto-bookings' || activeSection === 'dashboard-summary') { // NEW: Fetch auto-bookings for summary too
//           await fetchAllAutoBookings();
//         }
//       } catch (err) {
//         console.error("Error in useEffect fetchData:", err);
//         setError("Failed to load data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [activeSection]);

//   const fetchPendingRequests = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/api/newconnection/requests/pending");
//       setPendingRequests(response.data);
//     } catch (err) {
//       console.error("Error fetching pending requests:", err);
//       setError("Failed to load pending requests.");
//     }
//   };

//   const fetchAllUsers = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/api/newconnection");
//       setAllUsers(response.data);
//     } catch (err) {
//       console.error("Error fetching all users:", err);
//       setError("Failed to load user data.");
//     }
//   };

//   const fetchAllPayments = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/api/payment");
//       setAllPayments(response.data);
//     } catch (err) {
//       console.error("Error fetching all payments:", err);
//       setError("Failed to load payment data.");
//     }
//   };

//   // NEW: Fetch all auto-bookings
//   const fetchAllAutoBookings = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/api/autobooking"); // Assuming this endpoint exists
//       setAllAutoBookings(response.data);
//     } catch (err) {
//       console.error("Error fetching all auto-bookings:", err);
//       setError("Failed to load auto-booking data.");
//     }
//   };


//   const handleApprove = async (kycId, userEmail) => {
//     try {
//       await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/status`, { status: 'approved' });
//       setNotification({
//         show: true,
//         message: "Request approved successfully! User can now proceed to initial payment.",
//         type: 'success'
//       });
//       fetchPendingRequests();
//       fetchAllUsers();
//       setSelectedRequest(null);
//       setActiveSection('requests-list');
//     } catch (err) {
//       console.error("Error approving request:", err);
//       setNotification({
//         show: true,
//         message: "Failed to approve request.",
//         type: 'error'
//       });
//     }
//   };

//   const handleReject = async (kycId, userEmail) => {
//     try {
//       const response = await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/status`, { status: 'rejected' });
//       setNotification({
//         show: true,
//         message: response.data.message, // Use the message from the backend response
//         type: 'success'
//       });
//       fetchPendingRequests();
//       fetchAllUsers();
//       setSelectedRequest(null);
//       setActiveSection('requests-list');
//     } catch (err) {
//       console.error("Error rejecting request:", err);
//       setNotification({
//         show: true,
//         message: "Failed to reject request.",
//         type: 'error'
//       });
//     }
//   };

//   const handleDeleteUser = async (userEmail) => {
//     try {
//       await axios.delete(`http://localhost:5000/api/newconnection/${userEmail}`);
//       setNotification({
//         show: true,
//         message: "User and all associated data deleted permanently!",
//         type: 'success'
//       });
//       fetchAllUsers();
//       fetchAllPayments(); // Refresh payments as they might be deleted
//       fetchAllAutoBookings(); // Refresh auto-bookings as they might be deleted
//       setSelectedUser(null);
//       setActiveSection('users');
//     } catch (err) {
//       console.error("Error deleting user:", err);
//       setNotification({
//         show: true,
//         message: "Failed to delete user and associated data.",
//         type: 'error'
//       });
//     }
//   };


//   const handleViewRequestDetails = (request) => {
//     setSelectedRequest(request);
//     setActiveSection('request-detail');
//   };

//   const handleBackToRequestsList = () => {
//     setSelectedRequest(null);
//     setActiveSection('requests-list');
//     fetchPendingRequests();
//   };

//   const handleViewUserDetails = (user) => {
//     setSelectedUser(user);
//     setActiveSection('user-detail');
//   };

//   const handleBackToUsersList = () => {
//     setSelectedUser(null);
//     setActiveSection('users');
//     fetchAllUsers();
//   };

//   const handleViewPaymentDetails = (payment) => {
//     setSelectedPayment(payment);
//     setActiveSection('payment-detail');
//   };

//   const handleBackToPaymentsList = () => {
//     setSelectedPayment(null);
//     setActiveSection('payments');
//     fetchAllPayments();
//   };

//   // NEW: Handlers for Auto-Bookings
//   const handleViewAutoBookingDetails = (booking) => {
//     setSelectedAutoBooking(booking);
//     setActiveSection('auto-booking-detail');
//   };

//   const handleBackToAutoBookingsList = () => {
//     setSelectedAutoBooking(null);
//     setActiveSection('auto-bookings');
//     fetchAllAutoBookings();
//   };


//   const handleSidebarNav = (section) => {
//     setSelectedRequest(null);
//     setSelectedUser(null);
//     setSelectedPayment(null);
//     setSelectedAutoBooking(null); // Clear selected auto-booking
//     setActiveSection(section);
//   };

//   return (
//     <div className="dashboard">
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
//               onClick={() => handleSidebarNav('requests-list')}
//             >
//               Requests {pendingRequests.length > 0 && <span className="pending-count">({pendingRequests.length})</span>}
//             </li>
//             <li
//               className={activeSection === 'payments' || activeSection === 'payment-detail' ? 'active' : ''}
//               onClick={() => handleSidebarNav('payments')}
//             >
//               Payments
//             </li>
//             {/* NEW Sidebar Item for Auto-Bookings */}
//             <li
//               className={activeSection === 'auto-bookings' || activeSection === 'auto-booking-detail' ? 'active' : ''}
//               onClick={() => handleSidebarNav('auto-bookings')}
//             >
//               Auto-Bookings {allAutoBookings.filter(b => b.status === 'booked').length > 0 && (
//                 <span className="pending-count">({allAutoBookings.filter(b => b.status === 'booked').length})</span>
//               )}
//             </li>

//             <li
//               className={activeSection === 'reports' ? 'active' : ''}
//               onClick={() => handleSidebarNav('reports')}
//             >
//               Reports
//             </li>

//              <li
//               className={activeSection === 'feedback' ? 'active' : ''}
//               onClick={() => handleSidebarNav('feedback')}
//             >
//               Feedback
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

//       <main className="main-content">
//         <div className="content-center">
//           <h1 className="page-title">Admin Dashboard</h1>

//           {activeSection === 'dashboard-summary' && (
//             <>
//               <div className="card-grid">
//                 <Card title="Total Users">
//                   <p>{loading ? '...' : allUsers.length}</p>
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
//                 {/* NEW: Auto-Bookings Summary */}
//                 <Card title="Pending Auto-Bookings">
//                   <p>{loading ? '...' : allAutoBookings.filter(b => b.status === 'booked').length}</p>
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

//           {activeSection === 'request-detail' && selectedRequest && (
//             <RequestDetail
//               request={selectedRequest}
//               onApprove={handleApprove}
//               onReject={handleReject}
//               onBack={handleBackToRequestsList}
//             />
//           )}

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

//           {activeSection === 'user-detail' && selectedUser && (
//             <UserDetail
//               user={selectedUser}
//               onBack={handleBackToUsersList}
//               onDeleteUser={handleDeleteUser}
//             />
//           )}


//            {activeSection === 'payments' && !selectedPayment && (
//     <>
//       <h2 className="section-title">All Payments</h2>
//       {loading && <p>Loading payments...</p>}
//       {error && <p className="error-message">{error}</p>}
//       {!loading && allPayments.length === 0 && <p>No payment records found.</p>}

//       {!loading && allPayments.length > 0 && (
//         <div className="payments-list">
//           {allPayments.map((payment) => (
//             <div
//               key={payment._id}
//               className="payment-item card clickable"
//               onClick={() => handleViewPaymentDetails(payment)}
//             >
//               <h4>{payment.customerName}</h4>
//               <p><strong>Email:</strong> {payment.email}</p>
//               <p><strong>Amount:</strong> ₹{payment.amountDue}</p>
//               <p><strong>Date:</strong> {new Date(payment.dateOfPayment || payment.createdAt).toLocaleDateString()}</p>
//               <p><em>Click to view full details</em></p>
//             </div>
//           ))}
//         </div>
//       )}
//     </>
//   )}

//   {activeSection === 'payment-detail' && selectedPayment && (
//     <PaymentDetail
//       payment={selectedPayment}
//       onBack={handleBackToPaymentsList}
//     />
//   )}

//           {/* NEW: Auto-Bookings Section */}
//           {activeSection === 'auto-bookings' && !selectedAutoBooking && (
//             <>
//               <h2 className="section-title">Auto-Booked Refills</h2>
//               {loading && <p>Loading auto-bookings...</p>}
//               {error && <p className="error-message">{error}</p>}
//               {!loading && allAutoBookings.length === 0 && <p>No auto-booked refills found.</p>}

//               {!loading && allAutoBookings.length > 0 && (
//                 <div className="auto-bookings-list">
//                   {allAutoBookings.map((booking) => (
//                     <div
//                       key={booking._id}
//                       className="booking-item card clickable"
//                       onClick={() => handleViewAutoBookingDetails(booking)}
//                     >
//                       <h4>{booking.email}</h4>
//                       <p><strong>Booking Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
//                       <p><strong>Status:</strong> <span className={`status ${booking.status}`}>{booking.status.replace(/_/g, ' ')}</span></p>
//                       <p><em>Click to view full details</em></p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </>
//           )}

//           {activeSection === 'auto-booking-detail' && selectedAutoBooking && (
//             <AutoBookingDetail
//               booking={selectedAutoBooking}
//               onBack={handleBackToAutoBookingsList}
//             />
//           )}


//           {activeSection === 'feedback' && (
//             <>
//               <h2 className="section-title">User Feedback</h2>
//               <div className="card-grid">
//                 <Card title="Total Feedback">
//                   <p>{loading ? '...' : '0'}</p>
//                 </Card>
//                 <Card title="New Feedback">
//                   <p>{loading ? '...' : '0'}</p>
//                 </Card>
//               </div>
//               <p className="coming-soon">Feedback management features coming soon</p>
//             </>
//           )}

//           {activeSection === 'reports' && (
//             <>
//               <h2 className="section-title">Reports</h2>
//               <div className="card-grid">
//                 <Card title="Monthly Report">
//                   <button className="report-btn">Generate Report</button>
//                 </Card>
//                 <Card title="User Analytics">
//                   <button className="report-btn">View Analytics</button>
//                 </Card>
//               </div>
//               <p className="coming-soon">Advanced reporting features coming soon</p>
//             </>
//           )}

//           {activeSection === 'settings' && (
//             <>
//               <h2 className="section-title">System Settings</h2>
//               <div className="card-grid">
//                 <Card title="Account Settings">
//                   <button className="settings-btn">Manage Account</button>
//                 </Card>
//                 <Card title="System Preferences">
//                   <button className="settings-btn">Configure</button>
//                 </Card>
//               </div>
//               <p className="coming-soon">Additional settings coming soon</p>
//             </>
//           )}
//         </div>
//       </main>

//       {/* Add Notification Popup */}
//       {notification.show && (
//         <div className="popup-overlay">
//           <div className={`popup-content notification ${notification.type}`}>
//             <h3>{notification.type === 'success' ? '✅ Success' : '❌ Error'}</h3>
//             <p>{notification.message}</p>
//             <button
//               onClick={() => setNotification({ ...notification, show: false })}
//               className="popup-ok"
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





















import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/adminDashboard.css"; // Ensure this path is correct for your project

// ===================================================================================
//  1. SUB-COMPONENTS
//  These are smaller, reusable components used within the main dashboard for clarity.
// ===================================================================================

/**
 * A generic container for dashboard widgets and list items.
 */
function Card({ title, children }) {
  return (
    <div className="card">
      {title && <h3>{title}</h3>}
      <div>{children}</div>
    </div>
  );
}

/**
 * Displays detailed information about a single user.
 */
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
        <p><strong>Address:</strong> {`${user.houseName}, ${user.streetName}, ${user.city}, ${user.state} - ${user.pinCode}`}</p>
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

/**
 * Displays detailed information about a new connection request.
 */
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
        <p><strong>Address:</strong> {`${request.houseName}, ${request.streetName}, ${request.city}`}</p>
        <p><strong>Requested On:</strong> {new Date(request.createdAt).toLocaleString()}</p>
      </div>
      <div className="request-actions detail-actions">
        <button onClick={() => onApprove(request._id, request.email)} className="approve-btn">Approve</button>
        <button onClick={() => onReject(request._id, request.email)} className="reject-btn">Reject</button>
      </div>
    </div>
  );
}

/**
 * Displays detailed information about a single payment record.
 */
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

/**
 * Displays detailed information for a pending auto-booking record.
 */
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
  // --- STATE MANAGEMENT ---
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

  // --- DATA FETCHING ---
  const fetchData = async () => {
    // We don't set loading to true here to allow for silent background refreshes
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
      setLoading(false); // Set loading to false after the first fetch
    }
  };

  useEffect(() => {
    fetchData(); // Fetch all data when the component first mounts
  }, []);

  // --- ACTION & NAVIGATION HANDLERS ---
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const handleApprove = async (kycId, userEmail) => {
    try {
      await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/status`, { status: 'approved' });
      showNotification("Request approved successfully!");
      setSelectedItem(null);
      fetchData(); // Refresh all data
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
    setSelectedItem(null); // Reset detail view when changing main sections
    setActiveSection(section);
  };

  // --- RENDER LOGIC ---
  const renderContent = () => {
    if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;
    if (error) return <p className="error-message">{error}</p>;

    // Detail Views
    if (selectedItem) {
      switch (activeSection) {
        case 'users': return <UserDetail user={selectedItem} onBack={() => setSelectedItem(null)} onDeleteUser={handleDeleteUser} />;
        case 'requests-list': return <RequestDetail request={selectedItem} onBack={() => setSelectedItem(null)} onApprove={handleApprove} onReject={handleReject} />;
        case 'payments': return <PaymentDetail payment={selectedItem} onBack={() => setSelectedItem(null)} />;
        case 'auto-bookings': return <AutoBookingDetail booking={selectedItem} onBack={() => setSelectedItem(null)} />;
        default: setSelectedItem(null); return null;
      }
    }

    // Main Section List Views
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