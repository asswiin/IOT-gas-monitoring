import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Register.css";

export default function Registration() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ✅ Global messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      let digits = value.replace(/\D/g, "");
      if (digits.startsWith("91")) digits = digits.slice(2);

      if (digits.length > 0 && !/^[6-9]/.test(digits)) {
        setPhoneError("start with 6,7,8, or 9.");
      } else if (digits.length > 10) {
        setPhoneError("Phone must be 10 digits.");
      } else {
        setPhoneError("");
      }

      setFormData({ ...formData, phone: digits });
      return;
    }

    if (name === "email") {
  const lowerCaseEmail = value.toLowerCase(); // force lowercase
  if (lowerCaseEmail && !/^[^\s@]+@gmail\.com$/.test(lowerCaseEmail)) {
    setEmailError("End with @gmail.com.");
  } else {
    setEmailError("");
  }
  setFormData({ ...formData, email: lowerCaseEmail });
  return;
}

    if (name === "password") {
      const pattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).{8,}$/;
      if (value && !pattern.test(value)) {
        setPasswordError(
          "Password must at least 8 chars including  uppercase, lowercase, special character."
        );
      } else {
        setPasswordError("");
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const validateField = (e) => {
    const { name, value } = e.target;

    if (name === "fullName") {
      if (!value.trim()) e.target.setCustomValidity("Full name is required.");
      else if (!/^[A-Za-z\s]+$/.test(value))
        e.target.setCustomValidity(
          "Full name can only contain letters and spaces."
        );
      else e.target.setCustomValidity("");
    }

    if (name === "phone") {
      const digits = value.replace(/\D/g, "").startsWith("91")
        ? value.replace(/\D/g, "").slice(2)
        : value.replace(/\D/g, "");

      if (!digits) {
      } else if (digits.length < 10) {
        setPhoneError("Phone number must be 10 digits.");
        e.target.setCustomValidity("Phone number must be 10 digits.");
      } else if (!/^[6-9]/.test(digits)) {
        setPhoneError("Phone number must start with 6,7,8, or 9.");
        e.target.setCustomValidity(
          "Phone number must start with 6,7,8, or 9."
        );
      } else {
        setPhoneError("");
        e.target.setCustomValidity("");
      }
    }

    if (name === "email") {
      if (!value) {
        setEmailError("Email is required.");
        e.target.setCustomValidity("Email is required.");
      } else if (!value.endsWith("@gmail.com")) {
        setEmailError("Email must end with @gmail.com");
        e.target.setCustomValidity("Email must end with @gmail.com");
      } else {
        setEmailError("");
        e.target.setCustomValidity("");
      }
    }

    if (name === "password") e.target.setCustomValidity(passwordError || "");

    if (name === "confirmPassword") {
      if (value !== formData.password)
        e.target.setCustomValidity("Passwords do not match.");
      else e.target.setCustomValidity("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const dataToSend = { ...formData, phone: "+91" + formData.phone };

      const res = await axios.post(
        "http://localhost:5000/api/register",
        dataToSend
      );

      // ✅ Show success below button
      setSuccessMessage(res.data.message || "Registration successful!");
      setTimeout(() => {
        navigate("/login");
      }, 1500); // small delay before redirect
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Error registering user. Please try again.");
      }
    }
  };

  return (
    <div className="register-container">
      <div className="left-panel">
        <img src="/register.png" alt="Register" className="panel-image" />
      </div>

      <div className="right-panel">
        <div className="form-box">
          <h2>Create your Account</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={validateField}
                placeholder=" "
                required
              />
              <label htmlFor="fullName">Full Name</label>
            </div>

            <div className="input-group">
              <input
                type="text"
                id="phone"
                name="phone"
                value={"+91 " + formData.phone}
                onChange={handleChange}
                onBlur={validateField}
                placeholder=" "
                maxLength="14"
                required
                onFocus={(e) => {
                  if (!formData.phone) e.target.setSelectionRange(4, 4);
                }}
              />
              <label htmlFor="phone">Phone Number</label>
              {phoneError && <span className="error-text">{phoneError}</span>}
            </div>

            <div className="input-group">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={validateField}
                placeholder=" "
                required
                style={{ textTransform: "lowercase" }}
              />
              <label htmlFor="email">Email</label>
              {emailError && <span className="error-text">{emailError}</span>}
            </div>

            <div className="input-group">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={validateField}
                placeholder=" "
                required
              />
              <label htmlFor="password">Password</label>
              {passwordError && (
                <span className="error-text">{passwordError}</span>
              )}
            </div>

            <div className="input-group">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={validateField}
                placeholder=" "
                required
              />
              <label htmlFor="confirmPassword">Confirm Password</label>
            </div>

            {/* ✅ Show global error/success above button */}
            {errorMessage && <p className="error-text">{errorMessage}</p>}
            {successMessage && <p className="success-text">{successMessage}</p>}

            <button type="submit">Register</button>
          </form>

          <p style={{ textAlign: "center" }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
