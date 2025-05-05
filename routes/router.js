const express = require("express");
const router = express.Router();

// User Auth Routes
router.use("/user", require("./authRoutes"))

module.exports = router;