// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "../styles/adminDashboard.css";

// // Import Chart.js components for the project graph
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import { Bar } from 'react-chartjs-2';

// // Register Chart.js components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// // ===================================================================================
// //  1. SUB-COMPONENTS & HELPERS
// // ===================================================================================

// const formatBookingStatus = (status) => {
//   return (status || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
// };

// function Card({ title, children }) {
//   return (
//     <div className="card">
//       {title && <h3>{title}</h3>}
//       <div>{children}</div>
//     </div>
//   );
// }

// function SearchBar({ section, placeholder, value, onChange, onClear }) {
//   return (
//     <div className="search-container">
//       <input
//         type="text"
//         placeholder={placeholder}
//         value={value}
//         onChange={(e) => onChange(section, e.target.value)}
//         className="search-input"
//       />
//       <span className="search-icon">🔍</span>
//       {value && (
//         <button
//           onClick={() => onClear(section, '')}
//           className="clear-search-btn"
//           title="Clear search"
//         >
//           ✕
//         </button>
//       )}
//     </div>
//   );
// }

// function ResultsCount({ total, filtered, query }) {
//   return (
//     <div className="results-count">
//       {query ? (
//         <span>Showing {filtered} of {total} results for "{query}"</span>
//       ) : (
//         <span>Total: {total} items</span>
//       )}
//     </div>
//   );
// }

// function UserDetail({ user, onBack, onDeleteUser }) {
//   const [showDeletePopup, setShowDeletePopup] = useState(false);
//   if (!user) return null;

//   return (
//     <div className="user-detail-card card">
//       <button onClick={onBack} className="back-btn">
//         <span>←</span> Back to Users List
//       </button>
//       <h3>User Details</h3>
//       <div className="detail-section">
//         <h4>Personal Information</h4>
//         <p><strong>Full Name:</strong> {user.firstName} {user.lastName}</p>
//         <p><strong>Email:</strong> {user.email}</p>
//         <p><strong>Mobile:</strong> {user.mobileNumber}</p>
//         <p><strong>Date of Birth:</strong> {user.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'}</p>
//         <p><strong>Status:</strong> <span className={`status ${user.status}`}>{user.status?.replace(/_/g, ' ') || 'Unknown'}</span></p>
//       </div>
//       <div className="detail-section">
//         <h4>Address Information</h4>
//         <p><strong>House Name:</strong> {user.houseName || 'Not provided'}</p>
//         <p><strong>Street:</strong> {user.streetName || 'Not provided'}</p>
//         <p><strong>Town:</strong> {user.town || 'Not provided'}</p>
//         <p><strong>District:</strong> {user.district || 'Not provided'}</p>
//         <p><strong>State:</strong> {user.state || 'Not provided'}</p>
//         <p><strong>Pin Code:</strong> {user.pinCode || 'Not provided'}</p>
//       </div>
//       <div className="detail-section">
//         <h4>Account Information</h4>
//         <p><strong>Joined On:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Not available'}</p>
//         <p><strong>Last Updated:</strong> {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Not available'}</p>
//       </div>
//       <div className="user-actions detail-actions">
//         <button onClick={() => setShowDeletePopup(true)} className="delete-btn">Delete User</button>
//       </div>

//       {showDeletePopup && (
//         <div className="popup-overlay">
//           <div className="popup-content">
//             <h3>Confirm Deletion</h3>
//             <p>Are you sure you want to permanently delete this user and all their associated data?</p>
//             <div className="popup-buttons">
//               <button onClick={() => { onDeleteUser(user.email); setShowDeletePopup(false); }} className="confirm-yes">Yes, Delete</button>
//               <button onClick={() => setShowDeletePopup(false)} className="confirm-no">Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function RequestDetail({ request, onApprove, onReject, onBack }) {
//   if (!request) return null;
//   return (
//     <div className="request-detail-card card">
//       <button onClick={onBack} className="back-btn">
//         <span>←</span> Back to Requests List
//       </button>
//       <h3>Connection Request Details</h3>
//       <div className="detail-section">
//         <h4>Personal Information</h4>
//         <p><strong>Full Name:</strong> {request.firstName} {request.lastName}</p>
//         <p><strong>Email:</strong> {request.email}</p>
//         <p><strong>Mobile:</strong> {request.mobileNumber}</p>
//         <p><strong>Date of Birth:</strong> {request.dob ? new Date(request.dob).toLocaleDateString() : 'Not provided'}</p>
//       </div>
//       <div className="detail-section">
//         <h4>Address Information</h4>
//         <p><strong>House Name:</strong> {request.houseName}</p>
//         <p><strong>Street:</strong> {request.streetName}</p>
//         <p><strong>Town:</strong> {request.town}</p>
//         <p><strong>District:</strong> {request.district}</p>
//         <p><strong>State:</strong> {request.state}</p>
//         <p><strong>Pin Code:</strong> {request.pinCode}</p>
//       </div>
//       <div className="detail-section">
//         <h4>Request Information</h4>
//         <p><strong>Requested On:</strong> {new Date(request.createdAt).toLocaleString()}</p>
//         <p><strong>Status:</strong> <span className={`status ${request.status}`}>{request.status?.replace(/_/g, ' ')}</span></p>
//       </div>
//       <div className="request-actions detail-actions">
//         <button onClick={() => onApprove(request._id, request.email)} className="approve-btn">Approve</button>
//         <button onClick={() => onReject(request._id, request.email)} className="reject-btn">Reject</button>
//       </div>
//     </div>
//   );
// }

// function PaymentDetail({ payment, onBack }) {
//   if (!payment) return null;
//   return (
//     <div className="payment-detail-card card">
//       <button onClick={onBack} className="back-btn">
//         <span>←</span> Back to Payments List
//       </button>
//       <h3>Payment Details</h3>
//       <div className="detail-section">
//         <h4>Customer Information</h4>
//         <p><strong>Customer Name:</strong> {payment.customerName}</p>
//         <p><strong>Email:</strong> {payment.email}</p>
//       </div>
//       <div className="detail-section">
//         <h4>Payment Information</h4>
//         <p><strong>Amount Paid:</strong> ₹{payment.amountDue}</p>
//         <p><strong>Payment Date:</strong> {new Date(payment.dateOfPayment || payment.createdAt).toLocaleString()}</p>
//         <p><strong>Payment Type:</strong> {payment.paymentType ? payment.paymentType.replace(/_/g, ' ') : 'Initial Connection'}</p>
//         <p><strong>Payment ID:</strong> {payment._id}</p>
//       </div>
//     </div>
//   );
// }

// function AutoBookingDetail({ booking, onBack }) {
//   if (!booking) return null;
//   return (
//     <div className="auto-booking-detail-card card">
//       <button onClick={onBack} className="back-btn">
//         <span>←</span> Back to Bookings List
//       </button>
//       <h3>Auto-Booking Details</h3>
//       <div className="detail-section">
//         <h4>Customer Information</h4>
//         <p><strong>Customer Name:</strong> {booking.customerName || 'Not available'}</p>
//         <p><strong>Email:</strong> {booking.email}</p>
//         <p><strong>Mobile Number:</strong> {booking.mobileNumber || 'Not available'}</p>
//         <p><strong>Address:</strong> {booking.address || 'Not available'}</p>
//       </div>
//       <div className="detail-section">
//         <h4>Booking Information</h4>
//         <p><strong>Booking Date:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
//         <p><strong>Last Updated:</strong> {new Date(booking.updatedAt).toLocaleString()}</p>
//         <p><strong>Status:</strong> <span className={`status ${booking.status}`}>{formatBookingStatus(booking.status)}</span></p>
//         <p><strong>Booking ID:</strong> {booking._id}</p>
//       </div>
//     </div>
//   );
// }

