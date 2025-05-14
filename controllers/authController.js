const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../model/user");
const logger = require("../utils/logger");
const nodemailer = require("nodemailer");
const config = require("../config/config");

const generateOTP = () => {
  // Generate a random 4-digit code as string
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendOTPEmail = async (toEmail, otp) => {
  // Create a transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: toEmail,
    subject: "Your OTP Code for Email Verification",
    text: `Your OTP code is ${otp}. It will expire in 15 minutes.`,
  };

  await transporter.sendMail(mailOptions);
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
    logger.error(`User registration error: ${error?.message}`, {
      error,
    });
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;
    const login = email || phoneNumber;
    const user = await User.findOne({
      $or: [{ email: login }, { phoneNumber: login }],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(404).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: "1h",
    });
    res.json({
      message: "User login successfully",
      token: token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.log(error);
    logger.error(`User login error: ${error.message}`, {
      error,
    });
    res.status(500).json({ error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Update user's verification status and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    logger.error(`OTP verification error: ${error.message}`, {
      error,
    });
    console.error("OTP verification error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // Ensure the new passwords match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // Assuming req.user contains the authenticated user
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the old password with the stored password hash
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Update user's password; the pre('save') hook will hash the new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    logger.error(`Change password endpoint failed: ${error.message}`, {
      error,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate that email is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the user is already verified, there's no need to resend OTP
    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Generate a new 4-digit OTP and set expiry (15 minutes from now)
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Save the updated user data
    await user.save();

    // Send the OTP to the user's email
    await sendOTPEmail(user.email, otp);

    res.status(200).json({ message: "OTP has been resent" });
  } catch (error) {
    logger.error(`Error resending OTP: ${error.message}`, { error });
    res.status(500).json({ message: error.message });
  }
};
