

// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import '../styles/userDashboard.css';
// import { getEndpoint } from '../config';

// // Define BOOKING_THRESHOLD here as it's used in frontend logic
// const BOOKING_THRESHOLD = 20;

// const UserDashboard = () => {
//   const navigate = useNavigate();
//   const [gasLevelData, setGasLevelData] = useState(null);
//   const [kycData, setKycData] = useState(null); // Add KYC data state for tube expiry
//   const [loadingGas, setLoadingGas] = useState(true);
//   const [errorGas, setErrorGas] = useState(null);
//   const [showCancelPopup, setShowCancelPopup] = useState(false);
//   const [showSuccessPopup, setShowSuccessPopup] = useState(false);
//   const [showErrorPopup, setShowErrorPopup] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [showCancelledMessage, setShowCancelledMessage] = useState(false); // State for cancellation message
//   const userEmail = localStorage.getItem("userEmail");

//   // Utility function to calculate tube expiry date (5 years from connection)
//   const calculateTubeExpiryDate = (connectionDate) => {
//     if (!connectionDate) return null;
//     const expiryDate = new Date(connectionDate);
//     expiryDate.setFullYear(expiryDate.getFullYear() + 5);
//     return expiryDate.toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     });
//   };

//   // Enhanced utility to get days remaining until tube expiry
//   const getDaysUntilTubeExpiry = (connectionDate) => {
//     if (!connectionDate) return null;
//     const expiryDate = new Date(connectionDate);
//     expiryDate.setFullYear(expiryDate.getFullYear() + 5);
//     const today = new Date();
//     const timeDiff = expiryDate.getTime() - today.getTime();
//     const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
//     return daysDiff;
//   };

//   // Check if tube expiry is approaching (within 6 months)
//   const isTubeExpiryApproaching = (connectionDate) => {
//     if (!connectionDate) return false;
//     const daysRemaining = getDaysUntilTubeExpiry(connectionDate);
//     return daysRemaining !== null && daysRemaining <= 180; // 6 months = ~180 days
//   };

//   // Check if tube has already expired
//   const isTubeExpired = (connectionDate) => {
//     if (!connectionDate) return false;
//     const daysRemaining = getDaysUntilTubeExpiry(connectionDate);
//     return daysRemaining !== null && daysRemaining <= 0;
//   };

//   // Calculate estimated refill date based on current usage
//   const calculateEstimatedRefillDate = (currentLevel) => {
//     if (!currentLevel || currentLevel <= 0) return "N/A";
    
//     // Assuming normal consumption rate of 0.5% per day
//     const daysRemaining = Math.ceil(currentLevel / 0.5);
//     const refillDate = new Date();
//     refillDate.setDate(refillDate.getDate() + daysRemaining);
    
//     return refillDate.toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     });
//   };

//   const triggerLeakAlerts = () => {
//     const audio = new Audio('/alert.mp3'); // Ensure this path is correct
//     audio.play().catch(e => console.error('Audio play failed:', e));
//     if (!("Notification" in window)) {
//       alert("⚠️ GAS LEAK DETECTED! Please check your dashboard.");
//       return;
//     }
//     const showNotification = () => {
//       new Notification("⚠️ GAS LEAK DETECTED!", {
//         body: "Immediate action required! Ventilate the area and contact emergency services.",
//         icon: "/danger-icon.png", // Ensure this path is correct
//         tag: "gas-leak-alert",
//       });
//     };
//     if (Notification.permission === "granted") {
//       showNotification();
//     } else if (Notification.permission !== "denied") {
//       Notification.requestPermission().then((permission) => {
//         if (permission === "granted") {
//           showNotification();
//         }
//       });
//     }
//   };

//   const fetchGasLevel = useCallback(async () => {
//     if (!userEmail) {
//       setErrorGas("User not logged in.");
//       setLoadingGas(false);
//       return;
//     }
//     try {
//       // Fetch both gas level and KYC data
//       const [gasResponse, kycResponse] = await Promise.all([
//         axios.get(getEndpoint.gasLevel(userEmail)),
//         axios.get(getEndpoint.newConnection(userEmail))
//       ]);

//       const currentData = gasResponse.data;
//       const connectionData = kycResponse.data;

//       setGasLevelData(prevGasLevel => {
//         // Trigger alert only if it wasn't leaking before and is leaking now
//         if (currentData.isLeaking && (!prevGasLevel || !prevGasLevel.isLeaking)) {
//           triggerLeakAlerts();
//         }
//         return currentData;
//       });

