// // --- START OF FILE EditProfile.js ---

// import React, { useState, useEffect } from 'react';
// import '../styles/Newconnection.css';
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import '../styles/editProfile.css';

// function EditProfile() {
//   const [formData, setFormData] = useState({});
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errors, setErrors] = useState({});
//   const navigate = useNavigate();
//   const salutations = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.']; // Added for the select dropdown

//   // 1. Fetch current user data when the component loads
//   useEffect(() => {
//     const userEmail = localStorage.getItem("userEmail");
//     let userPhone = localStorage.getItem("userPhone"); // Get phone as well

//     if (userPhone && userPhone.startsWith("+91")) {
//       userPhone = userPhone.substring(3);
//     }

//     if (userEmail) {
//       axios.get(`http://localhost:5000/api/newconnection/${userEmail}`)
//         .then(res => {
//           const fetchedData = res.data;
//           // Clean mobile number from fetched data too if it has +91 for the form
//           if (fetchedData.mobileNumber && fetchedData.mobileNumber.startsWith("+91")) {
//             fetchedData.mobileNumber = fetchedData.mobileNumber.substring(3);
//           }
//           // Format the date before setting it in the form
//           const formattedData = {
//             ...fetchedData,
//             dob: fetchedData.dob ? new Date(fetchedData.dob).toISOString().split('T')[0] : ''
//           };
//           setFormData(formattedData); // Pre-fill the form with existing data
//         })
//         .catch(err => {
//           console.error("Failed to fetch user data:", err);
//           setErrors({ api: "Could not load your profile data." });
//         });
//     } else {
//       navigate("/login"); // Redirect if user is not logged in
//     }
//   }, [navigate]);

//   // Handler for form input changes
//   const handleChange = (e) => {
//     let { name, value } = e.target;

//     if (name === "pinCode") {
//       value = value.replace(/\D/g, "");
//       if (value.length > 6) return;
//     }
//     if (name === "mobileNumber") {
//       value = value.replace(/\D/g, "");
//       if (value.length > 10) return;
//     }
//     if (name === "telephoneNumber") {
//       value = value.replace(/\D/g, "");
//       if (value.length > 11) return;
//     }
//     if (name === "email") {
//       value = value.toLowerCase();
//     }

//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // 2. Handler for form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newErrors = {};

//     // --- Validation Logic (can be the same as NewConnection, adapted for edit) ---
//     if (!formData.fatherName?.trim() && !formData.spouseName?.trim() && !formData.motherName?.trim()) {
//       newErrors.relative = "Fill the necessary field .";
//     }
//     if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
//       newErrors.mobileNumber = "Invalid Number.";
//     }
//     if (!/^\d{6}$/.test(formData.pinCode)) {
//       newErrors.pinCode = "Invalid pincode.";
//     }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = "Invalid Email.";
//     }
//     if (formData.dob) {
//       const today = new Date();
//       const birthDate = new Date(formData.dob);
//       let age = today.getFullYear() - birthDate.getFullYear();
//       const monthDiff = today.getMonth() - birthDate.getMonth();
//       if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//         age--;
//       }
//       if (age < 18) {
//         newErrors.dob = "You must be at least 18 years old to apply.";
//       }
//     } else {
//       newErrors.dob = "Date of Birth is required.";
//     }

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       setSuccessMessage("");
//       return;
//     }

//     setErrors({}); // Clear previous errors

//     const userEmail = localStorage.getItem("userEmail");
//     if (!userEmail) return;

//     const dataToSend = {
//         ...formData,
//         mobileNumber: "+91" + formData.mobileNumber // Re-add +91 for backend
//     };

//     try {
//       // ✅ CHANGE THIS LINE TO USE THE NEW PROFILE UPDATE ENDPOINT
//       await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/profile`, dataToSend);
//       setSuccessMessage("Profile updated successfully!");
//       setErrors({});

//       setTimeout(() => {
//         navigate("/profile"); // Go back to profile page after update
//       }, 2000);

//     } catch (err) {
//       console.error("Update Error:", err);
//       setSuccessMessage("");
//       setErrors({ api: err.response?.data?.message || "Failed to update profile. Please try again." });
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="kyc-form">
//       <h2>Edit Your Profile</h2>
//       <p className="subtitle">*Mandatory Fields</p>

