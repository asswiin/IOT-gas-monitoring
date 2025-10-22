

// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import '../styles/userDashboard.css';
// import { getEndpoint } from '../config';

// const BOOKING_THRESHOLD = 20;

// const UserDashboard = () => {
//   const navigate = useNavigate();
//   const [gasLevelData, setGasLevelData] = useState(null);
//   const [kycData, setKycData] = useState(null);
//   const [loadingGas, setLoadingGas] = useState(true);
//   const [errorGas, setErrorGas] = useState(null);
//   const [showCancelPopup, setShowCancelPopup] = useState(false);
//   const [showSuccessPopup, setShowSuccessPopup] = useState(false);
//   const [showErrorPopup, setShowErrorPopup] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [showRebookConfirmPopup, setShowRebookConfirmPopup] = useState(false);
//   const userEmail = localStorage.getItem("userEmail");
  
//   const [notificationPermission, setNotificationPermission] = useState('default');

//   const calculateTubeExpiryDate = (connectionDate) => {
//     if (!connectionDate) return null;
//     const expiryDate = new Date(connectionDate);
//     expiryDate.setFullYear(expiryDate.getFullYear() + 5);
//     return expiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
//   };
//   const getDaysUntilTubeExpiry = (connectionDate) => {
//     if (!connectionDate) return null;
//     const expiryDate = new Date(connectionDate);
//     expiryDate.setFullYear(expiryDate.getFullYear() + 5);
//     const today = new Date();
//     const timeDiff = expiryDate.getTime() - today.getTime();
//     return Math.ceil(timeDiff / (1000 * 3600 * 24));
//   };
//   const isTubeExpiryApproaching = (connectionDate) => {
//     const daysRemaining = getDaysUntilTubeExpiry(connectionDate);
//     return daysRemaining !== null && daysRemaining <= 180;
//   };
//   const isTubeExpired = (connectionDate) => {
//     const daysRemaining = getDaysUntilTubeExpiry(connectionDate);
//     return daysRemaining !== null && daysRemaining <= 0;
//   };
//   const calculateEstimatedRefillDate = (currentLevel) => {
//     if (!currentLevel || currentLevel <= 0) return "N/A";
//     const daysRemaining = Math.ceil(currentLevel / 0.5);
//     const refillDate = new Date();
//     refillDate.setDate(refillDate.getDate() + daysRemaining);
//     return refillDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
//   };

//   const getDaysUntilCancellation = (bookingDate) => {
//     if (!bookingDate) return 10;
//     const CANCELLATION_DAYS = 10;
//     const bookingTimestamp = new Date(bookingDate).getTime();
//     const nowTimestamp = new Date().getTime();
//     const expiryTimestamp = bookingTimestamp + (CANCELLATION_DAYS * 24 * 60 * 60 * 1000);
//     if (nowTimestamp > expiryTimestamp) return 0;
//     const remainingMillis = expiryTimestamp - nowTimestamp;
//     return Math.ceil(remainingMillis / (1000 * 60 * 60 * 24));
//   };

//   const triggerLeakAlerts = () => {
//     const audio = new Audio('/alert.mp3');
//     audio.play().catch(e => console.error('Audio play failed:', e));
//     if (!("Notification" in window) || Notification.permission !== "granted") return;
//     new Notification("⚠️ GAS LEAK DETECTED!", {
//       body: "Immediate action required! Ventilate the area and check your connection.",
//       icon: "/danger-icon.png",
//       tag: "gas-leak-alert",
//     });
//   };

//   const triggerAutoBookingNotification = () => {
//     if (!("Notification" in window) || Notification.permission !== "granted") return;
//     new Notification("⛽ Gas Auto-Booked!", {
//       body: "Your gas level is low. A new cylinder has been booked. Please proceed to payment.",
//       icon: "/gas-icon.png",
//       tag: "gas-autobook-alert",
//     });
//   };

