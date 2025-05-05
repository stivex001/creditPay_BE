const express = require("express");
const router = express.Router();
const authRoutes = require("../controllers/authController")

router.post("/register", authRoutes.registerUser);
// router.post("/login", userController.login);
// router.post("/verify-otp", userController.verifyOTP);


module.exports = router;