//       {/* Personal Details */}
//       <fieldset>
//         <legend>1) Personal Details</legend>
//         <div className="form-group">
//           <label>Salutation*</label>
//           {/* ✅ ADD SELECT FOR SALUTATION */}
//           <select name="salutation" value={formData.salutation || ''} onChange={handleChange} required>
//             <option value="">--Select--</option>
//             {salutations.map((s) => (<option key={s} value={s}>{s}</option>))}
//           </select>
//         </div>
//         <div className="grid-3">
//           <div className="form-group"><label>First Name*</label><input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} required /></div>
//           <div className="form-group"><label>Middle Name</label><input type="text" name="middleName" value={formData.middleName || ''} onChange={handleChange} /></div>
//           <div className="form-group"><label>Last Name*</label><input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} required /></div>
//         </div>
//         <div className="form-group">
//           <label>Date of Birth*</label>
//           <input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} required />
//           {errors.dob && <p className="error">{errors.dob}</p>}
//         </div>
//         <fieldset>
//           <legend>Close Relative</legend>
//           <div className="grid-2">
//             <div className="form-group"><label>Father's Name</label><input type="text" name="fatherName" value={formData.fatherName || ''} onChange={handleChange} /></div>
//             <div className="form-group"><label>Spouse Name</label><input type="text" name="spouseName" value={formData.spouseName || ''} onChange={handleChange} /></div>
//           </div>
//           <div className="form-group"><label>Mother's Name</label><input type="text" name="motherName" value={formData.motherName || ''} onChange={handleChange} /></div>
//           {errors.relative && <p className="error">{errors.relative}</p>}
//         </fieldset>
//       </fieldset>

//       {/* Address Section */}
//       <fieldset>
//         <legend>2) Address / Contact Information</legend>
//         <div className="grid-2">
//           <div className="form-group"><label>House / Flat #, Name*</label><input type="text" name="houseName" value={formData.houseName || ''} onChange={handleChange} required /></div>
//           <div className="form-group"><label>Floor No</label><input type="text" name="floorNo" value={formData.floorNo || ''} onChange={handleChange} /></div>
//         </div>
//         <div className="form-group"><label>Housing Complex / Building</label><input type="text" name="housingComplex" value={formData.housingComplex || ''} onChange={handleChange} /></div>
//         <div className="grid-2">
//           <div className="form-group"><label>Street / Road Name*</label><input type="text" name="streetName" value={formData.streetName || ''} onChange={handleChange} required /></div>
//           <div className="form-group"><label>Landmark*</label><input type="text" name="landmark" value={formData.landmark || ''} onChange={handleChange} required /></div>
//         </div>
//         <div className="grid-2">
//           <div className="form-group"><label>City*</label><input type="text" name="city" value={formData.city || ''} onChange={handleChange} required /></div>
//           <div className="form-group"><label>District*</label><input type="text" name="district" value={formData.district || ''} onChange={handleChange} required /></div>
//         </div>
//         <div className="grid-2">
//           <div className="form-group"><label>State*</label><input type="text" name="state" value={formData.state || ''} onChange={handleChange} required /></div>
//           <div className="form-group">
//             <label>Pin Code*</label>
//             <input type="text" name="pinCode" value={formData.pinCode || ''} onChange={handleChange} required />
//             {errors.pinCode && <p className="error">{errors.pinCode}</p>}
//           </div>
//         </div>
//         <div className="grid-2">
//           <div className="form-group">
//             <label>Mobile Number*</label>
//             <input type="tel" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} required readOnly /> {/* Make mobile and email readOnly for security/consistency */}
//             {errors.mobileNumber && <p className="error">{errors.mobileNumber}</p>}
//           </div>
//            <div className="form-group">
//             <label>Email*</label>
//             <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required readOnly />
//             {errors.email && <p className="error">{errors.email}</p>}
//           </div>
//         </div>

//       </fieldset>


