const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/register", authController.registerUser);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOTP);
router.post("/change-password", authMiddleware, authController.changePassword);
router.post("/resend-otp", authController.resendOTP);
router.get("/profile", authMiddleware, userController.getProfile);

module.exports = router;