//       setKycData(connectionData);
//       setErrorGas(null);
//     } catch (err) {
//       console.error("Failed to fetch data:", err);
//       if (err.response && err.response.status === 404) {
//         setErrorGas("Your user profile was not found. Please log in again.");
//       } else {
//         setErrorGas("Could not fetch data. Is the simulation running?");
//       }
//       setGasLevelData(null);
//       setKycData(null);
//     } finally {
//       setLoadingGas(false);
//     }
//   }, [userEmail]);

//   useEffect(() => {
//     // If the cancelled message is showing but gas level is no longer low, reset the state
//     if (showCancelledMessage && gasLevelData && gasLevelData.currentLevel > BOOKING_THRESHOLD) {
//       setShowCancelledMessage(false);
//     }
//   }, [gasLevelData, showCancelledMessage]);


//   useEffect(() => {
//     fetchGasLevel(); // Initial fetch
//     const interval = setInterval(fetchGasLevel, 3000); // Poll every 3 seconds
//     return () => clearInterval(interval); // Cleanup on component unmount
//   }, [fetchGasLevel]);

//   const handleProfileClick = () => {
//     navigate('/profile');
//   };

//   const handlePayNow = useCallback(async () => {
//     try {
//       if (!userEmail) {
//         alert("User email not found. Please log in again.");
//         return;
//       }

//       // --- FIX: Use the existing, polled gasLevelData from state for checks ---
//       if (!gasLevelData) {
//         alert("Gas level data is not available yet. Please wait a moment.");
//         return;
//       }
      
//       // Check 1: Has the user already paid for a refill?
//       if (gasLevelData.hasPaidForRefill) {
//           alert("You have already paid for a refill. It will be activated once your current cylinder is empty.");
//           return;
//       }

//       // Check 2: Is there a pending booking? This is the core fix.
//       // We check the 'bookingStatus' field from the gasLevelData state, NOT the main KYC status.
//       if (gasLevelData.bookingStatus !== 'booking_pending' && gasLevelData.bookingStatus !== 'refill_payment_pending') {
//         alert("Payment is not required at this time or booking is not pending.");
//         return;
//       }
      
//       // If checks pass, now we can fetch the full KYC data needed for the payment page.
//       const kycResponse = await axios.get(getEndpoint.newConnection(userEmail));
//       const kycData = kycResponse.data;
//       if (!kycData) {
//           alert("Your user profile data is missing. Please contact support.");
//           return;
//       }

//       // Store in localStorage for the payment page to use
//       localStorage.setItem("kycFormData", JSON.stringify(kycData));

//       // Navigate to payment page, passing state to indicate this is a refill
//       navigate('/payment', { state: { isRefill: true } });

//     } catch (err) {
//       alert("Could not fetch user details for payment. Please try again.");
//       console.error("Error preparing for payment:", err);
//     }
//   }, [userEmail, navigate, gasLevelData]); // Added gasLevelData to dependency array

//   const handleCancelBooking = useCallback(async () => {
//     setShowCancelPopup(false);
//     try {
//       await axios.put(getEndpoint.cancelBooking(userEmail));
//       setShowCancelledMessage(true);
//       fetchGasLevel(); // Refresh data to reflect cancellation
//     } catch (err) {
//       console.error("Failed to cancel booking:", err);
//       if (err.response?.status === 404) {
//         setErrorMessage("No pending booking found to cancel.");
//       } else {
//         setErrorMessage("Could not cancel the booking. Please try again.");
//       }
//       setShowErrorPopup(true);
//     }
//   }, [userEmail, fetchGasLevel]);
  
//   const handleBookNow = () => {
//       setShowCancelledMessage(false);
//       fetchGasLevel();
//   };

//   const handleCancelClick = () => {
//     setShowCancelPopup(true);
//   };

//   const getGasLevelColor = (level) => {
//     if (level === null || level === undefined) return '#6c757d';
//     if (level > 60) return '#28a745'; // Green
//     if (level > BOOKING_THRESHOLD) return '#ffc107'; // Yellow
//     return '#dc3545'; // Red
//   };

