const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();
const loanController = require("../controllers/loanApplicationController");

router.post("/applyForLoan", authMiddleware, loanController.createLoanApplication);
router.post("/loans", authMiddleware, loanController.getUserLoans);

module.exports = router;
