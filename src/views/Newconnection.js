
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
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: '900px',
        margin: 'auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        background: '#fff',
        borderRadius: '6px',
        boxShadow: '0 0 12px rgba(0,0,0,0.1)',
      }}
    >
      <h2 style={{ textAlign: 'center' }}>Know Your Customer (KYC) Form</h2>
      <p style={{ textAlign: 'center', color: 'red' }}>*Mandatory Fields</p>

      {/* 1) Personal Details */}
      <fieldset style={{ marginBottom: '30px', border: 'none' }}>
        <legend
          style={{
            backgroundColor: '#1a237e',
            color: '#fff',
            padding: '10px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
          }}
        >
          1) Personal Details
        </legend>

        <label>
          Salutation*:
          <select
            name="salutation"
            value={formData.salutation}
            onChange={handleChange}
            required
          >
            <option value="">--Select--</option>
            {salutations.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <label style={{ flex: 1 }}>
            First Name*:
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </label>
          <label style={{ flex: 1 }}>
            Middle Name:
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
            />
          </label>
          <label style={{ flex: 1 }}>
            Last Name*:
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <label style={{ marginTop: '10px', display: 'block' }}>
          Date of Birth*:
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
          {errors.dob && <p style={{ color: "red", fontSize: "12px" }}>{errors.dob}</p>}
        </label>

        <fieldset
          style={{ border: '1px solid #ccc', padding: '10px', marginTop: '15px' }}
        >
          <legend style={{ fontWeight: 'bold' }}>Close Relative</legend>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ flex: 1 }}>
              Father's Name:
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
              />
            </label>
            <span>OR</span>
            <label style={{ flex: 1 }}>
              Spouse Name:
              <input
                type="text"
                name="spouseName"
                value={formData.spouseName}
                onChange={handleChange}
              />
            </label>
          </div>
          <label style={{ marginTop: '10px', display: 'block' }}>
            Mother's Name:
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
            />
          </label>
          <small style={{ color: '#555' }}>
            (At least one of Father, Spouse, or Mother name is required)
          </small>
          {errors.relative && <p style={{ color: "red", fontSize: "12px" }}>{errors.relative}</p>}
        </fieldset>
      </fieldset>

      {/* 2) Address */}
      <fieldset style={{ marginBottom: '30px', border: 'none' }}>
        <legend
          style={{
            backgroundColor: '#1a237e',
            color: '#fff',
            padding: '10px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
          }}
        >
          2) Address for LPG connection / Contact Information
        </legend>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          <label style={{ flex: '1 1 300px' }}>
            House / Flat #, Name*:
            <input
              type="text"
              name="houseName"
              value={formData.houseName}
              onChange={handleChange}
              required
            />
          </label>
          <label style={{ flex: '1 1 150px' }}>
            Floor No:
            <input
              type="text"
              name="floorNo"
              value={formData.floorNo}
              onChange={handleChange}
            />
          </label>
          <label style={{ flex: '1 1 300px' }}>
            Housing Complex/Building:
            <input
              type="text"
              name="housingComplex"
              value={formData.housingComplex}
              onChange={handleChange}
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          <label style={{ flex: '1 1 300px' }}>
            Street/Road Name*:
            <input
              type="text"
              name="streetName"
              value={formData.streetName}
              onChange={handleChange}
              required
            />
          </label>
          <label style={{ flex: '1 1 300px' }}>
            Land Mark*:
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              required
            />
          </label>
          <label style={{ flex: '1 1 300px' }}>
            City/Town/Village*:
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          <label style={{ flex: '1 1 300px' }}>
            State*:
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </label>
          <label style={{ flex: '1 1 300px' }}>
            District*:
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          <label style={{ flex: '1 1 300px' }}>
            Pin Code*:
            <input
              type="text"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange}
              required
              placeholder="Enter 6-digit PIN"
            />
            {errors.pinCode && <p style={{ color: "red", fontSize: "12px" }}>{errors.pinCode}</p>}
          </label>
          <label style={{ flex: '1 1 300px' }}>
            Mobile Number*:
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              placeholder="10-digit Mobile Number"
            />
            {errors.mobileNumber && <p style={{ color: "red", fontSize: "12px" }}>{errors.mobileNumber}</p>}
          </label>
          <label style={{ flex: '1 1 300px' }}>
            Telephone Number:
            <input
              type="tel"
              name="telephoneNumber"
              value={formData.telephoneNumber}
              onChange={handleChange}
            />
            <small>(With STD Code without prefixing '0')</small>
          </label>
        </div>

        <label style={{ display: 'block', marginTop: '10px' }}>
          Email ID*:
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="example@gmail.com"
          />
          {errors.email && <p style={{ color: "red", fontSize: "12px" }}>{errors.email}</p>}
        </label>
      </fieldset>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          type="submit"
          style={{
            padding: '10px 30px',
            backgroundColor: '#1a237e',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
        {successMessage && (
          <p style={{ color: "green", marginTop: "10px" }}>{successMessage}</p>
        )}
      </div>
    </form>
  );
}

export default KYCForm;