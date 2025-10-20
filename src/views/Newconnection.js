

import React, { useState, useEffect } from 'react';
import '../styles/Newconnection.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { endpoints, getEndpoint } from '../config';

// Data for the dependent dropdown
const districtTowns = {
  'Thiruvananthapuram': ['Thiruvananthapuram (Municipal Corporation)', 'Neyyattinkara', 'Attingal', 'Varkala', 'Nedumangad'],
  'Kollam': ['Kollam (Municipal Corporation)', 'Paravur', 'Punalur', 'Karunagappally'],
  'Pathanamthitta': ['Pathanamthitta', 'Adoor', 'Thiruvalla', 'Pandalam', 'Ranni'],
  'Alappuzha': ['Alappuzha', 'Chengannur', 'Cherthala', 'Kayamkulam', 'Haripad'],
  'Kottayam': ['Kottayam', 'Changanassery', 'Pala', 'Ettumanoor', 'Kanjirappally'],
  'Idukki': ['Thodupuzha'],
  'Ernakulam': ['Kochi (Municipal Corporation)', 'Aluva', 'Perumbavoor', 'Muvattupuzha', 'Kothamangalam', 'North Paravur', 'Tripunithura', 'Kalamassery', 'Maradu'],
  'Thrissur': ['Thrissur (Municipal Corporation)', 'Guruvayur', 'Irinjalakuda', 'Kunnamkulam', 'Chavakkad', 'Kodungallur', 'Chalakudy'],
  'Palakkad': ['Palakkad', 'Ottappalam', 'Chittur–Thathamangalam', 'Pattambi', 'Shoranur', 'Mannarkkad'],
  'Malappuram': ['Malappuram', 'Manjeri', 'Perinthalmanna', 'Tirur', 'Ponnani', 'Nilambur', 'Kottakkal', 'Parappanangadi', 'Kondotty', 'Tanur', 'Edappal', 'Valanchery'],
  'Kozhikode': ['Kozhikode (Municipal Corporation)', 'Vadakara', 'Koyilandy', 'Ramanattukara', 'Feroke'],
  'Wayanad': ['Kalpetta', 'Mananthavady', 'Sulthan Bathery'],
  'Kannur': ['Kannur (Municipal Corporation)', 'Thalassery', 'Payyannur', 'Taliparamba', 'Mattannur', 'Kuthuparamba', 'Anthoor', 'Iritty'],
  'Kasaragod': ['Kasaragod', 'Kanhangad', 'Nileshwaram']
};

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
    state: 'Kerala', // <--- MODIFIED: Set default state
    district: '',
    town: '',
    pinCode: '',
    mobileNumber: '',
    telephoneNumber: '',
    email: '',
    status: 'pending_approval',
  });

  const [towns, setTowns] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isExistingUser, setIsExistingUser] = useState(false);
  const salutations = ['Mr.', 'Mrs.'];
  const keralaDistricts = Object.keys(districtTowns);
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    let userPhone = localStorage.getItem("userPhone");
    const kycData = localStorage.getItem("kycFormData");

    if (userPhone && userPhone.startsWith("+91")) {
      userPhone = userPhone.substring(3);
    }

    if (kycData) {
      const parsedData = JSON.parse(kycData);
      if (parsedData.status === 'approved') {
        navigate('/payment');
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      email: prev.email || userEmail || "",
      mobileNumber: prev.mobileNumber || userPhone || ""
    }));

    if (userEmail) {
      axios.get(getEndpoint.newConnection(userEmail))
        .then(res => {
          if (res.data) {
            const fetchedData = { ...res.data };
            if (fetchedData.mobileNumber && fetchedData.mobileNumber.startsWith("+91")) {
              fetchedData.mobileNumber = fetchedData.mobileNumber.substring(3);
            }
            setFormData(prev => ({ ...prev, ...fetchedData }));
            setIsExistingUser(true);

            if (fetchedData.district) {
              setTowns(districtTowns[fetchedData.district] || []);
            }

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
          if (localStorage.getItem("userEmail") && userPhone) {
            setFormData(prev => ({ ...prev, email: localStorage.getItem("userEmail"), mobileNumber: userPhone, status: 'pending_approval' }));
          }
        });
    }
  }, [navigate]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "district") {
      setTowns(districtTowns[value] || []);
      setFormData((prev) => ({ ...prev, town: '', [name]: value }));
      return;
    }

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

  // NEW: Calculate date restrictions
  const getMaxAllowedDate = () => {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return eighteenYearsAgo.toISOString().split('T')[0];
  };

  // Set minimum date to 1950 and maximum date to 18 years ago from today
  const minDate = '1950-01-01';
  const maxDate = getMaxAllowedDate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

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
    // MODIFIED: Enhanced age validation
    if (formData.dob) {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.dob = "You must be at least 18 years old to apply for a new connection.";
      }
      
      if (birthDate > today) {
        newErrors.dob = "Date of birth cannot be in the future.";
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

    const dataToSend = {
      ...formData,
      mobileNumber: "+91" + formData.mobileNumber,
      status: 'pending_approval'
    };

    try {
      if (isExistingUser) {
        const res = await axios.put(getEndpoint.newConnection(formData.email), dataToSend);
        setSuccessMessage("Form updated successfully! Your request is awaiting admin approval.");
        localStorage.setItem("kycFormData", JSON.stringify(res.data.kycData));
      } else {
        const res = await axios.post(endpoints.newConnection, dataToSend);
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
          <input 
            type="date" 
            name="dob" 
            value={formData.dob || ''} 
            onChange={handleChange} 
            required 
            min={minDate}
            max={maxDate}
            title="You must be at least 18 years old to apply"
          />
          {errors.dob && <p className="error">{errors.dob}</p>}
          <small className="date-help-text">
            You must be at least 18 years old to apply for a new connection.
          </small>
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
          <div className="form-group">
            <label>District*</label>
            <select name="district" value={formData.district || ''} onChange={handleChange} required>
              <option value="">--Select District--</option>
              {keralaDistricts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
          {formData.district && (
            <div className="form-group">
              <label>Town*</label>
              <select name="town" value={formData.town || ''} onChange={handleChange} required>
                <option value="">--Select Town--</option>
                {towns.map((town) => (
                  <option key={town} value={town}>{town}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="grid-2">
          <div className="form-group"><label>House / Flat #, Name*</label><input type="text" name="houseName" value={formData.houseName || ''} onChange={handleChange} required /></div>
          <div className="form-group"><label>Floor No</label><input type="text" name="floorNo" value={formData.floorNo || ''} onChange={handleChange} /></div>
        </div>
        <div className="form-group"><label>Housing Complex / Building</label><input type="text" name="housingComplex" value={formData.housingComplex || ''} onChange={handleChange} /></div>
        <div className="grid-2">
          <div className="form-group"><label>Street / Road Name*</label><input type="text" name="streetName" value={formData.streetName || ''} onChange={handleChange} required /></div>
          <div className="form-group"><label>Landmark*</label><input type="text" name="landmark" value={formData.landmark || ''} onChange={handleChange} required /></div>
        </div>
        <div className="form-group">
          <label>State*</label>
          <input type="text" name="state" value={formData.state || ''} onChange={handleChange} required readOnly />
        </div>
        <div className="form-group">
          <label>Pin Code*</label>
          <input type="text" name="pinCode" value={formData.pinCode || ''} onChange={handleChange} required />
          {errors.pinCode && <p className="error">{errors.pinCode}</p>}
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