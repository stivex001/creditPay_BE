const loanApplication = require("../model/loanApplication");

exports.createLoanApplication = async (req, res) => {
  try {
    const userId = req.user._id;

    const loan = await loanApplication.create({
      user: userId,
      ...req.body,
    });

    res.status(201).json({ message: "Loan application submitted", loan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit loan application" });
  }
};


exports.getUserLoans = async (req, res) => {
  try {
    const userId = req.user._id;

    const loans = await loanApplication.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({ loans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch loans" });
  }
};

