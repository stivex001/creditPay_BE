const mongoose = require("mongoose");

const loanApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    employementStatus: {
      type: String,
      enum: ["employed", "unemployed", "self-employed", "student"],
      required: true,
    },
    income: { type: Number, required: true },
    age: { type: Number, required: true },
    address: { type: String, required: true },
    bvn: { type: Number, required: true },
    accountNumber: { type: Number, required: true },
    bank: { type: String, required: true },
    amount: { type: Number, required: true },
    purpose: { type: String, required: true },
    period: { type: Number, required: true }, // e.g. 6 months
    interest: { type: String, required: true }, // or Number if you want to calculate
    installment: { type: Number, required: true },
    terms: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoanApplication", loanApplicationSchema);
