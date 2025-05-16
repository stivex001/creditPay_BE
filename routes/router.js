const express = require("express");
const router = express.Router();

// User Auth Routes
router.use("/user", require("./authRoutes"))
router.use("/user", require("./loanRoutes"))

module.exports = router;