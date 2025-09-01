const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Both admins and users are stored here

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    // Find user in DB (could be admin or normal user)
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // ✅ Return role from DB instead of hardcoding
    return res.json({
      success: true,
      message: "Login successful",
      role: user.role, // should be 'admin' or 'user' in DB
      email: user.email,
      phone: user.phone
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: "Server error occurred" });
  }
});

module.exports = router;