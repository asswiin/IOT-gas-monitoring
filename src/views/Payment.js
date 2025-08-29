
// src/views/PaymentPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Payment.css";

export default function PaymentPage() {
  const [formData, setFormData] = useState({
    kycId: null,
    customerName: "",
    email: "",
    mobileNumber: "",
    address: "",
    dateOfPayment: "",
    amountDue: 900,
  });

  const [paymentMethod, setPaymentMethod] = useState(''); // 'credit' or 'debit'
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // --- ✅ NEW STATE FOR POP-UP VISIBILITY ---
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("kycFormData"));
    const today = new Date().toISOString().split("T")[0];

    if (savedData) {
      const fullName = `${savedData.firstName || ''} ${savedData.lastName || ''}`.trim();
      const fullAddress = [
        savedData.houseName, savedData.streetName, savedData.city,
        savedData.district, savedData.state, savedData.pinCode,
      ].filter(Boolean).join(', ');

      setFormData({
        kycId: savedData._id,
        customerName: fullName,
        email: savedData.email || '',
        mobileNumber: savedData.mobileNumber || '',
        address: fullAddress,
        dateOfPayment: today,
        amountDue: 900,
      });
    }
  }, []);

  const handleCardChange = (e) => {
    let { name, value } = e.target;

    if (name === 'cardNumber' || name === 'cvv' || name === 'expiryMonth' || name === 'expiryYear') {
      value = value.replace(/\D/g, '');
    }

    if (name === 'cardNumber' && value.length > 16) value = value.slice(0, 16);
    if (name === 'expiryMonth' && value.length > 2) value = value.slice(0, 2);
    if (name === 'expiryYear' && value.length > 4) value = value.slice(0, 4);
    if (name === 'cvv' && value.length > 3) value = value.slice(0, 3);

    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const validateCardDetails = () => {
    const newErrors = {};
    const { cardNumber, expiryMonth, expiryYear, cvv } = cardDetails;

    if (!/^\d{16}$/.test(cardNumber)) {
      newErrors.cardNumber = "Card number must be 16 digits.";
    }
    if (!/^(0[1-9]|1[0-2])$/.test(expiryMonth)) {
      newErrors.expiryMonth = "Invalid month (MM).";
    }
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Month is 0-indexed
    
    if (!/^\d{4}$/.test(expiryYear) || parseInt(expiryYear) < currentYear) {
      newErrors.expiryYear = "Invalid year (YYYY).";
    } else if (parseInt(expiryYear) === currentYear && parseInt(expiryMonth) < currentMonth) {
        newErrors.expiryMonth = "Card has expired.";
    }

    if (!/^\d{3}$/.test(cvv)) {
      newErrors.cvv = "CVV must be 3 digits.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- ✅ MODIFIED SUBMIT HANDLER TO SHOW CONFIRMATION POPUP ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentMethod) {
      setErrors({ form: "Please select a payment method." });
      return;
    }
    
    if (!validateCardDetails()) {
      return;
    }
    
    setErrors({}); // Clear errors if validation passes
    setShowConfirmationPopup(true); // Show confirmation popup
  };

  // --- ✅ NEW FUNCTION TO HANDLE CONFIRMATION YES ---
  const handleConfirmPayment = async () => {
    setShowConfirmationPopup(false); // Close confirmation popup
    
    try {
      await axios.post("http://localhost:5000/api/payment", formData);
      
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        await axios.put(`http://localhost:5000/api/newconnection/${userEmail}/status`, { status: 'active' });
      }

      setMessage(`✅ Payment successful! Amount Paid: ₹${formData.amountDue}`);
      localStorage.removeItem("kycFormData");
      setShowSuccessPopup(true); // Show success popup

    } catch (error) {
      console.error(error);
      setMessage("❌ Payment failed. Please try again.");
    }
  };

  // --- ✅ NEW FUNCTION TO HANDLE SUCCESS OK ---
  const handleSuccessOk = () => {
    setShowSuccessPopup(false); // Close success popup
    navigate("/userdashboard"); // Navigate to dashboard
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2 className="payment-title">Payment</h2>
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group"><label>Customer Name</label><input type="text" value={formData.customerName} readOnly /></div>
          <div className="form-group"><label>Email</label><input type="email" value={formData.email} readOnly /></div>
          <div className="form-group"><label>Mobile Number</label><input type="text" value={formData.mobileNumber} readOnly /></div>
          <div className="form-group"><label>Address</label><textarea value={formData.address} readOnly /></div>
          <div className="form-group"><label>Date of Payment</label><input type="date" value={formData.dateOfPayment} readOnly /></div>
          
          <div className="amount-due"><h3>Amount Due: ₹{formData.amountDue}</h3></div>
          
          <div className="payment-method">
            <h3>Select Payment Method</h3>
            <div className="method-buttons">
              <button type="button" onClick={() => setPaymentMethod('credit')} className={paymentMethod === 'credit' ? 'active' : ''}>
                Credit Card
              </button>
              <button type="button" onClick={() => setPaymentMethod('debit')} className={paymentMethod === 'debit' ? 'active' : ''}>
                Debit Card
              </button>
            </div>
          </div>

          {paymentMethod && (
            <div className="card-details-form">
              <h4>Enter Your Card Details</h4>
              <div className="form-group">
                <label>Card Number</label>
                <input type="text" name="cardNumber" placeholder="xxxx xxxx xxxx xxxx" value={cardDetails.cardNumber} onChange={handleCardChange} required />
                {errors.cardNumber && <p className="error">{errors.cardNumber}</p>}
              </div>
              <div className="expiry-cvv-group">
                <div className="form-group">
                  <label>Expiry Month</label>
                  <input type="text" name="expiryMonth" placeholder="MM" value={cardDetails.expiryMonth} onChange={handleCardChange} required />
                  {errors.expiryMonth && <p className="error">{errors.expiryMonth}</p>}
                </div>
                <div className="form-group">
                  <label>Expiry Year</label>
                  <input type="text" name="expiryYear" placeholder="YYYY" value={cardDetails.expiryYear} onChange={handleCardChange} required />
                  {errors.expiryYear && <p className="error">{errors.expiryYear}</p>}
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input type="password" name="cvv" placeholder="123" value={cardDetails.cvv} onChange={handleCardChange} required />
                  {errors.cvv && <p className="error">{errors.cvv}</p>}
                </div>
              </div>
            </div>
          )}

          <div>
            <button type="submit" className="pay-btn">Pay Now</button>
            {errors.form && <p className="error payment-message">{errors.form}</p>}
            {message && (
              <p className={`payment-message ${message.includes("✅") ? "success" : "error"}`}>
                {message}
              </p>
            )}
          </div>
        </form>
      </div>

      {/* --- ✅ CONFIRMATION POPUP --- */}
      {showConfirmationPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Proceed to Payment?</h3>
            <div className="popup-buttons">
              <button onClick={handleConfirmPayment} className="popup-yes">Yes</button>
              <button onClick={() => setShowConfirmationPopup(false)} className="popup-no">No</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ✅ SUCCESS POPUP --- */}
      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Payment is Successful!</h3>
            <div className="popup-buttons">
              <button onClick={handleSuccessOk} className="popup-ok">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}