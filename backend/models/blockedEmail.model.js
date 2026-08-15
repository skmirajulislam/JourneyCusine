const mongoose = require("mongoose");

const blockedEmailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    reason: {
      type: String,
      default: "Violation of Community Guidelines: Repeated offensive language in AI Concierge",
    },
    blockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const BlockedEmail = mongoose.model("BlockedEmail", blockedEmailSchema, "blocked_emails");

module.exports = BlockedEmail;