//   return (
//     <div className="dashboard-container">
//       <header className="dashboard-header">
//         <h1>⛽ Gas Monitor</h1>
//         <div className="nav-actions">
//           <button className="nav-btn" onClick={() => navigate("/userdashboard")}>Dashboard</button>
//           <button className="nav-btn" onClick={() => navigate("/history")}>History</button>
//           <button className="nav-btn" onClick={() => navigate("/feedback")}>Feedback</button>
//           <div className="profile-section">
//             <button className="profile-button" onClick={handleProfileClick} title="View Profile">
//               <img src="/profileicon.jpg" alt="Profile" />
//             </button>
//           </div>
//         </div>
//       </header>
//       <main className="dashboard-main">
//         <h2>🎛️ Control Center</h2>
//         <div className="stats-container">
//           <div className="stat-box gas-level-box">
//             <h3>⛽ Current Gas Level</h3>
//             {loadingGas ? (<p>Loading...</p>) : 
//             errorGas ? (<p className="error-message">{errorGas}</p>) : 
//             gasLevelData ? (
//               <>
//                 <div className="gas-indicator">
//                   <span className="gas-level-percentage" style={{ color: getGasLevelColor(gasLevelData.currentLevel) }}>
//                     {gasLevelData.currentLevel.toFixed(2)}%
//                   </span>
//                   <div className="gas-bar-container">
//                     <div className="gas-bar" style={{ width: `${gasLevelData.currentLevel}%`, backgroundColor: getGasLevelColor(gasLevelData.currentLevel) }}></div>
//                   </div>
//                 </div>
//                 {gasLevelData.isLeaking && (<p className="leak-alert">⚠️ Gas Leak Detected!</p>)}
//                 {gasLevelData.hasPaidForRefill && gasLevelData.currentLevel > 0 && (
//                   <p className="refill-pending-info">✅ Refill paid! New cylinder activates when current one is depleted.</p>
//                 )}
//               </>
//             ) : (<p>No gas data available.</p>)}
//           </div>
          
//           <div className="stat-box">
//             <h3>📅 Estimated Refill Date</h3>
//             {gasLevelData ? (
//               <>
//                 <p className="refill-date">
//                   {calculateEstimatedRefillDate(gasLevelData.currentLevel)}
//                 </p>
//                 {gasLevelData.currentLevel > 0 && (
//                   <small className="refill-info">
//                     Based on current usage pattern
//                   </small>
//                 )}
//               </>
//             ) : (
//               <p>📈 Calculating...</p>
//             )}
//           </div>
          
//           <div className="stat-box">
//             <h3>⏰ Tube Expiry Date</h3>
//             {kycData ? (
//               <>
//                 <p className={`tube-expiry-date ${isTubeExpired(kycData.createdAt) ? 'expiry-expired' : isTubeExpiryApproaching(kycData.createdAt) ? 'expiry-warning' : ''}`}>
//                   {calculateTubeExpiryDate(kycData.createdAt)}
//                 </p>
//                 {isTubeExpired(kycData.createdAt) ? (
//                   <small className="expiry-expired-text">
//                     🚨 Tube has expired! Contact support immediately.
//                   </small>
//                 ) : isTubeExpiryApproaching(kycData.createdAt) ? (
//                   <small className="expiry-warning-text">
//                     ⚠️ Expires in {getDaysUntilTubeExpiry(kycData.createdAt)} days
//                   </small>
//                 ) : (
//                   <small className="expiry-normal-text">
//                     ✅ Valid for {getDaysUntilTubeExpiry(kycData.createdAt)} more days
//                   </small>
//                 )}
//               </>
//             ) : (
//               <p>📋 Loading...</p>
//             )}
//           </div>
//         </div>
        
//         <div className="alerts-container">
//           <h3>Alerts</h3>
          
//           {/* Tube Expiry Critical Alert */}
//           {kycData && isTubeExpired(kycData.createdAt) && (
//             <div className="alert-box danger tube-expiry-critical">
//               <i className="danger-icon">🚨</i>
//               <div>
//                 <p><strong>CRITICAL: Tube Expired!</strong></p>
//                 <p>Your LPG tube expired on {calculateTubeExpiryDate(kycData.createdAt)}. Gas supply must be disconnected immediately for safety.</p>
//                 <p><strong>Action Required:</strong> Contact customer service for tube replacement.</p>
//               </div>
//             </div>
//           )}

