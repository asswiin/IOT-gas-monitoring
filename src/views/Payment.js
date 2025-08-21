import React, { useState } from "react";
// import { useNavigate } from 'react-router-dom';
import "../styles/Payment.css"; // ✅ Import CSS file

export default function PaymentPage() {
  const [formData, setFormData] = useState({
    connectionId: "",
    address: "",
    dateOfConnection: "",
    paymentMethod: "Credit Card",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentMethod = (method) => {
    setFormData({ ...formData, paymentMethod: method });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `Payment initiated!\nConnection ID: ${formData.connectionId}\nPayment Method: ${formData.paymentMethod}`
    );
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2 className="payment-title">Payment</h2>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>Connection ID</label>
            <input
              type="text"
              name="connectionId"
              value={formData.connectionId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date of Connection</label>
            <input
              type="date"
              name="dateOfConnection"
              value={formData.dateOfConnection}
              onChange={handleChange}
              required
            />
          </div>

          <div className="amount-due">
            <h3>Amount Due</h3>
          </div>

          <div className="payment-method">
            <h3>Payment Method</h3>
            <div className="method-buttons">
              {["Credit Card", "Debit Card", "Net Banking", "UPI"].map(
                (method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handlePaymentMethod(method)}
                    className={
                      formData.paymentMethod === method ? "active" : ""
                    }
                  >
                    {method}
                  </button>
                )
              )}
            </div>
          </div>

          <button type="submit" className="pay-btn">
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
}
