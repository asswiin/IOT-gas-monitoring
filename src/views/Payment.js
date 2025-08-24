// src/views/PaymentPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Payment.css";

export default function PaymentPage() {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    mobileNumber: "",
    address: "",
    dateOfPayment: "",
    amountDue: 900, // example fixed
  });

  const [message, setMessage ] = useState("");
  const navigate = useNavigate();

  // Load data from KYC or Registration
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("kycFormData"));
    const email = localStorage.getItem("userEmail") || "";
    const phone = localStorage.getItem("userPhone") || "";
    const today = new Date().toISOString().split("T")[0];

    if (savedData) {
      const fullAddress = `${savedData.houseName || ""}, ${savedData.streetName || ""}, ${savedData.city || ""}, ${savedData.district || ""}, ${savedData.state || ""}, ${savedData.pinCode || ""}`;

      setFormData((prev) => ({
        ...prev,
        customerName: savedData.firstName + " " + (savedData.lastName || ""),
        email: email,
        mobileNumber: phone,
        address: fullAddress,
        dateOfPayment: today,
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

   try {
    const finalData = {
      customerName: formData.customerName,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      address: formData.address,
      dateOfPayment: formData.dateOfPayment,
      amountDue: formData.amountDue,
    };


      await axios.post("http://localhost:5000/api/payment", finalData);

      setMessage(`✅ Payment successful! Amount Paid: ₹${formData.amountDue}`);
      localStorage.removeItem("kycFormData");

     setTimeout(() => {
      navigate("/userdashboard");
    }, 2000);
    

    } catch (error) {
      console.error(error);
setMessage("❌ Payment failed ");   
 }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2 className="payment-title">Payment</h2>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>Customer Name</label>
            <input type="text" value={formData.customerName} readOnly />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.email} readOnly />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input type="text" value={formData.mobileNumber} readOnly />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea value={formData.address} readOnly />
          </div>

          <div className="form-group">
            <label>Date of Payment</label>
            <input type="date" value={formData.dateOfPayment} readOnly />
          </div>

          <div className="amount-due">
            <h3>Amount Due: ₹{formData.amountDue}</h3>
          </div>

         <div>
  <button type="submit" className="pay-btn">Pay Now</button>

  {message && (
    <p className={`payment-message ${message.includes("✅") ? "success" : "error"}`}>
      {message}
    </p>
  )}
</div>
        </form>
      </div>
    </div>
  );
}

