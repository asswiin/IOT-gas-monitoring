import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Payment.css";
import { endpoints, getEndpoint } from '../config';

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

  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '' });
  const [userEmail, setUserEmail] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const isRefillPayment = location.state?.isRefill || false;

  const setKYCDataInForm = useCallback((kycData, today) => {
    const fullName = `${kycData.firstName || ''} ${kycData.lastName || ''}`.trim();
    const fullAddress = [kycData.houseName, kycData.streetName, kycData.town, kycData.district, kycData.state, kycData.pinCode].filter(Boolean).join(', ');
    setFormData({ kycId: kycData._id, customerName: fullName, email: kycData.email || '', mobileNumber: kycData.mobileNumber || '', address: fullAddress, dateOfPayment: today, amountDue: 900 });
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const storedUserEmail = localStorage.getItem("userEmail");

    if (!storedUserEmail) {
      navigate('/login');
      return;
    }
    setUserEmail(storedUserEmail);

    const initializePayment = async (emailToFetch) => {
      try {
        const response = await axios.get(getEndpoint.newConnection(emailToFetch));
        const kycData = response.data;

        if (!kycData) {
            alert("Your user profile data is missing. Please contact support.");
            navigate('/userdashboard');
            return;
        }
        
        if (isRefillPayment) {
          setFormData(prev => ({ ...prev, amountDue: 900, paymentType: 'gas_refill' }));
        } else {
          if (kycData.status !== 'approved') {
            if (kycData.status === 'active') {
                alert("Your connection is already active. You do not need to make an initial payment.");
            } else {
                alert("Your KYC is not approved for initial payment.");
            }
            navigate('/userdashboard');
            return;
          }
          setFormData(prev => ({ ...prev, amountDue: 900, paymentType: 'initial_connection' }));
        }

        localStorage.setItem("kycFormData", JSON.stringify(kycData));
        setKYCDataInForm(kycData, today);

      } catch (err) {
        console.error("Failed to fetch KYC data for payment:", err);
        alert("Failed to load your profile data for payment. Please try again later.");
        navigate('/userdashboard');
      }
    };
    
    initializePayment(storedUserEmail);

  }, [navigate, isRefillPayment, setKYCDataInForm]);

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    if (['cardNumber', 'cvv', 'expiryMonth', 'expiryYear'].includes(name)) {
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
    if (!/^\d{16}$/.test(cardNumber)) newErrors.cardNumber = "Card number must be 16 digits.";
    if (!/^(0[1-9]|1[0-2])$/.test(expiryMonth)) newErrors.expiryMonth = "Invalid month (MM).";
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    if (!/^\d{4}$/.test(expiryYear) || parseInt(expiryYear) < currentYear) {
      newErrors.expiryYear = "Invalid year (YYYY) or year in past.";
    } else if (parseInt(expiryYear) === currentYear && parseInt(expiryMonth) < currentMonth) {
      newErrors.expiryMonth = "Card has expired.";
    }
    if (!/^\d{3}$/.test(cvv)) newErrors.cvv = "CVV must be 3 digits.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentMethod) { setErrors({ form: "Please select a payment method." }); return; }
    if (!validateCardDetails()) return;
    setErrors({});
    setShowConfirmationPopup(true);
  };

  const handleConfirmPayment = async () => {
    setShowConfirmationPopup(false);
    try {
      if (!userEmail) throw new Error("User email not found in state.");
      
      const paymentDataToSubmit = { 
        ...formData, 
        paymentType: isRefillPayment ? 'gas_refill' : 'initial_connection' 
      };
      
      await axios.post(endpoints.payment, paymentDataToSubmit);

      if (isRefillPayment) {
        await axios.put(getEndpoint.refillGas(userEmail));
        setMessage(`✅ Refill payment successful! Amount Paid: ₹${formData.amountDue}. Your new gas cylinder will be activated once the current one is fully depleted.`);
      } else {
        await axios.put(getEndpoint.updateConnectionStatus(userEmail), { status: 'active' });
        setMessage(`✅ Initial payment successful! Amount Paid: ₹${formData.amountDue}. Your connection is now active.`);
        localStorage.removeItem("kycFormData");
      }
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Payment or status update failed:", error);
      setMessage("❌ Payment failed. Please try again. Details: " + (error.response ? error.response.data.message : error.message));
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessPopup(false);
    navigate("/userdashboard");
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        {/* Back button for refill payments */}
        {isRefillPayment && (
          <button 
            onClick={() => navigate('/userdashboard')} 
            className="back-to-dashboard-btn"
            type="button"
          >
            ← Back to Dashboard
          </button>
        )}
        
        {/* Payment Header */}
        <div className="payment-header">
          <h1 className="payment-title">
            {isRefillPayment ? "🔄 Gas Refill Payment" : "🆕 Initial Connection Payment"}
          </h1>
          <p className="payment-subtitle">Secure and encrypted payment processing</p>
        </div>
        
        <form onSubmit={handleSubmit} className="payment-form">
          {/* Customer Information Section */}
          <div className="form-section">
            <h3 className="section-title">👤 Customer Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Customer Name</label>
                <input type="text" value={formData.customerName} readOnly />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input type="text" value={formData.mobileNumber} readOnly />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={formData.email} readOnly />
              </div>
              <div className="form-group">
                <label>Payment Date</label>
                <input type="date" value={formData.dateOfPayment} readOnly />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Address</label>
              <textarea value={formData.address} readOnly />
            </div>
          </div>

          {/* Amount Due Section */}
          <div className="amount-section">
            <div className="amount-title">Amount Due</div>
            <div className="amount-value">₹{formData.amountDue}</div>
            <div className="amount-description">
              {isRefillPayment ? "Gas Refill Payment" : "Initial Connection Fee"}
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="form-section">
            <h3 className="section-title">💳 Payment Method</h3>
            <div className="method-buttons">
              <button 
                type="button" 
                onClick={() => setPaymentMethod('credit')} 
                className={`method-btn ${paymentMethod === 'credit' ? 'active' : ''}`}
              >
                <div className="method-icon">💳</div>
                <div className="method-label">Credit Card</div>
              </button>
              <button 
                type="button" 
                onClick={() => setPaymentMethod('debit')} 
                className={`method-btn ${paymentMethod === 'debit' ? 'active' : ''}`}
              >
                <div className="method-icon">💰</div>
                <div className="method-label">Debit Card</div>
              </button>
            </div>
          </div>

          {/* Card Details Section */}
          {paymentMethod && (
            <div className="form-section">
              <h3 className="section-title">🔒 Card Details</h3>
              <div className="card-details">
                <div className="form-group">
                  <label>Card Number</label>
                  <input 
                    type="text" 
                    name="cardNumber" 
                    placeholder="1234 5678 9012 3456" 
                    value={cardDetails.cardNumber} 
                    onChange={handleCardChange} 
                    required 
                  />
                  {errors.cardNumber && <div className="error">{errors.cardNumber}</div>}
                </div>
                <div className="card-row">
                  <div className="form-group">
                    <label>Expiry Month</label>
                    <input 
                      type="text" 
                      name="expiryMonth" 
                      placeholder="MM" 
                      value={cardDetails.expiryMonth} 
                      onChange={handleCardChange} 
                      required 
                    />
                    {errors.expiryMonth && <div className="error">{errors.expiryMonth}</div>}
                  </div>
                  <div className="form-group">
                    <label>Expiry Year</label>
                    <input 
                      type="text" 
                      name="expiryYear" 
                      placeholder="YYYY" 
                      value={cardDetails.expiryYear} 
                      onChange={handleCardChange} 
                      required 
                    />
                    {errors.expiryYear && <div className="error">{errors.expiryYear}</div>}
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input 
                      type="password" 
                      name="cvv" 
                      placeholder="123" 
                      value={cardDetails.cvv} 
                      onChange={handleCardChange} 
                      required 
                    />
                    {errors.cvv && <div className="error">{errors.cvv}</div>}
                  </div>
                </div>
                
                {/* Security Section */}
                <div className="security-section">
                  <div className="security-icon">🔒</div>
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Section */}
          <div className="submit-section">
            <button type="submit" className="pay-btn">
              🔒 Pay ₹{formData.amountDue} Securely
            </button>
            {errors.form && <div className="error payment-message">{errors.form}</div>}
            {message && (
              <div className={`payment-message ${message.includes("✅") ? "success" : "error"}`}>
                {message}
              </div>
            )}
            
            {/* Trust Indicators */}
            <div className="trust-indicators">
              <div className="trust-item">
                <span>🔒</span>
                <span>256-bit SSL Encryption</span>
              </div>
              <div className="trust-item">
                <span>🛡️</span>
                <span>PCI Compliant</span>
              </div>
              <div className="trust-item">
                <span>✅</span>
                <span>100% Secure</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Popup */}
      {showConfirmationPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>🔒 Confirm Payment</h3>
            <p>
              Are you sure you want to proceed with the {isRefillPayment ? "refill" : "initial"} payment of <strong>₹{formData.amountDue}</strong>?
            </p>
            <div className="popup-buttons">
              <button onClick={handleConfirmPayment} className="popup-yes">Yes, Pay Now</button>
              <button onClick={() => setShowConfirmationPopup(false)} className="popup-no">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>✅ Payment Successful!</h3>
            <p>Your payment has been processed successfully. You will be redirected to your dashboard shortly.</p>
            <div className="popup-buttons">
              <button onClick={handleSuccessOk} className="popup-ok">Continue to Dashboard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}