//   const fetchGasLevel = useCallback(async () => {
//     if (!userEmail) {
//       setErrorGas("User not logged in.");
//       setLoadingGas(false);
//       return;
//     }
//     try {
//       const [gasResponse, kycResponse] = await Promise.all([
//         axios.get(getEndpoint.gasLevel(userEmail)),
//         axios.get(getEndpoint.newConnection(userEmail))
//       ]);
//       const currentData = gasResponse.data;
//       const connectionData = kycResponse.data;
//       setGasLevelData(prevGasLevel => {
//         if (currentData.isLeaking && (!prevGasLevel || !prevGasLevel.isLeaking)) triggerLeakAlerts();
//         const wasAlreadyBooked = prevGasLevel?.bookingStatus === 'booking_pending' || prevGasLevel?.bookingStatus === 'refill_payment_pending';
//         const isNowBooked = currentData.bookingStatus === 'booking_pending' || currentData.bookingStatus === 'refill_payment_pending';
//         if (isNowBooked && !wasAlreadyBooked) triggerAutoBookingNotification();
//         return currentData;
//       });
//       setKycData(connectionData);
//       setErrorGas(null);
//     } catch (err) {
//       console.error("Failed to fetch data:", err);
//       setErrorGas("Could not fetch data. Is the simulation running?");
//       setGasLevelData(null);
//       setKycData(null);
//     } finally {
//       setLoadingGas(false);
//     }
//   }, [userEmail]);

//   useEffect(() => {
//     if ("Notification" in window) setNotificationPermission(Notification.permission);
//   }, []);

//   useEffect(() => {
//     fetchGasLevel();
//     const interval = setInterval(fetchGasLevel, 3000);
//     return () => clearInterval(interval);
//   }, [fetchGasLevel]);

//   const handleRequestNotificationPermission = async () => {
//     if (!("Notification" in window)) return alert("This browser does not support desktop notifications.");
//     const permission = await Notification.requestPermission();
//     setNotificationPermission(permission);
//     if (permission === 'granted') {
//         setSuccessMessage("Notifications enabled! You will now receive critical alerts.");
//         setShowSuccessPopup(true);
//     } else {
//         setErrorMessage("Notifications were not enabled. You can change this in your browser settings.");
//         setShowErrorPopup(true);
//     }
//   };

//   const handleProfileClick = () => navigate('/profile');
//   const handlePayNow = useCallback(() => navigate('/payment', { state: { isRefill: true } }), [navigate]);
//   const handleCancelBooking = useCallback(async () => {
//     setShowCancelPopup(false);
//     try {
//       await axios.put(getEndpoint.cancelBooking(userEmail));
//       setSuccessMessage("Booking cancelled successfully.");
//       setShowSuccessPopup(true);
//       fetchGasLevel();
//     } catch (err) {
//       setErrorMessage(err.response?.data?.message || "Could not cancel the booking.");
//       setShowErrorPopup(true);
//     }
//   }, [userEmail, fetchGasLevel]);
//   const handleBookNow = () => setShowRebookConfirmPopup(true);

//   const handleConfirmRebook = useCallback(async () => {
//     setShowRebookConfirmPopup(false);
//     try {
//       await axios.post(getEndpoint.rebook(userEmail));
//       setGasLevelData(prevData => ({
//         ...prevData,
//         autoBookingCancelled: false,
//         bookingStatus: 'booking_pending',
//         bookingType: 'manual' // Optimistically set type
//       }));
//     } catch (err) {
//       if (err.response?.status === 409) {
//         setGasLevelData(prevData => ({
//           ...prevData,
//           autoBookingCancelled: false,
//           bookingStatus: 'booking_pending'
//         }));
//       } else {
//         setErrorMessage(err.response?.data?.message || "Could not place a new booking.");
//         setShowErrorPopup(true);
//         return;
//       }
//     }
//     navigate('/payment', { state: { isRefill: true } });
//   }, [userEmail, navigate]);
  
//   const handleCancelClick = () => setShowCancelPopup(true);
//   const getGasLevelColor = (level) => {
//     if (level === null || level === undefined) return '#6c757d';
//     if (level > 60) return '#28a745';
//     if (level > BOOKING_THRESHOLD) return '#ffc107';
//     return '#dc3545';
//   };

