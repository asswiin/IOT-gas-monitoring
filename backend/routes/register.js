// const express = require("express");
// const bcrypt = require("bcrypt");
// const User = require("../models/User");

// const router = express.Router();

// // POST /api/register
// router.post("/", async (req, res) => {
//   try {
//     const { fullName, phone, email, password, confirmPassword } = req.body;

//     // 1️⃣ Basic validation
//     if (!fullName || !phone || !email || !password || !confirmPassword) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

// // 2️⃣ Clean phone number (keep only digits)
//      let formattedPhone = phone.trim();
//     if (!formattedPhone.startsWith("+91")) {
//       formattedPhone = "+91" + formattedPhone.replace(/\s/g, "");
//     }

//     // 3️⃣ Phone validation (must be +91 and then 10 digits starting 6-9)
//     const phonePattern = /^\+91[6-9][0-9]{9}$/;
//     if (!phonePattern.test(formattedPhone)) {
//       return res.status(400).json({ message: "Invalid phone number format" });
//     }

//     // 4️⃣ Email validation (must end with @gmail.com)
//     const emailPattern = /^[^\s@]+@gmail\.com$/;
//     if (!emailPattern.test(email)) {
//       return res.status(400).json({ message: "Email must be a valid @gmail.com address" });
//     }

//     // 5️⃣ Password match check
//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     // 6️⃣ Check if email already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already registered" });
//     }

//     // 7️⃣ Check if phone number already exists
//     const existingPhone = await User.findOne({ phone: formattedPhone });
//     if (existingPhone) {
//       return res.status(400).json({ message: "Phone number already registered" });
//     }

//     // 8️⃣ Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 9️⃣ Create new user
//     const newUser = new User({
//       fullName,
//       phone: formattedPhone, // store only digits in DB
//       email,
//       password: hashedPassword
//     });

//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     console.error("❌ Registration error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;



























const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// POST /api/register
router.post("/", async (req, res) => {
  try {
    const { fullName, phone, email, password, confirmPassword } = req.body;

    // 1️⃣ Basic validation
    if (!fullName || !phone || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Clean phone number (keep only digits)
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith("+91")) {
      formattedPhone = "+91" + formattedPhone.replace(/\s/g, "");
    }

    // 3️⃣ Phone validation (must be +91 and then 10 digits starting 6-9)
    const phonePattern = /^\+91[6-9][0-9]{9}$/;
    if (!phonePattern.test(formattedPhone)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    // 4️⃣ Email validation
    const emailPattern = /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|live\.com|icloud\.com|zoho\.com|protonmail\.com|gmx\.com|yandex\.com)$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: "Invalid email provider." });
    }

    // 5️⃣ Password match check
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 6️⃣ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 7️⃣ Check if phone number already exists
    const existingPhone = await User.findOne({ phone: formattedPhone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    // 8️⃣ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 9️⃣ Create new user
    const newUser = new User({
      fullName,
      phone: formattedPhone, // store only digits in DB
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;