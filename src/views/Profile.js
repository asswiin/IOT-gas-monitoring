import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/profile.css'; // Make sure you have this CSS file

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      navigate("/login"); // Redirect if not logged in
      return;
    }

    // Fetch user profile data
    axios.get(`http://localhost:5000/api/newconnection/${userEmail}`)
      .then(res => {
        setProfileData(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch profile data:", err);
        setError("Could not load your profile. Please try again later.");
      });
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.clear(); // Clears all session data
    navigate("/login", { replace: true });
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
          <button onClick={handleSignOut} className="action-btn signout-btn">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;