//   return (
//     <div className="dashboard-container">
//       <header className="dashboard-header">
//         <h1>⛽ Gas Monitor</h1>
//         <div className="nav-actions">
//           <button className="nav-btn" onClick={() => navigate("/userdashboard")}>Dashboard</button>
//           <button className="nav-btn" onClick={() => navigate("/history")}>History</button>
//           <button className="nav-btn" onClick={() => navigate("/report")}>Report</button>
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
//             {gasLevelData ? (<p className="refill-date">{calculateEstimatedRefillDate(gasLevelData.currentLevel)}</p>) : (<p>📈 Calculating...</p>)}
//           </div>
//           <div className="stat-box">
//             <h3>⏰ Tube Expiry Date</h3>
//             {kycData ? (
//               <>
//                 <p className={`tube-expiry-date ${isTubeExpired(kycData.createdAt) ? 'expiry-expired' : isTubeExpiryApproaching(kycData.createdAt) ? 'expiry-warning' : ''}`}>{calculateTubeExpiryDate(kycData.createdAt)}</p>
//                 {isTubeExpired(kycData.createdAt) ? (<small className="expiry-expired-text">🚨 Tube has expired!</small>) : isTubeExpiryApproaching(kycData.createdAt) ? (<small className="expiry-warning-text">⚠️ Expires in {getDaysUntilTubeExpiry(kycData.createdAt)} days</small>) : (<small className="expiry-normal-text">✅ Valid</small>)}
//               </>
//             ) : (<p>📋 Loading...</p>)}
//           </div>
//         </div>
        
//         <div className="alerts-container">
//           <h3>Alerts</h3>
//           {kycData && isTubeExpired(kycData.createdAt) && (<div className="alert-box danger"><i className="danger-icon">🚨</i><p><strong>CRITICAL:</strong> Your LPG tube has expired. Contact support immediately.</p></div>)}
//           {kycData && isTubeExpiryApproaching(kycData.createdAt) && !isTubeExpired(kycData.createdAt) && (<div className="alert-box warning"><i className="warning-icon">⏰</i><p><strong>Tube Expiry Notice:</strong> Your tube expires in {getDaysUntilTubeExpiry(kycData.createdAt)} days. Please schedule a replacement.</p></div>)}
//           {gasLevelData && gasLevelData.isLeaking && (<div className="alert-box danger"><i className="danger-icon">🔥</i><p>Immediate Action: Gas Leak Detected! Ventilate and contact emergency services.</p></div>)}
          
//           {gasLevelData && gasLevelData.currentLevel <= BOOKING_THRESHOLD && gasLevelData.bookingStatus && (gasLevelData.bookingStatus === 'booking_pending' || gasLevelData.bookingStatus === 'refill_payment_pending') && !gasLevelData.isLeaking && !gasLevelData.hasPaidForRefill && (
//             <div className="alert-box warning auto-booking-alert">
//               <div className="auto-booking-content">
//                 <div className="auto-booking-header">
//                   <i className="warning-icon">🎯</i>
//                   {/* ✅ MODIFIED: Conditional header text */}
//                   <h4>
//                     {gasLevelData.bookingType === 'manual' ? 'Gas Refill Booked!' : 'Gas Auto-Booked!'}
//                   </h4>
//                 </div>
//                 <div className="auto-booking-message">
//                    {/* ✅ MODIFIED: Conditional message text */}
//                   <p>
//                     {gasLevelData.bookingType === 'manual' ? 'A new cylinder is reserved for you.' : 'Your gas level is low. A new cylinder has been booked.'}
//                   </p>
//                   <p className="payment-info">💳 <strong>Payment Required:</strong> ₹900</p>
//                   <p className="cancellation-warning">
//                     ⚠️ Please pay within <strong>{getDaysUntilCancellation(gasLevelData.bookingDate)} days</strong> to avoid automatic cancellation.
//                   </p>
//                 </div>
//                 <div className="booking-actions">
//                   <button onClick={handlePayNow} className="pay-now-btn">💳 Pay Now</button>
//                   <button onClick={handleCancelClick} className="cancel-booking-btn">❌ Cancel</button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {gasLevelData && gasLevelData.currentLevel <= BOOKING_THRESHOLD && gasLevelData.autoBookingCancelled && !gasLevelData.bookingStatus && (<div className="alert-box info cancelled-booking-alert"><div className="auto-booking-content"><div className="auto-booking-header"><i className="info-icon">ℹ️</i><h4>Manual Booking Required</h4></div><p>Your previous booking was cancelled. Please book manually to get a refill.</p><div className="booking-actions"><button onClick={handleBookNow} className="book-now-btn">🔄 Book Now</button></div></div></div>)}
          