// function FeedbackDetail({ feedback, onBack }) {
//   if (!feedback) return null;
//   return (
//     <div className="feedback-detail-card card">
//       <button onClick={onBack} className="back-btn">
//         <span>←</span> Back to Feedback List
//       </button>
//       <h3>Feedback Details</h3>
//       <div className="detail-section">
//         <h4>Feedback Information</h4>
//         <p><strong>User Email:</strong> {feedback.email}</p>
//         <p><strong>Type:</strong> <span className={`feedback-type ${feedback.type?.toLowerCase()}`}>{feedback.type}</span></p>
//         <p><strong>Submitted On:</strong> {new Date(feedback.createdAt).toLocaleString()}</p>
//         <p><strong>Feedback ID:</strong> {feedback._id}</p>
//       </div>
//       <div className="detail-section">
//         <h4>Message Content</h4>
//         <p style={{borderBottom: 'none', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', fontStyle: 'italic'}}>
//           "{feedback.message}"
//         </p>
//       </div>
//     </div>
//   );
// }

// // ===================================================================================
// //  2. MAIN DASHBOARD COMPONENT
// // ===================================================================================

// export default function Dashboard() {
//   const [pendingRequests, setPendingRequests] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [allPayments, setAllPayments] = useState([]);
//   const [initialPayments, setInitialPayments] = useState([]);
//   const [refillPayments, setRefillPayments] = useState([]);
//   const [pendingBookings, setPendingBookings] = useState([]);
//   const [fulfilledBookings, setFulfilledBookings] = useState([]);
//   const [allBookings, setAllBookings] = useState([]);
//   const [myFeedback, setMyFeedback] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeSection, setActiveSection] = useState('dashboard-summary');
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [notification, setNotification] = useState({ show: false, message: '', type: '' });
//   const [showSignOutPopup, setShowSignOutPopup] = useState(false);

//   const [showReportModal, setShowReportModal] = useState(false);
//   const [reportDate, setReportDate] = useState('');
//   const [reportData, setReportData] = useState(null);
//   const [generatingReport, setGeneratingReport] = useState(false);

//   const [searchQueries, setSearchQueries] = useState({
//     users: '',
//     requests: '',
//     initialPayments: '',
//     refillPayments: '',
//     bookings: '',
//     fulfilledBookings: '',
//     feedback: ''
//   });

