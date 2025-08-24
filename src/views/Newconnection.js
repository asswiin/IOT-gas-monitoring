
import React, { useState, useEffect } from 'react';
import '../styles/Newconnection.css'; // ✅ Ensure correct path
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
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const salutations = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];
  const navigate = useNavigate();

  // ✅ Auto-fill email + phone from localStorage
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: localStorage.getItem("userEmail") || "",
      mobileNumber: localStorage.getItem("userPhone") || "",
    }));
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // 🔹 Restrict PIN code to max 6 digits
    if (name === "pinCode") {
      value = value.replace(/\D/g, "");
      if (value.length > 6) return;
    }

    // 🔹 Restrict mobile number to max 10 digits
    if (name === "mobileNumber") {
      value = value.replace(/\D/g, "");
      if (value.length > 10) return;
    }

    // 🔹 Email should always be lowercase
    if (name === "email") {
      value = value.toLowerCase();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    // ✅ validation (your same rules)
    if (
      !formData.fatherName.trim() &&
      !formData.spouseName.trim() &&
      !formData.motherName.trim()
    ) {
      newErrors.relative = "Fill in the necessary information";
    }
    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Invalid Phone number";
    }
    if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = "Invalid pincode.";
    }
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }
    if (formData.dob) {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      if (age < 18) newErrors.dob = "You must be at least 18 years old.";
    } else {
      newErrors.dob = "Date of Birth is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMessage("");
      return;
    }

    try {
      // ✅ Send to backend (Node/Express)
      const res = await axios.post("http://localhost:5000/api/newconnection", formData);

      setSuccessMessage("Form submitted successfully! ✅");
      setErrors({});
      console.log("Saved:", res.data);

  // ✅ Save to localStorage so Payment page can load it
  localStorage.setItem("kycFormData", JSON.stringify(formData));


      setTimeout(() => {
        navigate("/payment");
      }, 1500);

    } catch (err) {
      console.error("Error:", err);
      setSuccessMessage("");
      setErrors({ api: "Failed to submit form. Try again." });
    }
  };

  return (
  <form onSubmit={handleSubmit} className="kyc-form">
    <h2>Know Your Customer (KYC) Form</h2>
    <p className="subtitle">*Mandatory Fields</p>

    {successMessage && (
      <div className="success-box">{successMessage}</div>
    )}

    {/* Personal Details */}
    <fieldset>
      <legend>1) Personal Details</legend>

      <div className="form-group">
        <label>Salutation*</label>
        <select
          name="salutation"
          value={formData.salutation}
          onChange={handleChange}
          required
        >
          <option value="">--Select--</option>
          {salutations.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="grid-3">
        <div className="form-group">
          <label>First Name*</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Middle Name</label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Last Name*</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Date of Birth*</label>
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          required
        />
        {errors.dob && <p className="error">{errors.dob}</p>}
      </div>

      <fieldset>
        <legend>Close Relative</legend>
        <div className="grid-2">
          <div className="form-group">
            <label>Father's Name</label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Spouse Name</label>
            <input
              type="text"
              name="spouseName"
              value={formData.spouseName}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Mother's Name</label>
          <input
            type="text"
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
          />
        </div>
        {errors.relative && <p className="error">{errors.relative}</p>}
      </fieldset>
    </fieldset>

    {/* Address Section */}
    <fieldset>
      <legend>2) Address / Contact Information</legend>

      <div className="grid-2">
        <div className="form-group">
          <label>House / Flat #, Name*</label>
          <input
            type="text"
            name="houseName"
            value={formData.houseName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Floor No</label>
          <input
            type="text"
            name="floorNo"
            value={formData.floorNo}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Housing Complex / Building</label>
        <input
          type="text"
          name="housingComplex"
          value={formData.housingComplex}
          onChange={handleChange}
        />
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label>Street / Road Name*</label>
          <input
            type="text"
            name="streetName"
            value={formData.streetName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Landmark*</label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label>City*</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>District*</label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label>State*</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Pin Code*</label>
          <input
            type="text"
            name="pinCode"
            value={formData.pinCode}
            onChange={handleChange}
            required
          />
          {errors.pinCode && <p className="error">{errors.pinCode}</p>}
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label>Mobile Number*</label>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
          />
          {errors.mobileNumber && <p className="error">{errors.mobileNumber}</p>}
        </div>
        <div className="form-group">
          <label>Email*</label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>
      </div>
    </fieldset>

    <div className="submit-container">
      <button type="submit">Submit</button>
    </div>
  </form>
);

}

export default KYCForm;