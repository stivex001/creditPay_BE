const express = require("express");
const router = express.Router();
const authRoutes = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/register", authRoutes.registerUser);
router.post("/login", authRoutes.login);
router.post("/verify-otp", authRoutes.verifyOTP);
router.post("/change-password", authMiddleware, authRoutes.changePassword);
router.post("/resend-otp", authRoutes.resendOTP);

module.exports = router;
