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
        <h2 className="payment-title">{isRefillPayment ? "Gas Refill Payment" : "Initial Connection Payment"}</h2>
        <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group"><label>Customer Name</label><input type="text" value={formData.customerName} readOnly /></div>
            <div className="form-group"><label>Email</label><input type="email" value={formData.email} readOnly /></div>
            <div className="form-group"><label>Mobile Number</label><input type="text" value={formData.mobileNumber} readOnly /></div>
            <div className="form-group"><label>Address</label><textarea value={formData.address} readOnly /></div>
            <div className="form-group"><label>Date of Payment</label><input type="date" value={formData.dateOfPayment} readOnly /></div>
            <div className="amount-due"><h3>Amount Due: ₹{formData.amountDue}</h3></div>
            
            {/* Enhanced Customer Information Display */}
            <div className="customer-info-section">
              <h4>📋 Customer Information Summary</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">👤 Name:</span>
                  <span className="info-value">{formData.customerName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">📞 Contact:</span>
                  <span className="info-value">{formData.mobileNumber}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">📧 Email:</span>
                  <span className="info-value">{formData.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">🏠 Address:</span>
                  <span className="info-value">{formData.address}</span>
                </div>
              </div>
            </div>

            <div className="payment-method">
                <h3>Select Payment Method</h3>
                <div className="method-buttons">
                    <button type="button" onClick={() => setPaymentMethod('credit')} className={paymentMethod === 'credit' ? 'active' : ''}>Credit Card</button>
                    <button type="button" onClick={() => setPaymentMethod('debit')} className={paymentMethod === 'debit' ? 'active' : ''}>Debit Card</button>
                </div>
            </div>
            {paymentMethod && (
            <div className="card-details-form">
                <h4>Enter Your Card Details</h4>
                <div className="form-group"><label>Card Number</label><input type="text" name="cardNumber" placeholder="xxxx xxxx xxxx xxxx" value={cardDetails.cardNumber} onChange={handleCardChange} required />{errors.cardNumber && <p className="error">{errors.cardNumber}</p>}</div>
                <div className="expiry-cvv-group">
                    <div className="form-group"><label>Expiry Month</label><input type="text" name="expiryMonth" placeholder="MM" value={cardDetails.expiryMonth} onChange={handleCardChange} required />{errors.expiryMonth && <p className="error">{errors.expiryMonth}</p>}</div>
                    <div className="form-group"><label>Expiry Year</label><input type="text" name="expiryYear" placeholder="YYYY" value={cardDetails.expiryYear} onChange={handleCardChange} required />{errors.expiryYear && <p className="error">{errors.expiryYear}</p>}</div>
                    <div className="form-group"><label>CVV</label><input type="password" name="cvv" placeholder="123" value={cardDetails.cvv} onChange={handleCardChange} required />{errors.cvv && <p className="error">{errors.cvv}</p>}</div>
                </div>
            </div>
            )}
            <div>
                <button type="submit" className="pay-btn">Pay Now</button>
                {errors.form && <p className="error payment-message">{errors.form}</p>}
                {message && (<p className={`payment-message ${message.includes("✅") ? "success" : "error"}`}>{message}</p>)}
            </div>
        </form>
      </div>

      {showConfirmationPopup && (<div className="popup-overlay"><div className="popup-content"><h3>Confirm {isRefillPayment ? "Refill" : "Initial"} Payment?</h3><div className="popup-buttons"><button onClick={handleConfirmPayment} className="popup-yes">Yes</button><button onClick={() => setShowConfirmationPopup(false)} className="popup-no">No</button></div></div></div>)}
      {showSuccessPopup && (<div className="popup-overlay"><div className="popup-content"><h3>Payment is Successful!</h3><div className="popup-buttons"><button onClick={handleSuccessOk} className="popup-ok">OK</button></div></div></div>)}
    </div>
  );
}