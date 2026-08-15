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
    orderId: {
      type: Number,
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
      refundedAt: { type: Date },
      stripeRefundId: { type: String },
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const reservationDB = mongoose.model("reservationDB", reservationSchema);

module.exports = reservationDB;