//       <div className="submit-container">
//         <button type="submit">Update Profile</button>
//         <div className="submit-feedback">
//             {successMessage && <div className="success-box">{successMessage}</div>}
//             {errors.api && <p className="error api-error">{errors.api}</p>}
//         </div>
//       </div>
//     </form>
//   );
// }

// export default EditProfile;























import React, { useState, useEffect } from 'react';
import '../styles/Newconnection.css'; // Reusing the same styles
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/editProfile.css'; // Specific styles for this component

// Data for the dependent dropdown, same as in NewConnection.js
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

function EditProfile() {
  const [formData, setFormData] = useState({});
  const [towns, setTowns] = useState([]); // State for the towns dropdown
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const salutations = ['Mr.', 'Mrs.'];
  const keralaDistricts = Object.keys(districtTowns);

  // 1. Fetch current user data when the component loads
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      navigate("/login");
      return;
    }

    axios.get(`http://localhost:5000/api/newconnection/${userEmail}`)
      .then(res => {
        const fetchedData = res.data;
        
        // Pre-populate towns if a district is already present
        if (fetchedData.district) {
          setTowns(districtTowns[fetchedData.district] || []);
        }

        // Clean mobile number for the form
        if (fetchedData.mobileNumber && fetchedData.mobileNumber.startsWith("+91")) {
          fetchedData.mobileNumber = fetchedData.mobileNumber.substring(3);
        }

        // Format the date for the input field
        const formattedData = {
          ...fetchedData,
          dob: fetchedData.dob ? new Date(fetchedData.dob).toISOString().split('T')[0] : ''
        };
        setFormData(formattedData);
      })
      .catch(err => {
        console.error("Failed to fetch user data:", err);
        setErrors({ api: "Could not load your profile data." });
      });
  }, [navigate]);

  // Handler for form input changes
  const handleChange = (e) => {
    let { name, value } = e.target;

    // --- NEW: Handle district change to update towns dropdown ---
    if (name === "district") {
      setTowns(districtTowns[value] || []);
      // Reset town selection when district changes
      setFormData((prev) => ({ ...prev, town: '', [name]: value }));
      return;
    }

    if (name === "pinCode" || name === "mobileNumber" || name === "telephoneNumber") {
      value = value.replace(/\D/g, "");
      if ((name === "pinCode" && value.length > 6) || (name === "mobileNumber" && value.length > 10) || (name === "telephoneNumber" && value.length > 11)) {
        return;
      }
    }

    if (name === "email") {
      value = value.toLowerCase();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Basic validation
    if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = "Invalid pincode.";
    }
    if (formData.dob) {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      if (today.getFullYear() - birthDate.getFullYear() < 18) {
        newErrors.dob = "You must be at least 18 years old.";
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

    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    // Prepare data for submission, ensuring +91 is added back
    const dataToSend = {
      ...formData,
      mobileNumber: "+91" + formData.mobileNumber
    };

    try {
      await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/profile`, dataToSend);
      setSuccessMessage("Profile updated successfully!");
      setErrors({});

      setTimeout(() => {
        navigate("/profile"); // Redirect back to profile view
      }, 2000);

    } catch (err) {
      console.error("Update Error:", err);
      setSuccessMessage("");
      setErrors({ api: err.response?.data?.message || "Failed to update profile. Please try again." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="kyc-form">
      <div className="edit-profile-header">
        <button 
          type="button" 
          onClick={() => navigate('/profile')} 
          className="back-to-profile-btn"
        >
          &larr; Back to Profile
        </button>
        <h2>Edit Your Profile</h2>
      </div>
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
            {/* Conditionally render the Town dropdown */}
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
        <div className="grid-2">
          <div className="form-group">
            <label>State*</label>
            <input type="text" name="state" value={formData.state || 'Kerala'} required readOnly />
          </div>
          <div className="form-group">
            <label>Pin Code*</label>
            <input type="text" name="pinCode" value={formData.pinCode || ''} onChange={handleChange} required />
            {errors.pinCode && <p className="error">{errors.pinCode}</p>}
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label>Mobile Number*</label>
            <input type="tel" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} required readOnly />
          </div>
           <div className="form-group">
            <label>Email*</label>
            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required readOnly />
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