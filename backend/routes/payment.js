// routes/payment.js
const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");

// POST new Payment
router.post("/", async (req, res) => {
  try {
    console.log("Payment submission received:", req.body);
    
    // Ensure payment type is set correctly
    const paymentData = {
      ...req.body,
      paymentType: req.body.paymentType || 'initial_connection' // Default fallback
    };
    
    const newPayment = new Payment(paymentData);
    const savedPayment = await newPayment.save();
    
    console.log(`✅ Payment saved successfully:`, {
      id: savedPayment._id,
      email: savedPayment.email,
      amount: savedPayment.amountDue,
      type: savedPayment.paymentType
    });
    
    res.status(201).json({ 
      message: "Payment saved successfully!", 
      payment: savedPayment 
    });
  } catch (err) {
    console.error("❌ Payment save error:", err);
    res.status(500).json({ 
      message: "Error saving payment", 
      error: err.message 
    });
  }
});

// GET all Payments (For Admin)
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find({}).sort({ createdAt: -1 });
    
    console.log(`📊 Fetched ${payments.length} total payments for admin dashboard`);
    console.log(`   - Initial payments: ${payments.filter(p => p.paymentType === 'initial_connection' || !p.paymentType).length}`);
    console.log(`   - Refill payments: ${payments.filter(p => p.paymentType === 'gas_refill').length}`);
    
    res.json(payments);
  } catch (err) {
    console.error("❌ Error fetching payments:", err);
    res.status(500).json({ 
      message: "Server error while fetching payments", 
      error: err.message 
    });
  }
});

// ✅ NEW ROUTE: GET all payments for a specific user
router.get("/user/:email", async (req, res) => {
  try {
    const userEmail = req.params.email.toLowerCase();
    const userPayments = await Payment.find({ email: userEmail }).sort({ createdAt: -1 });
    
    console.log(`📊 Fetched ${userPayments.length} payments for user: ${userEmail}`);
    
    res.json(userPayments);
  } catch (err) {
    console.error("❌ Error fetching user payments:", err);
    res.status(500).json({ 
      message: "Server error while fetching user payments", 
      error: err.message 
    });
  }
});

// DELETE Payment records by KYC ID
router.delete("/kyc/:kycId", async (req, res) => {
  try {
    const kycId = req.params.kycId;
    const result = await Payment.deleteMany({ kycId: kycId }); // Delete all payments associated with this KYC ID

    if (result.deletedCount === 0) {
      return res.status(444).json({ message: "No payment records found for this KYC ID." });
    }
    res.json({ message: `Successfully deleted ${result.deletedCount} payment records for KYC ID: ${kycId}` });
  } catch (err) {
    console.error("❌ Error deleting payment records:", err);
    res.status(500).json({ message: "Server error while deleting payment records." });
  }
});

module.exports = router;