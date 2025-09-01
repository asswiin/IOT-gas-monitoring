
import React, { useState, useEffect } from 'react';
import '../styles/Newconnection.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";

function KYCForm() {
  const [formData, setFormData] = useState({
    salutation: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    fatherName: '',
    spouseName: '',
    motherName: '',
    houseName: '',
    floorNo: '',
    housingComplex: '',
    streetName: '',
    landmark: '',
    city: '',
    state: '',
    district: '',
    pinCode: '',
    mobileNumber: '',
    telephoneNumber: '',
    email: '',
    status: 'pending_approval', // ✅ Default status for new applications
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isExistingUser, setIsExistingUser] = useState(false);
  const salutations = ['Mr.', 'Mrs.'];
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    let userPhone = localStorage.getItem("userPhone");

    if (userPhone && userPhone.startsWith("+91")) {
      userPhone = userPhone.substring(3);
    }
    // Only set initial email/mobile if formData doesn't already have it (e.g., from an existing record)
    setFormData(prev => ({
      ...prev,
      email: prev.email || userEmail || "",
      mobileNumber: prev.mobileNumber || userPhone || ""
    }));


    if (userEmail) {
      axios.get(`http://localhost:5000/api/newconnection/${userEmail}`)
        .then(res => {
          if (res.data) {
            const fetchedData = { ...res.data };
            // Clean mobile number from fetched data too if it has +91
            if (fetchedData.mobileNumber && fetchedData.mobileNumber.startsWith("+91")) {
              fetchedData.mobileNumber = fetchedData.mobileNumber.substring(3);
            }
            setFormData(prev => ({ ...prev, ...fetchedData })); // Merge existing data
            setIsExistingUser(true);

            if (res.data.status === 'approved') {
              navigate("/payment");
            } else if (res.data.status === 'rejected') {
              setSuccessMessage("Your previous request was rejected. Please review your details and re-submit.");
              localStorage.removeItem("kycFormData");
            } else if (res.data.status === 'pending_approval') {
              navigate("/processing");
            }
          }
        })

        .catch((err) => {
          console.log("No existing KYC record found or error fetching.", err);
          setIsExistingUser(false);
          // If a rejected status was cleared, ensure the form data is clean for a new attempt
          if (localStorage.getItem("userEmail") && userPhone) { // Use the cleaned userPhone
            setFormData(prev => ({ ...prev, email: localStorage.getItem("userEmail"), mobileNumber: userPhone, status: 'pending_approval' }));
          }
        });
    }
  }, [navigate]); // Add navigate to dependency array

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "pinCode") {
      value = value.replace(/\D/g, "");
      if (value.length > 6) return;
    }

    if (name === "mobileNumber") {
      value = value.replace(/\D/g, "");
      if (value.length > 10) return;
    }
    if (name === "telephoneNumber") {
      value = value.replace(/\D/g, "");
      if (value.length > 11) return;
    }

    if (name === "email") {
      value = value.toLowerCase();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // --- Validation Logic ---
    if (!formData.fatherName?.trim() && !formData.spouseName?.trim() && !formData.motherName?.trim()) {
      newErrors.relative = "Fill the necessary field .";
    }
    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Invalid Number.";
    }
    if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = "Invalid pincode.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid Email.";
    }
    if (formData.dob) {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.dob = "You must be at least 18 years old to apply.";
      }
    } else {
      newErrors.dob = "Date of Birth is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMessage("");
      return;
    }

    setErrors({});

    // ✅ Always set status to pending_approval on submission
    const dataToSend = {
      ...formData,
      mobileNumber: "+91" + formData.mobileNumber, // Add +91 back here
      status: 'pending_approval'
    };
    console.log("Sending data to backend:", dataToSend);

    try {
      if (isExistingUser) {
        const res = await axios.put(`http://localhost:5000/api/newconnection/${formData.email}`, dataToSend);
        setSuccessMessage("Form updated successfully! Your request is awaiting admin approval.");
        localStorage.setItem("kycFormData", JSON.stringify(res.data.kycData));
      } else {
        const res = await axios.post("http://localhost:5000/api/newconnection", dataToSend);
        setSuccessMessage("Form submitted successfully! Your request is awaiting admin approval.");
        localStorage.setItem("kycFormData", JSON.stringify(res.data.kycData));
      }
      navigate("/processing");

    } catch (err) {
      console.error("Submission Error:", err);
      setSuccessMessage("");
      if (err.response && err.response.status === 409) {
        setErrors({ api: err.response.data.message });
      } else {
        setErrors({ api: err.response?.data?.message || "Failed to submit form. Please try again." });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="kyc-form">
      <h2>Know Your Customer (KYC) Form</h2>
      <p className="subtitle">*Mandatory Fields</p>

      {/* Personal Details */}
      <fieldset>
        <legend>1) Personal Details</legend>
        <div className="form-group">
          <label>Salutation*</label>
          <select name="salutation" value={formData.salutation || ''} onChange={handleChange} required>
            <option value="">--Select--</option>
            {salutations.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
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
        <button type="submit">Submit</button>

        <div className="submit-feedback">
          {successMessage && <div className="success-box">{successMessage}</div>}
          {errors.api && <p className="error api-error">{errors.api}</p>}
        </div>
      </div>
    </form>
  );
}

export default KYCForm;