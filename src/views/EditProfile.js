import React, { useState, useEffect } from 'react';
import '../styles/Newconnection.css'; // You can reuse the same styles
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/editProfile.css'; // Optional: separate styles if needed

function EditProfile() {
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // 1. Fetch current user data when the component loads
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      axios.get(`http://localhost:5000/api/newconnection/${userEmail}`)
        .then(res => {
          // Format the date before setting it in the form
          const formattedData = {
            ...res.data,
            dob: res.data.dob ? new Date(res.data.dob).toISOString().split('T')[0] : ''
          };
          setFormData(formattedData); // Pre-fill the form with existing data
        })
        .catch(err => {
          console.error("Failed to fetch user data:", err);
          setErrors({ api: "Could not load your profile data." });
        });
    } else {
      navigate("/login"); // Redirect if user is not logged in
    }
  }, [navigate]);

  // Handler for form input changes (can be the same as NewConnection)
  const handleChange = (e) => {
    let { name, value } = e.target;
    // (Add any input restrictions like for pinCode or mobileNumber if needed)
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // (Add validation logic here if you want to re-validate on update)
    
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    try {
      // 3. Send a PUT request to update the data
      await axios.put(`http://localhost:5000/api/newconnection/${userEmail}`, formData);
      setSuccessMessage("Profile updated successfully!");
      setErrors({});
      
      setTimeout(() => {
        navigate("/profile"); // Go back to dashboard after update
      }, 2000);

    } catch (err) {
      console.error("Update Error:", err);
      setSuccessMessage("");
      setErrors({ api: "Failed to update profile. Please try again." });
    }
  };

  return (
    // The form is almost identical to NewConnection, but points to a different handler
    <form onSubmit={handleSubmit} className="kyc-form">
      <h2>Edit Your Profile</h2>
 <p className="subtitle">*Mandatory Fields</p>

      {/* --- ✅ MESSAGES ARE REMOVED FROM HERE --- */}

      {/* Personal Details */}
      <fieldset>
        <legend>1) Personal Details</legend>
        <div className="form-group">
          <label>Salutation*</label>
    
        </div>
        <div className="grid-3">
          <div className="form-group"><label>First Name*</label><input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} required /></div>
          <div className="form-group"><label>Middle Name</label><input type="text" name="middleName" value={formData.middleName || ''} onChange={handleChange} /></div>
          <div className="form-group"><label>Last Name*</label><input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} required /></div>
        </div>
        <div className="form-group">
          <label>Date of Birth*</label>
          <input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} required />
          {errors.dob && <p className="error">{errors.dob}</p>}
        </div>
        <fieldset>
          <legend>Close Relative</legend>
          <div className="grid-2">
            <div className="form-group"><label>Father's Name</label><input type="text" name="fatherName" value={formData.fatherName || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Spouse Name</label><input type="text" name="spouseName" value={formData.spouseName || ''} onChange={handleChange} /></div>
          </div>
          <div className="form-group"><label>Mother's Name</label><input type="text" name="motherName" value={formData.motherName || ''} onChange={handleChange} /></div>
          {errors.relative && <p className="error">{errors.relative}</p>}
        </fieldset>
      </fieldset>

      {/* Address Section */}
      <fieldset>
        <legend>2) Address / Contact Information</legend>
        <div className="grid-2">
          <div className="form-group"><label>House / Flat #, Name*</label><input type="text" name="houseName" value={formData.houseName || ''} onChange={handleChange} required /></div>
          <div className="form-group"><label>Floor No</label><input type="text" name="floorNo" value={formData.floorNo || ''} onChange={handleChange} /></div>
        </div>
        <div className="form-group"><label>Housing Complex / Building</label><input type="text" name="housingComplex" value={formData.housingComplex || ''} onChange={handleChange} /></div>
        <div className="grid-2">
          <div className="form-group"><label>Street / Road Name*</label><input type="text" name="streetName" value={formData.streetName || ''} onChange={handleChange} required /></div>
          <div className="form-group"><label>Landmark*</label><input type="text" name="landmark" value={formData.landmark || ''} onChange={handleChange} required /></div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label>City*</label><input type="text" name="city" value={formData.city || ''} onChange={handleChange} required /></div>
          <div className="form-group"><label>District*</label><input type="text" name="district" value={formData.district || ''} onChange={handleChange} required /></div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label>State*</label><input type="text" name="state" value={formData.state || ''} onChange={handleChange} required /></div>
          <div className="form-group">
            <label>Pin Code*</label>
            <input type="text" name="pinCode" value={formData.pinCode || ''} onChange={handleChange} required />
            {errors.pinCode && <p className="error">{errors.pinCode}</p>}
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label>Mobile Number*</label>
            <input type="tel" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} required />
            {errors.mobileNumber && <p className="error">{errors.mobileNumber}</p>}
          </div>
           <div className="form-group">
            <label>Email*</label>
            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
            {errors.email && <p className="error">{errors.email}</p>}
          </div> 
        </div>
        
      </fieldset>
     

      <div className="submit-container">
        <button type="submit">Update Profile</button>
        <div className="submit-feedback">
            {successMessage && <div className="success-box">{successMessage}</div>}
            {errors.api && <p className="error api-error">{errors.api}</p>}
        </div>
      </div>
    </form>
  );
}

export default EditProfile;