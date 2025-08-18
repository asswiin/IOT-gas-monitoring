import React, { useState } from 'react';
import '../styles/Newconnection.css'; // ✅ Ensure correct path

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

  const salutations = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];

  const handleChange = (e) => {
    let { name, value } = e.target;

    // 🔹 Restrict PIN code to max 6 digits
    if (name === "pinCode") {
      value = value.replace(/\D/g, ""); // only numbers
      if (value.length > 6) return;
    }

    // 🔹 Restrict mobile number to max 10 digits
    if (name === "mobileNumber") {
      value = value.replace(/\D/g, ""); // only numbers
      if (value.length > 10) return;
    }

    // 🔹 Email should always be lowercase
    if (name === "email") {
      value = value.toLowerCase();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validation: At least one of Father/Spouse/Mother must be filled
    if (
      !formData.fatherName.trim() &&
      !formData.spouseName.trim() &&
      !formData.motherName.trim()
    ) {
      alert("Please enter at least one of Father’s Name, Spouse Name, or Mother’s Name.");
      return;
    }

    // ✅ Validation: Mobile must be exactly 10 digits
    if (formData.mobileNumber.length !== 10) {
      alert("Mobile number must be exactly 10 digits.");
      return;
    }

    // ✅ Validation: PIN code must be exactly 6 digits
    if (formData.pinCode.length !== 6) {
      alert("PIN code must be exactly 6 digits.");
      return;
    }

    console.log('Form Data:', formData);
    alert('Form submitted successfully!');
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
      <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#444' }}>
        Only A-Z, a-z, 0-9, Comma (,), Hyphen (-) and Slash (/) are allowed. No
        other special character is allowed in any entry field.
      </p>
      <p
        style={{
          textAlign: 'center',
          color: '#1a73e8',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        Request For New Connection
      </p>

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
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="example@gmail.com"
            pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
            title="Email must end with @gmail.com"
          />
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
      </div>
    </form>
  );
}

export default KYCForm;