//           {/* Tube Expiry Warning Alert */}
//           {kycData && isTubeExpiryApproaching(kycData.createdAt) && !isTubeExpired(kycData.createdAt) && (
//             <div className="alert-box warning tube-expiry-warning">
//               <i className="warning-icon">⏰</i>
//               <div>
//                 <p><strong>Tube Expiry Notice:</strong> Your LPG tube will expire on {calculateTubeExpiryDate(kycData.createdAt)} ({getDaysUntilTubeExpiry(kycData.createdAt)} days remaining).</p>
//                 <p><strong>Action Required:</strong> Please contact customer service to schedule tube replacement before the expiry date.</p>
//               </div>
//             </div>
//           )}
          
//           {gasLevelData && gasLevelData.isLeaking && (<div className="alert-box danger"><i className="danger-icon">🔥</i><p>Immediate Action: Gas Leak Detected! Ventilate and contact emergency services.</p></div>)}
          
//           {gasLevelData && gasLevelData.currentLevel <= BOOKING_THRESHOLD && 
//            gasLevelData.bookingStatus && 
//            (gasLevelData.bookingStatus === 'booking_pending' || gasLevelData.bookingStatus === 'refill_payment_pending') &&
//            !gasLevelData.isLeaking && !gasLevelData.hasPaidForRefill && !showCancelledMessage && (
//             <div className="alert-box warning auto-booking-alert">
//               <div className="auto-booking-content">
//                 <div className="auto-booking-header"><i className="warning-icon">🎯</i><h4>Gas Auto-Booked!</h4></div>
//                 <div className="auto-booking-message">
//                   <p><strong>Your gas level has dropped to {gasLevelData.currentLevel.toFixed(1)}%</strong></p>
//                   <p>A new cylinder has been automatically booked for you.</p>
//                   <p className="payment-info">💳 <strong>Payment Required:</strong> ₹900 for gas refill</p>
//                 </div>
//                 <div className="booking-actions">
//                   <button onClick={handlePayNow} className="pay-now-btn">💳 Pay Now (₹900)</button>
//                   <button onClick={handleCancelClick} className="cancel-booking-btn">❌ Cancel Booking</button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {showCancelledMessage && gasLevelData && gasLevelData.currentLevel <= BOOKING_THRESHOLD && (
//               <div className="alert-box info cancelled-booking-alert">
//                   <div className="auto-booking-content">
//                       <div className="auto-booking-header"><i className="info-icon">ℹ️</i><h4>Booking Cancelled</h4></div>
//                       <p>You have cancelled the automatic booking. Your gas level is still low.</p>
//                       <div className="booking-actions">
//                           <button onClick={handleBookNow} className="book-now-btn">🔄 Book Now</button>
//                       </div>
//                   </div>
//               </div>
//           )}
          
//           {gasLevelData && gasLevelData.currentLevel <= BOOKING_THRESHOLD && 
//            gasLevelData.kycStatus === 'active' && !gasLevelData.isLeaking && 
//            !gasLevelData.hasPaidForRefill && !gasLevelData.bookingStatus && !showCancelledMessage && (
//             <div className="alert-box warning"><i className="warning-icon">⚠️</i><p>Low Gas: Cylinder needs to be replaced soon. Auto-booking in progress...</p></div>
//           )}
          
//           {(!gasLevelData || (gasLevelData && !gasLevelData.isLeaking && 
//             (gasLevelData.currentLevel > BOOKING_THRESHOLD || showCancelledMessage) && 
//             !gasLevelData.hasPaidForRefill)) && (!gasLevelData || gasLevelData.bookingStatus !== 'booking_pending') && (
//             <div className="alert-box success"><i className="success-icon">✅</i><p>All systems nominal. No immediate alerts.</p></div>
//           )}
//         </div>
        
//         <div className="notifications-container">
//           <h3>Notifications</h3>
          
//           {/* Connection Anniversary Notification */}
//           {kycData && (
//             <div className="notification-box info">
//               <i className="info-icon">🎉</i>
//               <p>Connection established on {new Date(kycData.createdAt).toLocaleDateString('en-IN')}. Thank you for being with us!</p>
//             </div>
//           )}

//           {gasLevelData && gasLevelData.hasPaidForRefill && (<div className="notification-box info"><i className="info-icon">ℹ️</i><p>Refill payment confirmed. A new cylinder is ready for activation.</p></div>)}
//           <div className="notification-box success"><i className="success-icon">✅</i><p>Your connection is active and running smoothly.</p></div>
//           <div className="notification-box info"><i className="info-icon">ℹ️</i><p>Welcome to Quick LPG Connect!</p></div>
//         </div>
//       </main>
      