//           {gasLevelData && !gasLevelData.isLeaking && gasLevelData.currentLevel > BOOKING_THRESHOLD && (<div className="alert-box success"><i className="success-icon">✅</i><p>All systems nominal. No immediate alerts.</p></div>)}
//         </div>
        
//         <div className="notifications-container">
//           <h3>Notifications</h3>
//           {notificationPermission === 'default' && (
//              <div className="notification-box info enable-notifications">
//                 <i className="info-icon">🔔</i>
//                 <div>
//                     <p>Enable system notifications to get critical alerts for gas leaks instantly.</p>
//                     <button onClick={handleRequestNotificationPermission} className="enable-btn">Enable Notifications</button>
//                 </div>
//              </div>
//           )}
//           {notificationPermission === 'denied' && (
//              <div className="notification-box warning">
//                 <i className="warning-icon">🚫</i>
//                 <p>You have blocked notifications. To receive critical alerts, please enable them in your browser's site settings.</p>
//              </div>
//           )}
          
//           {kycData && (<div className="notification-box info"><i className="info-icon">🎉</i><p>Connection established on {new Date(kycData.createdAt).toLocaleDateString('en-IN')}.</p></div>)}
//           {gasLevelData && gasLevelData.hasPaidForRefill && (<div className="notification-box info"><i className="info-icon">ℹ️</i><p>Refill payment confirmed. A new cylinder is ready.</p></div>)}
//           <div className="notification-box success"><i className="success-icon">✅</i><p>Your connection is active and running smoothly.</p></div>
//         </div>
//       </main>
      
//       {showCancelPopup && (<div className="popup-overlay"><div className="popup-content"><h3>Cancel Booking Confirmation</h3><p>Are you sure you want to cancel this booking?</p><div className="popup-buttons"><button onClick={handleCancelBooking} className="confirm-yes">Yes, Cancel</button><button onClick={() => setShowCancelPopup(false)} className="confirm-no">No</button></div></div></div>)}
//       {showRebookConfirmPopup && kycData && (<div className="popup-overlay"><div className="popup-content"><h3>Confirm Manual Booking</h3><p>Please confirm your details before proceeding to payment.</p><div className="user-details-confirm" style={{backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px', padding: '15px', margin: '20px 0', textAlign: 'left'}}><p><strong>Name:</strong> {kycData.firstName} {kycData.lastName}</p><p><strong>Email:</strong> {kycData.email}</p><p><strong>Mobile:</strong> {kycData.mobileNumber}</p><p><strong>Address:</strong> {`${kycData.houseName}, ${kycData.streetName}, ${kycData.town}, ${kycData.district}`}</p></div><div className="popup-buttons"><button onClick={handleConfirmRebook} className="confirm-yes">Confirm & Pay</button><button onClick={() => setShowRebookConfirmPopup(false)} className="confirm-no">Cancel</button></div></div></div>)}
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

const BOOKING_THRESHOLD = 20;

