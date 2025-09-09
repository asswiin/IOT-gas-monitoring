import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/profile.css'; // Make sure you have this CSS file
import { getEndpoint } from '../config';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [error, setError] = useState('');
  const [showSignOutPopup, setShowSignOutPopup] = useState(false);
  const [showDeactivatePopup, setShowDeactivatePopup] = useState(false); // ✅ Completed useState declaration
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      navigate("/login"); // Redirect to login if not authenticated
      return;
    }

    // Fetch user profile data
    axios.get(getEndpoint.newConnection(userEmail))
      .then(res => {
        setProfileData(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch profile data:", err);
        setError("Could not load your profile. Please try again later.");
      });
  }, [navigate]);

  const handleSignOutClick = () => {
    setShowSignOutPopup(true);
  };

  const handleSignOutConfirm = () => {
    localStorage.clear(); // Clears all session data
    navigate("/login", { replace: true });
  };

  const handleSignOutCancel = () => {
    setShowSignOutPopup(false);
  };

  // ✅ NEW: Handle Deactivate Account Logic
  const handleDeactivateAccountConfirm = async () => {
    try {
      if (!profileData || !profileData.email) {
        setError("User email not found for deactivation.");
        return;
      }
      await axios.put(getEndpoint.deactivateConnection(profileData.email));
      localStorage.clear(); // Clear session data
      navigate("/login", { replace: true }); // Redirect to login
    } catch (error) {
      console.error("Failed to deactivate account:", error);
      setError("Failed to deactivate account. Please try again.");
    } finally {
      setShowDeactivatePopup(false); // Close popup regardless of success/failure
    }
  };

  const handleDeactivateAccountCancel = () => {
    setShowDeactivatePopup(false);
  };

  // Show a loading or error message while data is being fetched
  if (error) {
    return <div className="profile-container"><p className="error">{error}</p></div>;
  }

  if (!profileData) {
    return <div className="profile-container"><p>Loading profile...</p></div>;
  }

  // Destructure all fields from profileData for easier access
  const {
    salutation,
    firstName,
    middleName,
    lastName,
    email, 
    mobileNumber,
    dob,
    fatherName,
    spouseName,
    motherName,
    houseName,
    floorNo,
    housingComplex,
    streetName,
    landmark,
    city,
    district,
    state,
    pinCode
  } = profileData;

  const fullName = `${salutation || ''} ${firstName} ${middleName || ''} ${lastName}`;
  const fullAddress = [
    houseName,
    floorNo ? `Floor No: ${floorNo}` : null,
    housingComplex,
    streetName,
    landmark,
    `${city}, ${district}`,
    `${state} - ${pinCode}`
  ].filter(Boolean).join(', '); // filter(Boolean) removes any null/empty parts

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={() => navigate('/userdashboard')} className="back-to-dashboard-btn">
          &larr; Back to Dashboard
        </button>
        <h2>Your Profile</h2>
      </div>

      <div className="profile-card">
        {/* --- BASIC DETAILS --- */}
        <div className="basic-details">
          <h3>{fullName}</h3>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Phone:</strong> {mobileNumber}</p>
          <p><strong>Status:</strong> <span className={`status ${profileData.status}`}>{profileData.status.replace(/_/g, ' ')}</span></p> {/* ✅ Show status */}
        </div>

        <button onClick={() => setShowFullDetails(!showFullDetails)} className="view-more-btn">
          {showFullDetails ? 'View Less' : 'View More'}
        </button>

        {/* --- FULL DETAILS (Conditional) --- */}
        {showFullDetails && (
          <div className="full-details">
            <h4>Personal Information</h4>
            <p><strong>Date of Birth:</strong> {new Date(dob).toLocaleDateString()}</p>

            <div className="details-section">
                <h4>Close Relatives</h4>
                {fatherName && <p><strong>Father's Name:</strong> {fatherName}</p>}
                {spouseName && <p><strong>Spouse's Name:</strong> {spouseName}</p>}
                {motherName && <p><strong>Mother's Name:</strong> {motherName}</p>}
            </div>

            <div className="details-section">
                <h4>Address Information</h4>
                <p><strong>Full Address:</strong> {fullAddress}</p>
            </div>
          </div>
        )}
 
        {/* --- ACTION BUTTONS --- */}
        <div className="profile-actions">
          <button onClick={() => navigate('/editprofile')} className="action-btn edit-btn">
            Edit Profile
          </button>
          {/* ✅ NEW: Deactivate Account Button */}
          {profileData.status !== 'deactivated' && ( // Only show if not already deactivated
            <button onClick={() => setShowDeactivatePopup(true)} className="action-btn deactivate-btn">
              Deactivate Account
            </button>
          )}
          <button onClick={handleSignOutClick} className="action-btn signout-btn">
            Sign Out
          </button>
        </div>
      </div>

      {/* ✅ NEW: Deactivate Confirmation Popup */}
      {showDeactivatePopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Deactivate Account</h3>
            <p>Are you sure you want to deactivate your account? Your connection will be marked as 'deactivated' and you will be logged out. You can reactivate by contacting support.</p>
            <div className="popup-buttons">
              <button onClick={handleDeactivateAccountConfirm} className="confirm-yes">Yes, Deactivate</button>
              <button onClick={handleDeactivateAccountCancel} className="confirm-no">No, Keep Active</button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Popup (from original code) */}
      {showSignOutPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Sign Out Confirmation</h3>
            <p>Are you sure you want to sign out?</p>
            <div className="popup-buttons">
              <button onClick={handleSignOutConfirm} className="confirm-yes">Yes</button>
              <button onClick={handleSignOutCancel} className="confirm-no">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;