//       {showCancelPopup && (
//         <div className="popup-overlay">
//           <div className="popup-content">
//             <h3>Cancel Booking Confirmation</h3>
//             <p>Are you sure you want to cancel this booking? You can book again if your gas level remains low.</p>
//             <div className="popup-buttons">
//               <button onClick={handleCancelBooking} className="confirm-yes">Yes, Cancel</button>
//               <button onClick={() => setShowCancelPopup(false)} className="confirm-no">No</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showSuccessPopup && (<div className="popup-overlay"><div className="popup-content notification success"><h3>✅ Success</h3><p>{successMessage}</p><button onClick={() => setShowSuccessPopup(false)} className="popup-ok">OK</button></div></div>)}
//       {showErrorPopup && (<div className="popup-overlay"><div className="popup-content notification error"><h3>❌ Error</h3><p>{errorMessage}</p><button onClick={() => setShowErrorPopup(false)} className="popup-ok">OK</button></div></div>)}
//     </div>
//   );
// };

// export default UserDashboard;
































































import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/userDashboard.css';
import { getEndpoint } from '../config';

// Define BOOKING_THRESHOLD here as it's used in frontend logic
const BOOKING_THRESHOLD = 20;

const UserDashboard = () => {
  const navigate = useNavigate();
  const [gasLevelData, setGasLevelData] = useState(null);
  const [kycData, setKycData] = useState(null); // Add KYC data state for tube expiry
  const [loadingGas, setLoadingGas] = useState(true);
  const [errorGas, setErrorGas] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCancelledMessage, setShowCancelledMessage] = useState(false); // State for cancellation message
  const userEmail = localStorage.getItem("userEmail");

  // Utility function to calculate tube expiry date (5 years from connection)
  const calculateTubeExpiryDate = (connectionDate) => {
    if (!connectionDate) return null;
    const expiryDate = new Date(connectionDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    return expiryDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Enhanced utility to get days remaining until tube expiry
  const getDaysUntilTubeExpiry = (connectionDate) => {
    if (!connectionDate) return null;
    const expiryDate = new Date(connectionDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    const today = new Date();
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  // Check if tube expiry is approaching (within 6 months)
  const isTubeExpiryApproaching = (connectionDate) => {
    if (!connectionDate) return false;
    const daysRemaining = getDaysUntilTubeExpiry(connectionDate);
    return daysRemaining !== null && daysRemaining <= 180; // 6 months = ~180 days
  };

  // Check if tube has already expired
  const isTubeExpired = (connectionDate) => {
    if (!connectionDate) return false;
    const daysRemaining = getDaysUntilTubeExpiry(connectionDate);
    return daysRemaining !== null && daysRemaining <= 0;
  };

  // Calculate estimated refill date based on current usage
  const calculateEstimatedRefillDate = (currentLevel) => {
    if (!currentLevel || currentLevel <= 0) return "N/A";
    
    // Assuming normal consumption rate of 0.5% per day
    const daysRemaining = Math.ceil(currentLevel / 0.5);
    const refillDate = new Date();
    refillDate.setDate(refillDate.getDate() + daysRemaining);
    
    return refillDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const triggerLeakAlerts = () => {
    const audio = new Audio('/alert.mp3'); // Ensure this path is correct
    audio.play().catch(e => console.error('Audio play failed:', e));
    if (!("Notification" in window)) {
      alert("⚠️ GAS LEAK DETECTED! Please check your dashboard.");
      return;
    }
    const showNotification = () => {
      new Notification("⚠️ GAS LEAK DETECTED!", {
        body: "Immediate action required! Ventilate the area and contact emergency services.",
        icon: "/danger-icon.png", // Ensure this path is correct
        tag: "gas-leak-alert",
      });
    };
    if (Notification.permission === "granted") {
      showNotification();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          showNotification();
        }
      });
    }
  };

  const fetchGasLevel = useCallback(async () => {
    if (!userEmail) {
      setErrorGas("User not logged in.");
      setLoadingGas(false);
      return;
    }
    try {
      // Fetch both gas level and KYC data
      const [gasResponse, kycResponse] = await Promise.all([
        axios.get(getEndpoint.gasLevel(userEmail)),
        axios.get(getEndpoint.newConnection(userEmail))
      ]);

      const currentData = gasResponse.data;
      const connectionData = kycResponse.data;

      setGasLevelData(prevGasLevel => {
        // Trigger alert only if it wasn't leaking before and is leaking now
        if (currentData.isLeaking && (!prevGasLevel || !prevGasLevel.isLeaking)) {
          triggerLeakAlerts();
        }
        return currentData;
      });

      setKycData(connectionData);
      setErrorGas(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      if (err.response && err.response.status === 404) {
        setErrorGas("Your user profile was not found. Please log in again.");
      } else {
        setErrorGas("Could not fetch data. Is the simulation running?");
      }
      setGasLevelData(null);
      setKycData(null);
    } finally {
      setLoadingGas(false);
    }
  }, [userEmail]);

  useEffect(() => {
    // If the cancelled message is showing but gas level is no longer low, reset the state
    if (showCancelledMessage && gasLevelData && gasLevelData.currentLevel > BOOKING_THRESHOLD) {
      setShowCancelledMessage(false);
    }
  }, [gasLevelData, showCancelledMessage]);


  useEffect(() => {
    fetchGasLevel(); // Initial fetch
    const interval = setInterval(fetchGasLevel, 3000); // Poll every 3 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [fetchGasLevel]);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handlePayNow = useCallback(async () => {
    try {
      if (!userEmail) {
        alert("User email not found. Please log in again.");
        return;
      }

      // --- FIX: Use the existing, polled gasLevelData from state for checks ---
      if (!gasLevelData) {
        alert("Gas level data is not available yet. Please wait a moment.");
        return;
      }
      
      // Check 1: Has the user already paid for a refill?
      if (gasLevelData.hasPaidForRefill) {
          alert("You have already paid for a refill. It will be activated once your current cylinder is empty.");
          return;
      }

      // Check 2: Is there a pending booking? This is the core fix.
      // We check the 'bookingStatus' field from the gasLevelData state, NOT the main KYC status.
      if (gasLevelData.bookingStatus !== 'booking_pending' && gasLevelData.bookingStatus !== 'refill_payment_pending') {
        alert("Payment is not required at this time or booking is not pending.");
        return;
      }
      
      // If checks pass, now we can fetch the full KYC data needed for the payment page.
      const kycResponse = await axios.get(getEndpoint.newConnection(userEmail));
      const kycData = kycResponse.data;
      if (!kycData) {
          alert("Your user profile data is missing. Please contact support.");
          return;
      }

      // Store in localStorage for the payment page to use
      localStorage.setItem("kycFormData", JSON.stringify(kycData));

      // Navigate to payment page, passing state to indicate this is a refill
      navigate('/payment', { state: { isRefill: true } });

    } catch (err) {
      alert("Could not fetch user details for payment. Please try again.");
      console.error("Error preparing for payment:", err);
    }
  }, [userEmail, navigate, gasLevelData]); // Added gasLevelData to dependency array

  const handleCancelBooking = useCallback(async () => {
    setShowCancelPopup(false);
    try {
      await axios.put(getEndpoint.cancelBooking(userEmail));
      setShowCancelledMessage(true);
      fetchGasLevel(); // Refresh data to reflect cancellation
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      if (err.response?.status === 404) {
        setErrorMessage("No pending booking found to cancel.");
      } else {
        setErrorMessage("Could not cancel the booking. Please try again.");
      }
      setShowErrorPopup(true);
    }
  }, [userEmail, fetchGasLevel]);
  
  const handleBookNow = () => {
      setShowCancelledMessage(false);
      fetchGasLevel();
  };

  const handleCancelClick = () => {
    setShowCancelPopup(true);
  };

  const getGasLevelColor = (level) => {
    if (level === null || level === undefined) return '#6c757d';
    if (level > 60) return '#28a745'; // Green
    if (level > BOOKING_THRESHOLD) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>⛽ Gas Monitor</h1>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate("/userdashboard")}>Dashboard</button>
          <button className="nav-btn" onClick={() => navigate("/history")}>History</button>
          <button className="nav-btn" onClick={() => navigate("/report")}>Report</button>
          <button className="nav-btn" onClick={() => navigate("/feedback")}>Feedback</button>
          <div className="profile-section">
            <button className="profile-button" onClick={handleProfileClick} title="View Profile">
              <img src="/profileicon.jpg" alt="Profile" />
            </button>
          </div>
        </div>
      </header>
      <main className="dashboard-main">
        <h2>🎛️ Control Center</h2>
        <div className="stats-container">
          <div className="stat-box gas-level-box">
            <h3>⛽ Current Gas Level</h3>
            {loadingGas ? (<p>Loading...</p>) : 
            errorGas ? (<p className="error-message">{errorGas}</p>) : 
            gasLevelData ? (
              <>
                <div className="gas-indicator">
                  <span className="gas-level-percentage" style={{ color: getGasLevelColor(gasLevelData.currentLevel) }}>
                    {gasLevelData.currentLevel.toFixed(2)}%
                  </span>
                  <div className="gas-bar-container">
                    <div className="gas-bar" style={{ width: `${gasLevelData.currentLevel}%`, backgroundColor: getGasLevelColor(gasLevelData.currentLevel) }}></div>
                  </div>
                </div>
                {gasLevelData.isLeaking && (<p className="leak-alert">⚠️ Gas Leak Detected!</p>)}
                {gasLevelData.hasPaidForRefill && gasLevelData.currentLevel > 0 && (
                  <p className="refill-pending-info">✅ Refill paid! New cylinder activates when current one is depleted.</p>
                )}
              </>
            ) : (<p>No gas data available.</p>)}
          </div>
          
          <div className="stat-box">
            <h3>📅 Estimated Refill Date</h3>
            {gasLevelData ? (
              <>
                <p className="refill-date">
                  {calculateEstimatedRefillDate(gasLevelData.currentLevel)}
                </p>
                {gasLevelData.currentLevel > 0 && (
                  <small className="refill-info">
                    Based on current usage pattern
                  </small>
                )}
              </>
            ) : (
              <p>📈 Calculating...</p>
            )}
          </div>
          
          <div className="stat-box">
            <h3>⏰ Tube Expiry Date</h3>
            {kycData ? (
              <>
                <p className={`tube-expiry-date ${isTubeExpired(kycData.createdAt) ? 'expiry-expired' : isTubeExpiryApproaching(kycData.createdAt) ? 'expiry-warning' : ''}`}>
                  {calculateTubeExpiryDate(kycData.createdAt)}
                </p>
                {isTubeExpired(kycData.createdAt) ? (
                  <small className="expiry-expired-text">
                    🚨 Tube has expired! Contact support immediately.
                  </small>
                ) : isTubeExpiryApproaching(kycData.createdAt) ? (
                  <small className="expiry-warning-text">
                    ⚠️ Expires in {getDaysUntilTubeExpiry(kycData.createdAt)} days
                  </small>
                ) : (
                  <small className="expiry-normal-text">
                    ✅ Valid for {getDaysUntilTubeExpiry(kycData.createdAt)} more days
                  </small>
                )}
              </>
            ) : (
              <p>📋 Loading...</p>
            )}
          </div>
        </div>
        
        <div className="alerts-container">
          <h3>Alerts</h3>
          
          {/* Tube Expiry Critical Alert */}
          {kycData && isTubeExpired(kycData.createdAt) && (
            <div className="alert-box danger tube-expiry-critical">
              <i className="danger-icon">🚨</i>
              <div>
                <p><strong>CRITICAL: Tube Expired!</strong></p>
                <p>Your LPG tube expired on {calculateTubeExpiryDate(kycData.createdAt)}. Gas supply must be disconnected immediately for safety.</p>
                <p><strong>Action Required:</strong> Contact customer service for tube replacement.</p>
              </div>
            </div>
          )}

          {/* Tube Expiry Warning Alert */}
          {kycData && isTubeExpiryApproaching(kycData.createdAt) && !isTubeExpired(kycData.createdAt) && (
            <div className="alert-box warning tube-expiry-warning">
              <i className="warning-icon">⏰</i>
              <div>
                <p><strong>Tube Expiry Notice:</strong> Your LPG tube will expire on {calculateTubeExpiryDate(kycData.createdAt)} ({getDaysUntilTubeExpiry(kycData.createdAt)} days remaining).</p>
                <p><strong>Action Required:</strong> Please contact customer service to schedule tube replacement before the expiry date.</p>
              </div>
            </div>
          )}
          
          {gasLevelData && gasLevelData.isLeaking && (<div className="alert-box danger"><i className="danger-icon">🔥</i><p>Immediate Action: Gas Leak Detected! Ventilate and contact emergency services.</p></div>)}
          
          {gasLevelData && gasLevelData.currentLevel <= BOOKING_THRESHOLD && 
           gasLevelData.bookingStatus && 
           (gasLevelData.bookingStatus === 'booking_pending' || gasLevelData.bookingStatus === 'refill_payment_pending') &&
           !gasLevelData.isLeaking && !gasLevelData.hasPaidForRefill && !showCancelledMessage && (
            <div className="alert-box warning auto-booking-alert">
              <div className="auto-booking-content">
                <div className="auto-booking-header"><i className="warning-icon">🎯</i><h4>Gas Auto-Booked!</h4></div>
                <div className="auto-booking-message">
                  <p><strong>Your gas level has dropped to {gasLevelData.currentLevel.toFixed(1)}%</strong></p>
                  <p>A new cylinder has been automatically booked for you.</p>
                  <p className="payment-info">💳 <strong>Payment Required:</strong> ₹900 for gas refill</p>
                </div>
                <div className="booking-actions">
                  <button onClick={handlePayNow} className="pay-now-btn">💳 Pay Now (₹900)</button>
                  <button onClick={handleCancelClick} className="cancel-booking-btn">❌ Cancel Booking</button>
                </div>
              </div>
            </div>
          )}

          {showCancelledMessage && gasLevelData && gasLevelData.currentLevel <= BOOKING_THRESHOLD && (
              <div className="alert-box info cancelled-booking-alert">
                  <div className="auto-booking-content">
                      <div className="auto-booking-header"><i className="info-icon">ℹ️</i><h4>Booking Cancelled</h4></div>
                      <p>You have cancelled the automatic booking. Your gas level is still low.</p>
                      <div className="booking-actions">
                          <button onClick={handleBookNow} className="book-now-btn">🔄 Book Now</button>
                      </div>
                  </div>
              </div>
          )}
          
          {gasLevelData && gasLevelData.currentLevel <= BOOKING_THRESHOLD && 
           gasLevelData.kycStatus === 'active' && !gasLevelData.isLeaking && 
           !gasLevelData.hasPaidForRefill && !gasLevelData.bookingStatus && !showCancelledMessage && (
            <div className="alert-box warning"><i className="warning-icon">⚠️</i><p>Low Gas: Cylinder needs to be replaced soon. Auto-booking in progress...</p></div>
          )}
          
          {(!gasLevelData || (gasLevelData && !gasLevelData.isLeaking && 
            (gasLevelData.currentLevel > BOOKING_THRESHOLD || showCancelledMessage) && 
            !gasLevelData.hasPaidForRefill)) && (!gasLevelData || gasLevelData.bookingStatus !== 'booking_pending') && (
            <div className="alert-box success"><i className="success-icon">✅</i><p>All systems nominal. No immediate alerts.</p></div>
          )}
        </div>
        
        <div className="notifications-container">
          <h3>Notifications</h3>
          
          {/* Connection Anniversary Notification */}
          {kycData && (
            <div className="notification-box info">
              <i className="info-icon">🎉</i>
              <p>Connection established on {new Date(kycData.createdAt).toLocaleDateString('en-IN')}. Thank you for being with us!</p>
            </div>
          )}

          {gasLevelData && gasLevelData.hasPaidForRefill && (<div className="notification-box info"><i className="info-icon">ℹ️</i><p>Refill payment confirmed. A new cylinder is ready for activation.</p></div>)}
          <div className="notification-box success"><i className="success-icon">✅</i><p>Your connection is active and running smoothly.</p></div>
          <div className="notification-box info"><i className="info-icon">ℹ️</i><p>Welcome to Quick LPG Connect!</p></div>
        </div>
      </main>
      
      {showCancelPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Cancel Booking Confirmation</h3>
            <p>Are you sure you want to cancel this booking? You can book again if your gas level remains low.</p>
            <div className="popup-buttons">
              <button onClick={handleCancelBooking} className="confirm-yes">Yes, Cancel</button>
              <button onClick={() => setShowCancelPopup(false)} className="confirm-no">No</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && (<div className="popup-overlay"><div className="popup-content notification success"><h3>✅ Success</h3><p>{successMessage}</p><button onClick={() => setShowSuccessPopup(false)} className="popup-ok">OK</button></div></div>)}
      {showErrorPopup && (<div className="popup-overlay"><div className="popup-content notification error"><h3>❌ Error</h3><p>{errorMessage}</p><button onClick={() => setShowErrorPopup(false)} className="popup-ok">OK</button></div></div>)}
    </div>
  );
};

export default UserDashboard;