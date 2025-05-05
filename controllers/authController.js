const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../model/user");
const logger = require("../utils/logger");

const generateOTP = () => {
  // Generate a random 4-digit code as string
  return Math.floor(1000 + Math.random() * 9000).toString();
};

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email, phoneNumber });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    const confirmPassword = req.body.confirmPassword;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    });

    await user.save();

    // Generate a 4-digit OTP and set expiry (15 minutes)
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    const userData = await user.save();

    // Send OTP to user's email
    await sendOTPEmail(user.email, otp);

    res.status(201).json({
      message:
        "User registered successfully. Please verify your email using the OTP sent.",
      userData,
    });
  } catch (error) {
    logger.error(`User registration error: ${error.message}`, {
      error,
    });
    res.status(500).json({ error: error.message });
  }
};
