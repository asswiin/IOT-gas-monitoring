

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Both admins and users are stored here
const KYC = require('../models/Newconnection'); // ✅ Import the KYC model

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    // Find user in DB
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // ✅ Find the user's KYC status in a single step
    let kycStatus = null;
    if (user.role === 'user') {
        const kycUser = await KYC.findOne({ email: user.email }).select('status'); // More efficient
        if (kycUser) {
            kycStatus = kycUser.status;
        }
    }

    // ✅ Return role and the fetched KYC status in the response
    return res.json({
      success: true,
      message: "Login successful",
      role: user.role,
      email: user.email,
      phone: user.phone,
      kycStatus: kycStatus // Include the status here
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: "Server error occurred" });
  }
});

module.exports = router;