const UserDashboard = () => {
  const navigate = useNavigate();
  const [gasLevelData, setGasLevelData] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [loadingGas, setLoadingGas] = useState(true);
  const [errorGas, setErrorGas] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showRebookConfirmPopup, setShowRebookConfirmPopup] = useState(false);
  const userEmail = localStorage.getItem("userEmail");
  
  const [notificationPermission, setNotificationPermission] = useState('default');

  const calculateTubeExpiryDate = (connectionDate) => {
    if (!connectionDate) return null;
    const expiryDate = new Date(connectionDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    return expiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const getDaysUntilTubeExpiry = (connectionDate) => {
    if (!connectionDate) return null;
    const expiryDate = new Date(connectionDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    const today = new Date();
    const timeDiff = expiryDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };
  const isTubeExpiryApproaching = (connectionDate) => {
    const daysRemaining = getDaysUntilTubeExpiry(connectionDate);
    return daysRemaining !== null && daysRemaining <= 180;
  };
  const isTubeExpired = (connectionDate) => {
    const daysRemaining = getDaysUntilTubeExpiry(connectionDate);
    return daysRemaining !== null && daysRemaining <= 0;
  };
  const calculateEstimatedRefillDate = (currentLevel) => {
    if (!currentLevel || currentLevel <= 0) return "N/A";
    const daysRemaining = Math.ceil(currentLevel / 0.5);
    const refillDate = new Date();
    refillDate.setDate(refillDate.getDate() + daysRemaining);
    return refillDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getDaysUntilCancellation = (bookingDate) => {
    if (!bookingDate) return 10;
    const CANCELLATION_DAYS = 10;
    const bookingTimestamp = new Date(bookingDate).getTime();
    const nowTimestamp = new Date().getTime();
    const expiryTimestamp = bookingTimestamp + (CANCELLATION_DAYS * 24 * 60 * 60 * 1000);
    if (nowTimestamp > expiryTimestamp) return 0;
    const remainingMillis = expiryTimestamp - nowTimestamp;
    return Math.ceil(remainingMillis / (1000 * 60 * 60 * 24));
  };

  const triggerLeakAlerts = () => {
    const audio = new Audio('/alert.mp3');
    audio.play().catch(e => console.error('Audio play failed:', e));
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    new Notification("⚠️ GAS LEAK DETECTED!", {
      body: "Immediate action required! Ventilate the area and check your connection.",
      icon: "/danger-icon.png",
      tag: "gas-leak-alert",
    });
  };

  const triggerAutoBookingNotification = () => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    new Notification("⛽ Gas Auto-Booked!", {
      body: "Your gas level is low. A new cylinder has been booked. Please proceed to payment.",
      icon: "/gas-icon.png",
      tag: "gas-autobook-alert",
    });
  };

  const fetchGasLevel = useCallback(async () => {
    if (!userEmail) {
      setErrorGas("User not logged in.");
      setLoadingGas(false);
      return;
    }
    try {
      const [gasResponse, kycResponse] = await Promise.all([
        axios.get(getEndpoint.gasLevel(userEmail)),
        axios.get(getEndpoint.newConnection(userEmail))
      ]);
      const currentData = gasResponse.data;
      const connectionData = kycResponse.data;
      setGasLevelData(prevGasLevel => {
        if (currentData.isLeaking && (!prevGasLevel || !prevGasLevel.isLeaking)) triggerLeakAlerts();
        const wasAlreadyBooked = prevGasLevel?.bookingStatus === 'booking_pending' || prevGasLevel?.bookingStatus === 'refill_payment_pending';
        const isNowBooked = currentData.bookingStatus === 'booking_pending' || currentData.bookingStatus === 'refill_payment_pending';
        if (isNowBooked && !wasAlreadyBooked) triggerAutoBookingNotification();
        return currentData;
      });
      setKycData(connectionData);
      setErrorGas(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setErrorGas("Could not fetch data. Is the simulation running?");
      setGasLevelData(null);
      setKycData(null);
    } finally {
      setLoadingGas(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if ("Notification" in window) setNotificationPermission(Notification.permission);
  }, []);

  useEffect(() => {
    fetchGasLevel();
    const interval = setInterval(fetchGasLevel, 3000);
    return () => clearInterval(interval);
  }, [fetchGasLevel]);

  const handleRequestNotificationPermission = async () => {
    if (!("Notification" in window)) return alert("This browser does not support desktop notifications.");
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
        setSuccessMessage("Notifications enabled! You will now receive critical alerts.");
        setShowSuccessPopup(true);
    } else {
        setErrorMessage("Notifications were not enabled. You can change this in your browser settings.");
        setShowErrorPopup(true);
    }
  };

  const handleProfileClick = () => navigate('/profile');
  const handlePayNow = useCallback(() => navigate('/payment', { state: { isRefill: true } }), [navigate]);
  const handleCancelBooking = useCallback(async () => {
    setShowCancelPopup(false);
    try {
      await axios.put(getEndpoint.cancelBooking(userEmail));
      setSuccessMessage("Booking cancelled successfully.");
      setShowSuccessPopup(true);
      fetchGasLevel();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Could not cancel the booking.");
      setShowErrorPopup(true);
    }
  }, [userEmail, fetchGasLevel]);
  const handleBookNow = () => setShowRebookConfirmPopup(true);

  // ✅ --- THIS IS THE CORRECTED LOGIC --- ✅
  const handleConfirmRebook = useCallback(async () => {
    setShowRebookConfirmPopup(false);
    try {
      // Step 1: Wait for the manual booking to be created and saved in the database.
      await axios.post(getEndpoint.rebook(userEmail));
      
      // Step 2: After it's saved, immediately re-fetch the latest data from the server.
      // This ensures our component's state is 100% in sync with the database.
      await fetchGasLevel();

    } catch (err) {
      // If the booking already exists (e.g., double click), that's okay.
      // We still proceed to payment. For other errors, we show a message.
      if (err.response?.status !== 409) {
        setErrorMessage(err.response?.data?.message || "Could not place a new booking.");
        setShowErrorPopup(true);
        return; // Stop execution on critical error
      }
    }
    
    // Step 3: Only after the state is confirmed to be correct, navigate to payment.
    navigate('/payment', { state: { isRefill: true } });
  }, [userEmail, navigate, fetchGasLevel]); // Added fetchGasLevel to dependencies
  
  const handleCancelClick = () => setShowCancelPopup(true);
  const getGasLevelColor = (level) => {
    if (level === null || level === undefined) return '#6c757d';
    if (level > 60) return '#28a745';
    if (level > BOOKING_THRESHOLD) return '#ffc107';
    return '#dc3545';
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
            {gasLevelData ? (<p className="refill-date">{calculateEstimatedRefillDate(gasLevelData.currentLevel)}</p>) : (<p>📈 Calculating...</p>)}
          </div>
          <div className="stat-box">
            <h3>⏰ Tube Expiry Date</h3>
            {kycData ? (
              <>
                <p className={`tube-expiry-date ${isTubeExpired(kycData.createdAt) ? 'expiry-expired' : isTubeExpiryApproaching(kycData.createdAt) ? 'expiry-warning' : ''}`}>{calculateTubeExpiryDate(kycData.createdAt)}</p>
                {isTubeExpired(kycData.createdAt) ? (<small className="expiry-expired-text">🚨 Tube has expired!</small>) : isTubeExpiryApproaching(kycData.createdAt) ? (<small className="expiry-warning-text">⚠️ Expires in {getDaysUntilTubeExpiry(kycData.createdAt)} days</small>) : (<small className="expiry-normal-text">✅ Valid</small>)}
              </>
            ) : (<p>📋 Loading...</p>)}
          </div>
        </div>
        
        <div className="alerts-container">
          <h3>Alerts</h3>
          {kycData && isTubeExpired(kycData.createdAt) && (<div className="alert-box danger"><i className="danger-icon">🚨</i><p><strong>CRITICAL:</strong> Your LPG tube has expired. Contact support immediately.</p></div>)}
          {kycData && isTubeExpiryApproaching(kycData.createdAt) && !isTubeExpired(kycData.createdAt) && (<div className="alert-box warning"><i className="warning-icon">⏰</i><p><strong>Tube Expiry Notice:</strong> Your tube expires in {getDaysUntilTubeExpiry(kycData.createdAt)} days. Please schedule a replacement.</p></div>)}
          {gasLevelData && gasLevelData.isLeaking && (<div className="alert-box danger"><i className="danger-icon">🔥</i><p>Immediate Action: Gas Leak Detected! Ventilate and contact emergency services.</p></div>)}
          
          {gasLevelData && gasLevelData.currentLevel <= BOOKING_THRESHOLD && gasLevelData.bookingStatus && (gasLevelData.bookingStatus === 'booking_pending' || gasLevelData.bookingStatus === 'refill_payment_pending') && !gasLevelData.isLeaking && !gasLevelData.hasPaidForRefill && (
            <div className="alert-box warning auto-booking-alert">
              <div className="auto-booking-content">
                <div className="auto-booking-header">
                  <i className="warning-icon">🎯</i>
                  <h4>
                    {gasLevelData.bookingType === 'manual' ? 'Gas Refill Booked!' : 'Gas Auto-Booked!'}
                  </h4>
                </div>
                <div className="auto-booking-message">
                  <p>
                    {gasLevelData.bookingType === 'manual' ? 'A new cylinder is reserved for you.' : 'Your gas level is low. A new cylinder has been booked.'}
                  </p>
                  <p className="payment-info">💳 <strong>Payment Required:</strong> ₹900</p>
                  <p className="cancellation-warning">
                    ⚠️ Please pay within <strong>{getDaysUntilCancellation(gasLevelData.bookingDate)} days</strong> to avoid automatic cancellation.
                  </p>
                </div>
                <div className="booking-actions">
                  <button onClick={handlePayNow} className="pay-now-btn">💳 Pay Now</button>
                  <button onClick={handleCancelClick} className="cancel-booking-btn">❌ Cancel</button>
                </div>
              </div>
            </div>
          )}

          {gasLevelData && gasLevelData.currentLevel <= BOOKING_THRESHOLD && gasLevelData.autoBookingCancelled && !gasLevelData.bookingStatus && (<div className="alert-box info cancelled-booking-alert"><div className="auto-booking-content"><div className="auto-booking-header"><i className="info-icon">ℹ️</i><h4>Manual Booking Required</h4></div><p>Your previous booking was cancelled. Please book manually to get a refill.</p><div className="booking-actions"><button onClick={handleBookNow} className="book-now-btn">🔄 Book Now</button></div></div></div>)}
          
          {gasLevelData && !gasLevelData.isLeaking && gasLevelData.currentLevel > BOOKING_THRESHOLD && (<div className="alert-box success"><i className="success-icon">✅</i><p>All systems nominal. No immediate alerts.</p></div>)}
        </div>
        
        <div className="notifications-container">
          <h3>Notifications</h3>
          {notificationPermission === 'default' && (
             <div className="notification-box info enable-notifications">
                <i className="info-icon">🔔</i>
                <div>
                    <p>Enable system notifications to get critical alerts for gas leaks instantly.</p>
                    <button onClick={handleRequestNotificationPermission} className="enable-btn">Enable Notifications</button>
                </div>
             </div>
          )}
          {notificationPermission === 'denied' && (
             <div className="notification-box warning">
                <i className="warning-icon">🚫</i>
                <p>You have blocked notifications. To receive critical alerts, please enable them in your browser's site settings.</p>
             </div>
          )}
          
          {kycData && (<div className="notification-box info"><i className="info-icon">🎉</i><p>Connection established on {new Date(kycData.createdAt).toLocaleDateString('en-IN')}.</p></div>)}
          {gasLevelData && gasLevelData.hasPaidForRefill && (<div className="notification-box info"><i className="info-icon">ℹ️</i><p>Refill payment confirmed. A new cylinder is ready.</p></div>)}
          <div className="notification-box success"><i className="success-icon">✅</i><p>Your connection is active and running smoothly.</p></div>
        </div>
      </main>
      
      {showCancelPopup && (<div className="popup-overlay"><div className="popup-content"><h3>Cancel Booking Confirmation</h3><p>Are you sure you want to cancel this booking?</p><div className="popup-buttons"><button onClick={handleCancelBooking} className="confirm-yes">Yes, Cancel</button><button onClick={() => setShowCancelPopup(false)} className="confirm-no">No</button></div></div></div>)}
      {showRebookConfirmPopup && kycData && (<div className="popup-overlay"><div className="popup-content"><h3>Confirm Manual Booking</h3><p>Please confirm your details before proceeding to payment.</p><div className="user-details-confirm" style={{backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px', padding: '15px', margin: '20px 0', textAlign: 'left'}}><p><strong>Name:</strong> {kycData.firstName} {kycData.lastName}</p><p><strong>Email:</strong> {kycData.email}</p><p><strong>Mobile:</strong> {kycData.mobileNumber}</p><p><strong>Address:</strong> {`${kycData.houseName}, ${kycData.streetName}, ${kycData.town}, ${kycData.district}`}</p></div><div className="popup-buttons"><button onClick={handleConfirmRebook} className="confirm-yes">Confirm & Pay</button><button onClick={() => setShowRebookConfirmPopup(false)} className="confirm-no">Cancel</button></div></div></div>)}
      {showSuccessPopup && (<div className="popup-overlay"><div className="popup-content notification success"><h3>✅ Success</h3><p>{successMessage}</p><button onClick={() => setShowSuccessPopup(false)} className="popup-ok">OK</button></div></div>)}
      {showErrorPopup && (<div className="popup-overlay"><div className="popup-content notification error"><h3>❌ Error</h3><p>{errorMessage}</p><button onClick={() => setShowErrorPopup(false)} className="popup-ok">OK</button></div></div>)}
    </div>
  );
};

export default UserDashboard;
