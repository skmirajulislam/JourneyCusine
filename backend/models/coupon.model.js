const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      default: null, // null means applies to all listings by this host
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountRate: {
      type: Number,
      required: true,
      min: [1, "Discount rate must be at least 1"],
    },
    maxUsage: {
      type: Number,
      required: true,
      default: 10,
      min: [1, "Max usage must be at least 1"],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedBy: [
      {
        guestId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        orderId: {
          type: String,
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        discountApplied: {
          type: Number,
        },
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// MongoDB TTL Index: automatically purge document from DB when expiresAt is reached
couponSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
