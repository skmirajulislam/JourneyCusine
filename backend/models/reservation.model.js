const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    listingId: {
      type: String,
      ref: "House",
    },
    authorId: {
      type: String,
      ref: "userDB",
    },
    guestId: {
      type: String,
      ref: "userDB",
    },
    guestEmail: {
      type: String,
    },
    guestName: {
      type: String,
    },
    checkIn: {
      type: String,
    },
    checkOut: {
      type: String,
    },
    nightStaying: {
      type: Number,
      default: 1,
    },
    guestNumber: {
      type: Number,
      default: 1,
    },
    // Base standard USD values
    basePrice: {
      type: Number,
    },
    taxes: {
      type: Number,
    },
    totalPrice: {
      type: Number,
    },
    authorEarnedPrice: {
      type: Number,
    },
    // Multi-Currency Breakdown
    currency: {
      type: String,
      default: "INR",
    },
    guestCurrency: {
      type: String,
      default: "INR",
    },
    guestTotalPaid: {
      type: Number,
    },
    guestBasePrice: {
      type: Number,
    },
    guestTaxes: {
      type: Number,
    },
    hostCurrency: {
      type: String,
      default: "INR",
    },
    hostEarnings: {
      type: Number,
    },
    exchangeRate: {
      type: Number,
      default: 1.0,
    },
    couponCode: {
      type: String,
      default: null,
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
    originalTotalPrice: {
      type: Number,
    },
    orderId: {
      type: Number,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    paymentIntentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed", "refunded", "partially_refunded"],
      default: "paid",
    },
    status: {
      type: String,
      enum: ["confirmed", "cancellation_requested", "cancelled", "refunded"],
      default: "confirmed",
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    cancellationRequestedAt: {
      type: Date,
    },
    refundDetails: {
      refundAmount: { type: Number, default: 0 },
      taxDeduction: { type: Number, default: 0 },
      refundCurrency: { type: String, default: "INR" },
      refundedAt: { type: Date },
      razorpayRefundId: { type: String },
      stripeRefundId: { type: String },
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const reservationDB = mongoose.model("reservationDB", reservationSchema);

module.exports = reservationDB;