//   const navigate = useNavigate();

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [
//         requestsRes, usersRes, paymentsRes,
//         allBookingsRes, fulfilledBookingsRes, myFeedbackRes
//       ] = await Promise.all([
//         axios.get("http://localhost:5000/api/newconnection/requests/pending"),
//         axios.get("http://localhost:5000/api/newconnection"),
//         axios.get("http://localhost:5000/api/payment"),
//         axios.get("http://localhost:5000/api/autobooking/all"),
//         axios.get("http://localhost:5000/api/autobooking/fulfilled"),
//         axios.get("http://localhost:5000/api/myfeedback")
//       ]);

//       setPendingRequests(requestsRes.data);
//       setAllUsers(usersRes.data);
//       setAllPayments(paymentsRes.data);
      
//       const initialPaymentsData = paymentsRes.data.filter(p => p.paymentType === 'initial_connection' || !p.paymentType);
//       const refillPaymentsData = paymentsRes.data.filter(p => p.paymentType === 'gas_refill');
      
//       setInitialPayments(initialPaymentsData);
//       setRefillPayments(refillPaymentsData);

//       setAllBookings(allBookingsRes.data);
//       setPendingBookings(allBookingsRes.data.filter(b => b.status === 'booking_pending'));
//       setFulfilledBookings(fulfilledBookingsRes.data);
//       setMyFeedback(myFeedbackRes.data);

//     } catch (err) {
//       setError("Failed to load dashboard data. Please check the server connection and refresh.");
//       console.error("Dashboard fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
//     return () => clearInterval(interval);
//   }, []);

//   const showNotification = (message, type = 'success') => {
//     setNotification({ show: true, message, type });
//   };

//   const handleApprove = async (kycId, userEmail) => {
//     try {
//       await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/status`, { status: 'approved' });
//       showNotification("Request approved successfully!");
//       setSelectedItem(null);
//       fetchData();
//     } catch (err) {
//       showNotification("Failed to approve request.", 'error');
//     }
//   };

//   const handleReject = async (kycId, userEmail) => {
//     try {
//       await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/status`, { status: 'rejected' });
//       showNotification("Request rejected and user removed.");
//       setSelectedItem(null);
//       fetchData();
//     } catch (err) {
//       showNotification("Failed to reject request.", 'error');
//     }
//   };

//   const handleDeleteUser = async (userEmail) => {
//     try {
//       await axios.delete(`http://localhost:5000/api/newconnection/${userEmail}`);
//       showNotification("User and all associated data deleted permanently!");
//       setSelectedItem(null);
//       fetchData();
//     } catch (err)
//     {
//       showNotification("Failed to delete user.", 'error');
//     }
//   };

//   const handleSignOutClick = () => setShowSignOutPopup(true);
  
//   const handleSignOutConfirm = () => {
//     setShowSignOutPopup(false);
//     localStorage.clear();
//     navigate('/login', { replace: true });
//   };

//   const handleSignOutCancel = () => setShowSignOutPopup(false);

//   const handleSidebarNav = (section) => {
//     setSelectedItem(null);
//     setActiveSection(section);
//   };

//   const generateReport = async () => {
//     if (!reportDate) {
//       showNotification("Please select a month and year to generate a report.", 'error');
//       return;
//     }
    
//     setGeneratingReport(true);
//     setReportData(null); 

//     try {
//       await new Promise(resolve => setTimeout(resolve, 500));

//       const [year, month] = reportDate.split('-').map(Number);
//       const startDate = new Date(year, month - 1, 1);
//       const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      
//       const filterByMonth = (items, dateField = 'createdAt') => {
//         return items.filter(item => {
//           const itemDate = new Date(item[dateField]);
//           return itemDate >= startDate && itemDate <= endDate;
//         });
//       };
      
//       const monthlyInitialPayments = filterByMonth(initialPayments, 'createdAt');
//       const monthlyRefillPayments = filterByMonth(refillPayments, 'createdAt');
//       const monthlyBookings = filterByMonth(allBookings, 'createdAt');
      
//       const totalRevenue = [...monthlyInitialPayments, ...monthlyRefillPayments]
//         .reduce((sum, payment) => sum + (payment.amountDue || 0), 0);

//       const report = {
//         month: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
//         newUsers: filterByMonth(allUsers, 'createdAt').length,
//         deactivatedUsers: allUsers.filter(user => 
//           user.status === 'deactivated' && 
//           new Date(user.updatedAt) >= startDate && 
//           new Date(user.updatedAt) <= endDate
//         ).length,
//         totalBookings: monthlyBookings.length,
//         fulfilledBookings: monthlyBookings.filter(b => b.status === 'fulfilled').length,
//         cancelledBookings: monthlyBookings.filter(b => b.status === 'cancelled').length,
//         initialPayments: monthlyInitialPayments.length,
//         refillPayments: monthlyRefillPayments.length,
//         totalRevenue: totalRevenue.toFixed(2),
//         details: {
//           monthlyInitialPayments,
//           monthlyRefillPayments
//         }
//       };
      
//       setReportData(report);

//     } catch (e) {
//       showNotification("An error occurred while generating the report.", 'error');
//     } finally {
//       setGeneratingReport(false);
//     }
//   };

//   const downloadReport = () => {
//     if (!reportData) {
//       showNotification("Please generate a report first.", 'error');
//       return;
//     }

//     let content = `Quick LPG Connect - Monthly Report\n`;
//     content += `Month: ${reportData.month}\n\n`;
//     content += `========================================\n`;
//     content += `SUMMARY\n`;
//     content += `========================================\n`;
//     content += `New Users: ${reportData.newUsers}\n`;
//     content += `Deactivated Users: ${reportData.deactivatedUsers}\n`;
//     content += `Total Bookings: ${reportData.totalBookings}\n`;
//     content += `Fulfilled Bookings: ${reportData.fulfilledBookings}\n`;
//     content += `Cancelled Bookings: ${reportData.cancelledBookings}\n`;
//     content += `Initial Connection Payments: ${reportData.initialPayments}\n`;
//     content += `Gas Refill Payments: ${reportData.refillPayments}\n`;
//     content += `----------------------------------------\n`;
//     content += `TOTAL REVENUE: ₹${reportData.totalRevenue}\n`;
//     content += `========================================\n\n`;

//     content += `DETAILED PAYMENTS\n`;
//     content += `========================================\n`;
//     content += `Initial Payments:\n`;
//     if (reportData.details.monthlyInitialPayments.length > 0) {
//       reportData.details.monthlyInitialPayments.forEach(p => {
//         content += `- ${p.customerName} (${p.email}) paid ₹${p.amountDue} on ${new Date(p.createdAt).toLocaleDateString()}\n`;
//       });
//     } else {
//       content += `- None\n`;
//     }
    
//     content += `\nRefill Payments:\n`;
//     if (reportData.details.monthlyRefillPayments.length > 0) {
//       reportData.details.monthlyRefillPayments.forEach(p => {
//         content += `- ${p.customerName} (${p.email}) paid ₹${p.amountDue} on ${new Date(p.createdAt).toLocaleDateString()}\n`;
//       });
//     } else {
//       content += `- None\n`;
//     }

//     const blob = new Blob([content], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `report-${reportDate}.txt`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   const handleSearchChange = (section, value) => {
//     setSearchQueries(prev => ({ ...prev, [section]: value.toLowerCase() }));
//   };

//   const filterBySearch = (items, query, searchFields) => {
//     if (!query.trim()) return items;
//     return items.filter(item =>
//       searchFields.some(field => {
//         const value = field.split('.').reduce((obj, key) => obj?.[key], item);
//         return value && value.toString().toLowerCase().includes(query);
//       })
//     );
//   };

//   const getFilteredUsers = () => filterBySearch(allUsers, searchQueries.users, ['firstName', 'lastName', 'email', 'mobileNumber']);
//   const getFilteredRequests = () => filterBySearch(pendingRequests, searchQueries.requests, ['firstName', 'lastName', 'email', 'mobileNumber']);
//   const getFilteredInitialPayments = () => filterBySearch(initialPayments, searchQueries.initialPayments, ['customerName', 'email']);
//   const getFilteredRefillPayments = () => filterBySearch(refillPayments, searchQueries.refillPayments, ['customerName', 'email']);
//   const getFilteredFeedback = () => filterBySearch(myFeedback, searchQueries.feedback, ['email']);
//   const getFilteredBookings = () => filterBySearch(pendingBookings, searchQueries.bookings, ['email', 'status']);
//   const getFilteredFulfilledBookings = () => filterBySearch(fulfilledBookings, searchQueries.fulfilledBookings, ['email', 'status']);

//   const getProjectGraphData = () => {
//     if (!allUsers.length || !allPayments.length) return null;
//     const months = [];
//     const currentDate = new Date();
//     for (let i = 5; i >= 0; i--) {
//       const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
//       months.push({
//         label: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
//         year: date.getFullYear(),
//         month: date.getMonth()
//       });
//     }
//     const userData = months.map(month => {
//       return allUsers.filter(user => {
//         const userDate = new Date(user.createdAt);
//         return userDate.getFullYear() === month.year && userDate.getMonth() === month.month;
//       }).length;
//     });
//     const revenueData = months.map(month => {
//       return allPayments.filter(payment => {
//         const paymentDate = new Date(payment.createdAt);
//         return paymentDate.getFullYear() === month.year && paymentDate.getMonth() === month.month;
//       }).reduce((sum, payment) => sum + (payment.amountDue || 0), 0);
//     });
//     return {
//       labels: months.map(m => m.label),
//       datasets: [
//         { label: 'New Users', data: userData, backgroundColor: 'rgba(54, 162, 235, 0.6)', yAxisID: 'y' },
//         { label: 'Revenue (₹)', data: revenueData, backgroundColor: 'rgba(255, 99, 132, 0.6)', yAxisID: 'y1' }
//       ]
//     };
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: { legend: { position: 'top' }, title: { display: true, text: 'Project Growth - Last 6 Months' } },
//     scales: {
//       y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Number of Users' } },
//       y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Revenue (₹)' }, grid: { drawOnChartArea: false } }
//     }
//   };

//   const renderContent = () => {
//     if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;
//     if (error) return <p className="error-message">{error}</p>;

//     if (selectedItem) {
//       switch (activeSection) {
//         case 'users': 
//           return <UserDetail user={selectedItem} onBack={() => setSelectedItem(null)} onDeleteUser={handleDeleteUser} />;
//         case 'requests-list': 
//           return <RequestDetail request={selectedItem} onBack={() => setSelectedItem(null)} onApprove={handleApprove} onReject={handleReject} />;
//         case 'payments':
//           return <PaymentDetail payment={selectedItem} onBack={() => setSelectedItem(null)} />;
//         case 'bookings':
//           return <AutoBookingDetail booking={selectedItem} onBack={() => setSelectedItem(null)} />;
//         case 'my-feedback':
//           return <FeedbackDetail feedback={selectedItem} onBack={() => setSelectedItem(null)} />;
//         default: 
//           setSelectedItem(null); 
//           return null;
//       }
//     }

//     const getFeedbackCardClass = (type) => {
//       switch (type) {
//         case 'Urgent': return 'urgent';
//         case 'Complaint': return 'complaint';
//         default: return '';
//       }
//     };

//     switch (activeSection) {
//       case 'dashboard-summary':
//         return (
//           <div>
//             <div className="simplified-card-grid">
//               <Card title="Total Users">
//                 <p>{allUsers.length}</p>
//               </Card>
//               <Card title="Active Connections">
//                 <p>{allUsers.filter(u => u.status === 'active').length}</p>
//               </Card>
//               <div className="card">
//                 <h3>📊 Generate Report</h3>
//                 <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '1rem' }}>
//                   Generate comprehensive monthly reports.
//                 </p>
//                 <button onClick={() => setShowReportModal(true)} className="report-btn">
//                   📊 Generate Monthly Report
//                 </button>
//               </div>
//             </div>
//             <div className="graph-section">
//               <div className="graph-container">
//                 <h3>📈 Project Overview</h3>
//                 {getProjectGraphData() ? (
//                   <div className="chart-wrapper">
//                     <Bar data={getProjectGraphData()} options={chartOptions} />
//                   </div>
//                 ) : (
//                   <div className="no-chart-data">
//                     <p>Loading project data...</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         );

//       case 'users':
//         const filteredUsers = getFilteredUsers();
//         return (
//           <div>
//             <SearchBar section="users" placeholder="Search users by name, email, or phone..." value={searchQueries.users} onChange={handleSearchChange} onClear={handleSearchChange} />
//             <ResultsCount total={allUsers.length} filtered={filteredUsers.length} query={searchQueries.users} />
//             <div className="list-container">
//               {filteredUsers.length > 0 ? filteredUsers.map(user => (
//                 <div key={user._id} className="list-item card clickable" onClick={() => setSelectedItem(user)}>
//                   <h4>{user.firstName} {user.lastName} ({user.email})</h4>
//                   <p><strong>Phone:</strong> {user.mobileNumber}</p>
//                   <p><strong>Status:</strong> <span className={`status ${user.status}`}>{user.status.replace(/_/g, ' ')}</span></p>
//                 </div>
//               )) : <p className="no-results">No users found.</p>}
//             </div>
//           </div>
//         );

//       case 'requests-list':
//         const filteredRequests = getFilteredRequests();
//         return (
//           <div>
//             <SearchBar section="requests" placeholder="Search requests by name, email, or phone..." value={searchQueries.requests} onChange={handleSearchChange} onClear={handleSearchChange} />
//             <ResultsCount total={pendingRequests.length} filtered={filteredRequests.length} query={searchQueries.requests} />
//             <div className="list-container">
//               {filteredRequests.length > 0 ? filteredRequests.map(req => (
//                 <div key={req._id} className="list-item card clickable" onClick={() => setSelectedItem(req)}>
//                   <h4>{req.firstName} {req.lastName} ({req.email})</h4>
//                   <p><strong>Phone:</strong> {req.mobileNumber}</p>
//                   <p><strong>Requested On:</strong> {new Date(req.createdAt).toLocaleDateString()}</p>
//                 </div>
//               )) : <p className="no-results">No pending requests.</p>}
//             </div>
//           </div>
//         );

//       case 'payments':
//         return (
//           <div>
//             <div className="section-tabs">
//               <button 
//                 className={`tab-btn ${activeSubSection === 'initial' ? 'active' : ''}`}
//                 onClick={() => setActiveSubSection('initial')}
//               >
//                 Initial Payments ({initialPayments.length})
//               </button>
//               <button 
//                 className={`tab-btn ${activeSubSection === 'refill' ? 'active' : ''}`}
//                 onClick={() => setActiveSubSection('refill')}
//               >
//                 Refill Payments ({refillPayments.length})
//               </button>
//             </div>

//             {activeSubSection === 'initial' ? (
//               <div>
//                 <SearchBar section="initialPayments" placeholder="Search by customer name or email..." value={searchQueries.initialPayments} onChange={handleSearchChange} onClear={handleSearchChange} />
//                 <ResultsCount total={initialPayments.length} filtered={getFilteredInitialPayments().length} query={searchQueries.initialPayments} />
//                 <div className="list-container">
//                   {getFilteredInitialPayments().length > 0 ? getFilteredInitialPayments().map(p => (
//                     <div key={p._id} className="list-item card clickable" onClick={() => setSelectedItem(p)}>
//                       <h4>{p.customerName} (₹{p.amountDue})</h4>
//                       <p><strong>Email:</strong> {p.email}</p>
//                       <p><strong>Date:</strong> {new Date(p.dateOfPayment || p.createdAt).toLocaleDateString()}</p>
//                       <p><strong>Type:</strong> <span className="payment-type initial">Initial Connection</span></p>
//                     </div>
//                   )) : <p className="no-results">No initial payments found.</p>}
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <SearchBar section="refillPayments" placeholder="Search by customer name or email..." value={searchQueries.refillPayments} onChange={handleSearchChange} onClear={handleSearchChange} />
//                 <ResultsCount total={refillPayments.length} filtered={getFilteredRefillPayments().length} query={searchQueries.refillPayments} />
//                 <div className="list-container">
//                   {getFilteredRefillPayments().length > 0 ? getFilteredRefillPayments().map(p => (
//                     <div key={p._id} className="list-item card clickable" onClick={() => setSelectedItem(p)}>
//                       <h4>{p.customerName} (₹{p.amountDue})</h4>
//                       <p><strong>Email:</strong> {p.email}</p>
//                       <p><strong>Date:</strong> {new Date(p.dateOfPayment || p.createdAt).toLocaleDateString()}</p>
//                       <p><strong>Type:</strong> <span className="payment-type refill">Gas Refill</span></p>
//                     </div>
//                   )) : <p className="no-results">No refill payments found.</p>}
//                 </div>
//               </div>
//             )}
//           </div>
//         );

//       case 'bookings':
//         return (
//           <div>
//             <div className="section-tabs">
//               <button 
//                 className={`tab-btn ${activeSubSection === 'pending' ? 'active' : ''}`}
//                 onClick={() => setActiveSubSection('pending')}
//               >
//                 Pending Bookings ({pendingBookings.length})
//               </button>
//               <button 
//                 className={`tab-btn ${activeSubSection === 'fulfilled' ? 'active' : ''}`}
//                 onClick={() => setActiveSubSection('fulfilled')}
//               >
//                 Fulfilled Bookings ({fulfilledBookings.length})
//               </button>
//             </div>

//             {activeSubSection === 'pending' ? (
//               <div>
//                 <SearchBar section="bookings" placeholder="Search bookings by email..." value={searchQueries.bookings} onChange={handleSearchChange} onClear={handleSearchChange} />
//                 <ResultsCount total={pendingBookings.length} filtered={getFilteredBookings().length} query={searchQueries.bookings} />
//                 <div className="list-container">
//                   {getFilteredBookings().length > 0 ? getFilteredBookings().map(b => (
//                     <div key={b._id} className="list-item card clickable" onClick={() => setSelectedItem(b)}>
//                       <h4>{b.customerName || 'Customer'} ({b.email})</h4>
//                       <p><strong>Contact:</strong> {b.mobileNumber || 'Not available'}</p>
//                       <p><strong>Booked On:</strong> {new Date(b.updatedAt).toLocaleDateString()}</p>
//                       <p><strong>Status:</strong> <span className={`status ${b.status}`}>{formatBookingStatus(b.status)}</span></p>
//                     </div>
//                   )) : <p className="no-results">No pending bookings found.</p>}
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <SearchBar section="fulfilledBookings" placeholder="Search by email..." value={searchQueries.fulfilledBookings} onChange={handleSearchChange} onClear={handleSearchChange} />
//                 <ResultsCount total={fulfilledBookings.length} filtered={getFilteredFulfilledBookings().length} query={searchQueries.fulfilledBookings} />
//                 <div className="list-container">
//                   {getFilteredFulfilledBookings().length > 0 ? getFilteredFulfilledBookings().map(b => (
//                     <div key={b._id} className="list-item card clickable" onClick={() => setSelectedItem(b)}>
//                       <h4>{b.customerName || 'Customer'} ({b.email})</h4>
//                       <p><strong>Contact:</strong> {b.mobileNumber || 'Not available'}</p>
//                       <p><strong>Fulfilled On:</strong> {new Date(b.updatedAt).toLocaleDateString()}</p>
//                       <p><strong>Status:</strong> <span className={`status ${b.status}`}>{formatBookingStatus(b.status)}</span></p>
//                     </div>
//                   )) : <p className="no-results">No fulfilled bookings found.</p>}
//                 </div>
//               </div>
//             )}
//           </div>
//         );

//       case 'my-feedback':
//         const filteredFeedback = getFilteredFeedback();
//         return (
//           <div>
//             <SearchBar section="feedback" placeholder="Search feedback by email..." value={searchQueries.feedback} onChange={handleSearchChange} onClear={handleSearchChange} />
//             <ResultsCount total={myFeedback.length} filtered={filteredFeedback.length} query={searchQueries.feedback} />
//             <div className="list-container">
//               {filteredFeedback.length > 0 ? filteredFeedback.map(fb => (
//                 <div key={fb._id} className={`list-item card feedback-card ${getFeedbackCardClass(fb.type)} clickable`} onClick={() => setSelectedItem(fb)}>
//                   <div className="feedback-header">
//                     <h4>{fb.email}</h4>
//                     <span className="feedback-type">{fb.type}</span>
//                   </div>
//                   <p className="feedback-message">{fb.message.length > 100 ? fb.message.substring(0, 100) + '...' : fb.message}</p>
//                   <p className="feedback-date"><strong>Received On:</strong> {new Date(fb.createdAt).toLocaleString()}</p>
//                 </div>
//               )) : <p className="no-results">No feedback messages found.</p>}
//             </div>
//           </div>
//         );

//       default: return <p className="coming-soon">This section is under construction.</p>;
//     }
//   };
  
//   // Add state for sub-sections
//   const [activeSubSection, setActiveSubSection] = useState('initial'); // For payments: 'initial' or 'refill'

//   // Update section titles
//   const getSectionTitle = () => {
//     if (selectedItem) return "Details View";
//     const titles = {
//       'dashboard-summary': 'Dashboard Summary',
//       'users': 'All Users',
//       'requests-list': 'Pending Connection Requests',
//       'payments': 'Payment Management',
//       'bookings': 'Booking Management',
//       'my-feedback': "Feedback"
//     };
//     return titles[activeSection] || 'Admin Panel';
//   };

//   const myUrgentFeedbackCount = myFeedback.filter(fb => fb.type === 'Urgent').length;

//   return (
//     <div className="dashboard">
//       <aside className="sidebar">
//         <h2 className="logo">Admin Panel</h2>
//         <nav>
//           <ul>
//             <li className={activeSection === 'dashboard-summary' ? 'active' : ''} onClick={() => handleSidebarNav('dashboard-summary')}>Dashboard</li>
//             <li className={activeSection === 'users' ? 'active' : ''} onClick={() => handleSidebarNav('users')}>Users</li>
//             <li className={activeSection === 'requests-list' ? 'active' : ''} onClick={() => handleSidebarNav('requests-list')}>Requests {pendingRequests.length > 0 && <span className="pending-count">({pendingRequests.length})</span>}</li>
//             <li className={activeSection === 'payments' ? 'active' : ''} onClick={() => { handleSidebarNav('payments'); setActiveSubSection('initial'); }}>
//               Payments ({allPayments.length})
//             </li>
//             <li className={activeSection === 'bookings' ? 'active' : ''} onClick={() => { handleSidebarNav('bookings'); setActiveSubSection('pending'); }}>
//               Bookings {pendingBookings.length > 0 && <span className="pending-count">({pendingBookings.length})</span>}
//             </li>
//             <li className={activeSection === 'my-feedback' ? 'active' : ''} onClick={() => handleSidebarNav('my-feedback')}>
//               Feedback {myUrgentFeedbackCount > 0 && <span className="pending-count urgent-count">({myUrgentFeedbackCount})</span>}
//             </li>
//           </ul>
//         </nav>
//         <div className="user-info">
//           <div className="avatar"></div>
//           <div>
//             <p className="username">Admin User</p>
//             <p className="signout" onClick={handleSignOutClick}>Sign Out</p>
//           </div>
//         </div>
//       </aside>

//       <main className="main-content">
//         <div className="content-center">
//           <h1 className="page-title">{getSectionTitle()}</h1>
//           {renderContent()}
//         </div>
//       </main>

//       {notification.show && (
//         <div className="popup-overlay">
//           <div className={`popup-content notification ${notification.type}`}>
//             <h3>{notification.type === 'success' ? '✅ Success' : '❌ Error'}</h3>
//             <p>{notification.message}</p>
//             <button onClick={() => setNotification({ ...notification, show: false })} className="popup-ok">OK</button>
//           </div>
//         </div>
//       )}
//       {showSignOutPopup && (
//         <div className="popup-overlay">
//           <div className="popup-content">
//             <h3>Confirm Sign Out</h3>
//             <p>Are you sure you want to sign out?</p>
//             <div className="popup-buttons">
//               <button onClick={handleSignOutConfirm} className="confirm-yes">Yes, Sign Out</button>
//               <button onClick={handleSignOutCancel} className="confirm-no">Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//       {showReportModal && (
//          <div className="popup-overlay">
//           <div className="popup-content report-modal">
//             <h3>📊 Generate Monthly Report</h3>
//             <p>Select a month and year to generate a comprehensive report.</p>
//             <div className="report-form">
//               <label htmlFor="reportDate">Select Month and Year:</label>
//               <input type="month" id="reportDate" value={reportDate} onChange={(e) => setReportDate(e.target.value)} max={new Date().toISOString().slice(0, 7)} />
//               <div className="popup-buttons">
//                 <button onClick={generateReport} disabled={generatingReport} className="confirm-yes">
//                   {generatingReport ? 'Generating...' : '📊 Generate Report'}
//                 </button>
//                 <button onClick={() => { setShowReportModal(false); setReportData(null); setReportDate(''); }} className="confirm-no">
//                   Cancel
//                 </button>
//               </div>
//             </div>
//             {reportData && (
//               <div className="report-results">
//                 <h4>📊 Report for {reportData.month}</h4>
//                 <div className="report-summary">
//                   <div className="report-grid">
//                     <div className="report-item"><span className="report-label">👥 New Users:</span><span className="report-value">{reportData.newUsers}</span></div>
//                     <div className="report-item"><span className="report-label">❌ Deactivated Users:</span><span className="report-value">{reportData.deactivatedUsers}</span></div>
//                     <div className="report-item"><span className="report-label">📋 Total Bookings:</span><span className="report-value">{reportData.totalBookings}</span></div>
//                     <div className="report-item"><span className="report-label">✅ Fulfilled Bookings:</span><span className="report-value">{reportData.fulfilledBookings}</span></div>
//                     <div className="report-item"><span className="report-label">🚫 Cancelled Bookings:</span><span className="report-value">{reportData.cancelledBookings}</span></div>
//                     <div className="report-item"><span className="report-label">🔄 Refill Payments:</span><span className="report-value">{reportData.refillPayments}</span></div>
//                     <div className="report-item"><span className="report-label">🆕 Initial Payments:</span><span className="report-value">{reportData.initialPayments}</span></div>
//                     <div className="report-item highlight"><span className="report-label">💰 Total Revenue:</span><span className="report-value">₹{reportData.totalRevenue}</span></div>
//                   </div>
//                 </div>
//                 <button onClick={downloadReport} className="download-btn">
//                   📥 Download Detailed Report
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





























import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/adminDashboard.css";

// Import Chart.js components for the project graph
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
      <button onClick={onBack} className="back-btn">
        <span>←</span> Back to Users List
      </button>
      <h3>User Details</h3>
      <div className="detail-section">
        <h4>Personal Information</h4>
        <p><strong>Full Name:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Mobile:</strong> {user.mobileNumber}</p>
        <p><strong>Date of Birth:</strong> {user.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'}</p>
        <p><strong>Status:</strong> <span className={`status ${user.status}`}>{user.status?.replace(/_/g, ' ') || 'Unknown'}</span></p>
      </div>
      <div className="detail-section">
        <h4>Address Information</h4>
        <p><strong>House Name:</strong> {user.houseName || 'Not provided'}</p>
        <p><strong>Street:</strong> {user.streetName || 'Not provided'}</p>
        <p><strong>Town:</strong> {user.town || 'Not provided'}</p>
        <p><strong>District:</strong> {user.district || 'Not provided'}</p>
        <p><strong>State:</strong> {user.state || 'Not provided'}</p>
        <p><strong>Pin Code:</strong> {user.pinCode || 'Not provided'}</p>
      </div>
      <div className="detail-section">
        <h4>Account Information</h4>
        <p><strong>Joined On:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Not available'}</p>
        <p><strong>Last Updated:</strong> {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Not available'}</p>
      </div>
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
      <button onClick={onBack} className="back-btn">
        <span>←</span> Back to Requests List
      </button>
      <h3>Connection Request Details</h3>
      <div className="detail-section">
        <h4>Personal Information</h4>
        <p><strong>Full Name:</strong> {request.firstName} {request.lastName}</p>
        <p><strong>Email:</strong> {request.email}</p>
        <p><strong>Mobile:</strong> {request.mobileNumber}</p>
        <p><strong>Date of Birth:</strong> {request.dob ? new Date(request.dob).toLocaleDateString() : 'Not provided'}</p>
      </div>
      <div className="detail-section">
        <h4>Address Information</h4>
        <p><strong>House Name:</strong> {request.houseName}</p>
        <p><strong>Street:</strong> {request.streetName}</p>
        <p><strong>Town:</strong> {request.town}</p>
        <p><strong>District:</strong> {request.district}</p>
        <p><strong>State:</strong> {request.state}</p>
        <p><strong>Pin Code:</strong> {request.pinCode}</p>
      </div>
      <div className="detail-section">
        <h4>Request Information</h4>
        <p><strong>Requested On:</strong> {new Date(request.createdAt).toLocaleString()}</p>
        <p><strong>Status:</strong> <span className={`status ${request.status}`}>{request.status?.replace(/_/g, ' ')}</span></p>
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
      <button onClick={onBack} className="back-btn">
        <span>←</span> Back to Payments List
      </button>
      <h3>Payment Details</h3>
      <div className="detail-section">
        <h4>Customer Information</h4>
        <p><strong>Customer Name:</strong> {payment.customerName}</p>
        <p><strong>Email:</strong> {payment.email}</p>
      </div>
      <div className="detail-section">
        <h4>Payment Information</h4>
        <p><strong>Amount Paid:</strong> ₹{payment.amountDue}</p>
        <p><strong>Payment Date:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
        <p><strong>Payment Type:</strong> {payment.paymentType ? payment.paymentType.replace(/_/g, ' ') : 'Initial Connection'}</p>
        <p><strong>Payment ID:</strong> {payment._id}</p>
      </div>
    </div>
  );
}

function AutoBookingDetail({ booking, onBack }) {
  if (!booking) return null;
  return (
    <div className="auto-booking-detail-card card">
      <button onClick={onBack} className="back-btn">
        <span>←</span> Back to Bookings List
      </button>
      <h3>Auto-Booking Details</h3>
      <div className="detail-section">
        <h4>Customer Information</h4>
        <p><strong>Customer Name:</strong> {booking.customerName || 'Not available'}</p>
        <p><strong>Email:</strong> {booking.email}</p>
        <p><strong>Mobile Number:</strong> {booking.mobileNumber || 'Not available'}</p>
        <p><strong>Address:</strong> {booking.address || 'Not available'}</p>
      </div>
      <div className="detail-section">
        <h4>Booking Information</h4>
        <p><strong>Booking Date:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
        <p><strong>Last Updated:</strong> {new Date(booking.updatedAt).toLocaleString()}</p>
        <p><strong>Status:</strong> <span className={`status ${booking.status}`}>{formatBookingStatus(booking.status)}</span></p>
        <p><strong>Booking ID:</strong> {booking._id}</p>
      </div>
    </div>
  );
}

function FeedbackDetail({ feedback, onBack }) {
  if (!feedback) return null;
  return (
    <div className="feedback-detail-card card">
      <button onClick={onBack} className="back-btn">
        <span>←</span> Back to Feedback List
      </button>
      <h3>Feedback Details</h3>
      <div className="detail-section">
        <h4>Feedback Information</h4>
        <p><strong>User Email:</strong> {feedback.email}</p>
        <p><strong>Type:</strong> <span className={`feedback-type ${feedback.type?.toLowerCase()}`}>{feedback.type}</span></p>
        <p><strong>Submitted On:</strong> {new Date(feedback.createdAt).toLocaleString()}</p>
        <p><strong>Feedback ID:</strong> {feedback._id}</p>
      </div>
      <div className="detail-section">
        <h4>Message Content</h4>
        <p style={{borderBottom: 'none', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', fontStyle: 'italic'}}>
          "{feedback.message}"
        </p>
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
  const [pendingBookings, setPendingBookings] = useState([]);
  const [fulfilledBookings, setFulfilledBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);
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
    fulfilledBookings: '',
    cancelledBookings: '',
    feedback: ''
  });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        requestsRes, usersRes, paymentsRes,
        allBookingsRes, fulfilledBookingsRes, cancelledBookingsRes, myFeedbackRes
      ] = await Promise.all([
        axios.get("http://localhost:5000/api/newconnection/requests/pending"),
        axios.get("http://localhost:5000/api/newconnection"),
        axios.get("http://localhost:5000/api/payment"),
        axios.get("http://localhost:5000/api/autobooking/all"),
        axios.get("http://localhost:5000/api/autobooking/fulfilled"),
        axios.get("http://localhost:5000/api/autobooking/cancelled"),
        axios.get("http://localhost:5000/api/myfeedback")
      ]);

      setPendingRequests(requestsRes.data);
      setAllUsers(usersRes.data);
      setAllPayments(paymentsRes.data);
      
      const initialPaymentsData = paymentsRes.data.filter(p => p.paymentType === 'initial_connection' || !p.paymentType);
      const refillPaymentsData = paymentsRes.data.filter(p => p.paymentType === 'gas_refill');
      
      setInitialPayments(initialPaymentsData);
      setRefillPayments(refillPaymentsData);

      setAllBookings(allBookingsRes.data);
      setPendingBookings(allBookingsRes.data.filter(b => b.status === 'booking_pending'));
      setFulfilledBookings(fulfilledBookingsRes.data);
      setCancelledBookings(cancelledBookingsRes.data);
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
    } catch (err)
    {
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

  const generateReport = async () => {
    if (!reportDate) {
      showNotification("Please select a month and year to generate a report.", 'error');
      return;
    }
    
    setGeneratingReport(true);
    setReportData(null); 

    try {
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
      
      const monthlyInitialPayments = filterByMonth(initialPayments, 'createdAt');
      const monthlyRefillPayments = filterByMonth(refillPayments, 'createdAt');
      const monthlyBookings = filterByMonth(allBookings, 'createdAt');
      
      const totalRevenue = [...monthlyInitialPayments, ...monthlyRefillPayments]
        .reduce((sum, payment) => sum + (payment.amountDue || 0), 0);

      const report = {
        month: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        newUsers: filterByMonth(allUsers, 'createdAt').length,
        deactivatedUsers: allUsers.filter(user => 
          user.status === 'deactivated' && 
          new Date(user.updatedAt) >= startDate && 
          new Date(user.updatedAt) <= endDate
        ).length,
        totalBookings: monthlyBookings.length,
        fulfilledBookings: monthlyBookings.filter(b => b.status === 'fulfilled').length,
        cancelledBookings: monthlyBookings.filter(b => b.status === 'cancelled').length,
        initialPayments: monthlyInitialPayments.length,
        refillPayments: monthlyRefillPayments.length,
        totalRevenue: totalRevenue.toFixed(2),
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
    content += `Fulfilled Bookings: ${reportData.fulfilledBookings}\n`;
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
  const getFilteredBookings = () => filterBySearch(pendingBookings, searchQueries.bookings, ['email', 'status', 'customerName']);
  const getFilteredFulfilledBookings = () => filterBySearch(fulfilledBookings, searchQueries.fulfilledBookings, ['email', 'status', 'customerName']);
  const getFilteredCancelledBookings = () => filterBySearch(cancelledBookings, searchQueries.cancelledBookings, ['email', 'status', 'customerName']);

  const getProjectGraphData = () => {
    if (!allUsers.length || !allPayments.length) return null;
    const months = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        label: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        year: date.getFullYear(),
        month: date.getMonth()
      });
    }
    const userData = months.map(month => {
      return allUsers.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate.getFullYear() === month.year && userDate.getMonth() === month.month;
      }).length;
    });
    const revenueData = months.map(month => {
      return allPayments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate.getFullYear() === month.year && paymentDate.getMonth() === month.month;
      }).reduce((sum, payment) => sum + (payment.amountDue || 0), 0);
    });
    return {
      labels: months.map(m => m.label),
      datasets: [
        { label: 'New Users', data: userData, backgroundColor: 'rgba(54, 162, 235, 0.6)', yAxisID: 'y' },
        { label: 'Revenue (₹)', data: revenueData, backgroundColor: 'rgba(255, 99, 132, 0.6)', yAxisID: 'y1' }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Project Growth - Last 6 Months' } },
    scales: {
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Number of Users' } },
      y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Revenue (₹)' }, grid: { drawOnChartArea: false } }
    }
  };

  const renderContent = () => {
    if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;
    if (error) return <p className="error-message">{error}</p>;

    if (selectedItem) {
      switch (activeSection) {
        case 'users': 
          return <UserDetail user={selectedItem} onBack={() => setSelectedItem(null)} onDeleteUser={handleDeleteUser} />;
        case 'requests-list': 
          return <RequestDetail request={selectedItem} onBack={() => setSelectedItem(null)} onApprove={handleApprove} onReject={handleReject} />;
        case 'payments':
          return <PaymentDetail payment={selectedItem} onBack={() => setSelectedItem(null)} />;
        case 'bookings':
          return <AutoBookingDetail booking={selectedItem} onBack={() => setSelectedItem(null)} />;
        case 'my-feedback':
          return <FeedbackDetail feedback={selectedItem} onBack={() => setSelectedItem(null)} />;
        default: 
          setSelectedItem(null); 
          return null;
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
          <div>
            <div className="simplified-card-grid">
              <Card title="Total Users">
                <p>{allUsers.length}</p>
              </Card>
              <Card title="Active Connections">
                <p>{allUsers.filter(u => u.status === 'active').length}</p>
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
            <div className="graph-section">
              <div className="graph-container">
                <h3>📈 Project Overview</h3>
                {getProjectGraphData() ? (
                  <div className="chart-wrapper">
                    <Bar data={getProjectGraphData()} options={chartOptions} />
                  </div>
                ) : (
                  <div className="no-chart-data">
                    <p>Loading project data...</p>
                  </div>
                )}
              </div>
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

      case 'payments':
        return (
          <div>
            <div className="section-tabs">
              <button 
                className={`tab-btn ${activeSubSection === 'initial' ? 'active' : ''}`}
                onClick={() => setActiveSubSection('initial')}
              >
                Initial Payments ({initialPayments.length})
              </button>
              <button 
                className={`tab-btn ${activeSubSection === 'refill' ? 'active' : ''}`}
                onClick={() => setActiveSubSection('refill')}
              >
                Refill Payments ({refillPayments.length})
              </button>
            </div>

            {activeSubSection === 'initial' ? (
              <div>
                <SearchBar section="initialPayments" placeholder="Search by customer name or email..." value={searchQueries.initialPayments} onChange={handleSearchChange} onClear={handleSearchChange} />
                <ResultsCount total={initialPayments.length} filtered={getFilteredInitialPayments().length} query={searchQueries.initialPayments} />
                <div className="list-container">
                  {getFilteredInitialPayments().length > 0 ? getFilteredInitialPayments().map(p => (
                    <div key={p._id} className="list-item card clickable" onClick={() => setSelectedItem(p)}>
                      <h4>{p.customerName} (₹{p.amountDue})</h4>
                      <p><strong>Email:</strong> {p.email}</p>
                      {/* <-- FIX: Using createdAt for accurate timestamp --> */}
                      <p><strong>Date:</strong> {new Date(p.createdAt).toLocaleString()}</p>
                      <p><strong>Type:</strong> <span className="payment-type initial">Initial Connection</span></p>
                    </div>
                  )) : <p className="no-results">No initial payments found.</p>}
                </div>
              </div>
            ) : (
              <div>
                <SearchBar section="refillPayments" placeholder="Search by customer name or email..." value={searchQueries.refillPayments} onChange={handleSearchChange} onClear={handleSearchChange} />
                <ResultsCount total={refillPayments.length} filtered={getFilteredRefillPayments().length} query={searchQueries.refillPayments} />
                <div className="list-container">
                  {getFilteredRefillPayments().length > 0 ? getFilteredRefillPayments().map(p => (
                    <div key={p._id} className="list-item card clickable" onClick={() => setSelectedItem(p)}>
                      <h4>{p.customerName} (₹{p.amountDue})</h4>
                      <p><strong>Email:</strong> {p.email}</p>
                      {/* <-- FIX: Using createdAt for accurate timestamp --> */}
                      <p><strong>Date:</strong> {new Date(p.createdAt).toLocaleString()}</p>
                      <p><strong>Type:</strong> <span className="payment-type refill">Gas Refill</span></p>
                    </div>
                  )) : <p className="no-results">No refill payments found.</p>}
                </div>
              </div>
            )}
          </div>
        );

      case 'bookings':
        return (
          <div>
            <div className="section-tabs">
              <button 
                className={`tab-btn ${activeSubSection === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveSubSection('pending')}
              >
                Pending Bookings ({pendingBookings.length})
              </button>
              <button 
                className={`tab-btn ${activeSubSection === 'fulfilled' ? 'active' : ''}`}
                onClick={() => setActiveSubSection('fulfilled')}
              >
                Fulfilled Bookings ({fulfilledBookings.length})
              </button>
              <button 
                className={`tab-btn ${activeSubSection === 'cancelled' ? 'active' : ''}`}
                onClick={() => setActiveSubSection('cancelled')}
              >
                Cancelled Bookings ({cancelledBookings.length})
              </button>
            </div>

            {activeSubSection === 'pending' ? (
              <div>
                <SearchBar section="bookings" placeholder="Search bookings by email..." value={searchQueries.bookings} onChange={handleSearchChange} onClear={handleSearchChange} />
                <ResultsCount total={pendingBookings.length} filtered={getFilteredBookings().length} query={searchQueries.bookings} />
                <div className="list-container">
                  {getFilteredBookings().length > 0 ? getFilteredBookings().map(b => (
                    <div key={b._id} className="list-item card clickable" onClick={() => setSelectedItem(b)}>
                      <h4>{b.customerName || 'Customer'} ({b.email})</h4>
                      <p><strong>Contact:</strong> {b.mobileNumber || 'Not available'}</p>
                      <p><strong>Booked On:</strong> {new Date(b.updatedAt).toLocaleString()}</p>
                      <p><strong>Status:</strong> <span className={`status ${b.status}`}>{formatBookingStatus(b.status)}</span></p>
                    </div>
                  )) : <p className="no-results">No pending bookings found.</p>}
                </div>
              </div>
            ) : activeSubSection === 'fulfilled' ? (
              <div>
                <SearchBar section="fulfilledBookings" placeholder="Search by email..." value={searchQueries.fulfilledBookings} onChange={handleSearchChange} onClear={handleSearchChange} />
                <ResultsCount total={fulfilledBookings.length} filtered={getFilteredFulfilledBookings().length} query={searchQueries.fulfilledBookings} />
                <div className="list-container">
                  {getFilteredFulfilledBookings().length > 0 ? getFilteredFulfilledBookings().map(b => (
                    <div key={b._id} className="list-item card clickable" onClick={() => setSelectedItem(b)}>
                      <h4>{b.customerName || 'Customer'} ({b.email})</h4>
                      <p><strong>Contact:</strong> {b.mobileNumber || 'Not available'}</p>
                      <p><strong>Fulfilled On:</strong> {new Date(b.updatedAt).toLocaleString()}</p>
                      <p><strong>Status:</strong> <span className={`status ${b.status}`}>{formatBookingStatus(b.status)}</span></p>
                    </div>
                  )) : <p className="no-results">No fulfilled bookings found.</p>}
                </div>
              </div>
            ) : (
              <div>
                <SearchBar section="cancelledBookings" placeholder="Search by email or name..." value={searchQueries.cancelledBookings} onChange={handleSearchChange} onClear={handleSearchChange} />
                <ResultsCount total={cancelledBookings.length} filtered={getFilteredCancelledBookings().length} query={searchQueries.cancelledBookings} />
                <div className="list-container">
                  {getFilteredCancelledBookings().length > 0 ? getFilteredCancelledBookings().map(b => (
                    <div key={b._id} className="list-item card clickable" onClick={() => setSelectedItem(b)}>
                      <h4>{b.customerName || 'Customer'} ({b.email})</h4>
                      <p><strong>Contact:</strong> {b.mobileNumber || 'Not available'}</p>
                      <p><strong>Cancelled On:</strong> {new Date(b.updatedAt).toLocaleString()}</p>
                      <p><strong>Status:</strong> <span className={`status ${b.status}`}>{formatBookingStatus(b.status)}</span></p>
                    </div>
                  )) : <p className="no-results">No cancelled bookings found.</p>}
                </div>
              </div>
            )}
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
                <div key={fb._id} className={`list-item card feedback-card ${getFeedbackCardClass(fb.type)} clickable`} onClick={() => setSelectedItem(fb)}>
                  <div className="feedback-header">
                    <h4>{fb.email}</h4>
                    <span className="feedback-type">{fb.type}</span>
                  </div>
                  <p className="feedback-message">{fb.message.length > 100 ? fb.message.substring(0, 100) + '...' : fb.message}</p>
                  <p className="feedback-date"><strong>Received On:</strong> {new Date(fb.createdAt).toLocaleString()}</p>
                </div>
              )) : <p className="no-results">No feedback messages found.</p>}
            </div>
          </div>
        );

      default: return <p className="coming-soon">This section is under construction.</p>;
    }
  };
  
  // Add state for sub-sections
  const [activeSubSection, setActiveSubSection] = useState('initial'); // For payments: 'initial' or 'refill'

  // Update section titles
  const getSectionTitle = () => {
    if (selectedItem) return "Details View";
    const titles = {
      'dashboard-summary': 'Dashboard Summary',
      'users': 'All Users',
      'requests-list': 'Pending Connection Requests',
      'payments': 'Payment Management',
      'bookings': 'Booking Management',
      'my-feedback': "Feedback"
    };
    return titles[activeSection] || 'Admin Panel';
  };

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
            <li className={activeSection === 'payments' ? 'active' : ''} onClick={() => { handleSidebarNav('payments'); setActiveSubSection('initial'); }}>
              Payments ({allPayments.length})
            </li>
            <li className={activeSection === 'bookings' ? 'active' : ''} onClick={() => { handleSidebarNav('bookings'); setActiveSubSection('pending'); }}>
              Bookings {pendingBookings.length > 0 && <span className="pending-count">({pendingBookings.length})</span>}
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
                    <div className="report-item"><span className="report-label">📋 Total Bookings:</span><span className="report-value">{reportData.totalBookings}</span></div>
                    <div className="report-item"><span className="report-label">✅ Fulfilled Bookings:</span><span className="report-value">{reportData.fulfilledBookings}</span></div>
                    <div className="report-item"><span className="report-label">🚫 Cancelled Bookings:</span><span className="report-value">{reportData.cancelledBookings}</span></div>
                    <div className="report-item"><span className="report-label">🔄 Refill Payments:</span><span className="report-value">{reportData.refillPayments}</span></div>
                    <div className="report-item"><span className="report-label">🆕 Initial Payments:</span><span className="report-value">{reportData.initialPayments}</span></div>
                    <div className="report-item highlight"><span className="report-label">💰 Total Revenue:</span><span className="report-value">₹{reportData.totalRevenue}</span></div>
                  </div>
                </div>
                <button onClick={downloadReport} className="download-btn">
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