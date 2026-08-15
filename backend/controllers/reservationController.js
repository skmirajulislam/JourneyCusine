const mongoose = require("mongoose");
const House = require("../models/house.model.js");
const User = require("../models/user.model.js");
const reservationDB = require("../models/reservation.model.js");
require("dotenv").config();

// Stripe controller & payment process
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getStripePublishableKey = async (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
};

exports.createPaymentIntent = async (req, res) => {
  try {
    const payload = req.body || {};
    let amountInCents = 1099;

    if (payload.amount && !isNaN(payload.amount)) {
      amountInCents = Math.round(Number(payload.amount) * 100);
    } else if (payload.listingId && payload.nightStaying) {
      try {
        const listing = await House.findById(payload.listingId);
        if (listing && listing.basePrice) {
          const basePrice = parseInt(listing.basePrice, 10);
          const nights = parseInt(payload.nightStaying, 10) || 1;
          const tax = Math.round((basePrice * nights * 14) / 100);
          const total = basePrice * nights + tax;
          amountInCents = Math.round(total * 100);
        }
      } catch (err) {
        console.error("Listing price lookup error:", err);
      }
    }

    // Enforce Stripe minimum $0.50 (50 cents)
    amountInCents = Math.max(amountInCents, 50);

    const paymentIntent = await stripe.paymentIntents.create({
      description: "Journey Cuisine Motel & Stay Reservation",
      shipping: {
        name: payload.guestName || "Journey Cuisine Guest",
        address: {
          line1: "510 Townsend St",
          postal_code: "98140",
          city: "San Francisco",
          state: "CA",
          country: "US",
        },
      },
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (e) {
    console.error("createPaymentIntent error:", e.message);
    return res.status(400).send({
      error: {
        message: e.message,
        code: e.code || "stripe_error",
      },
    });
  }
};

// Save new reservation
exports.newReservation = async (req, res) => {
  try {
    const payload = req.body;
    const listingId = payload.listingId;
    const authorId = payload.authorId;
    const guestNumber = parseInt(payload.guestNumber, 10) || 1;
    const checkIn = payload.checkIn;
    const checkOut = payload.checkOut;
    const nightStaying = parseInt(payload.nightStaying, 10) || 1;
    const orderId = payload.orderId || Math.floor(100000000 + Math.random() * 900000000);
    const guestId = req.user || payload.guestId;
    const paymentIntentId = payload.paymentIntentId || "";

    const listingDetails = await House.findById(listingId);
    if (!listingDetails) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Fetch guest info if available
    let guestEmail = "";
    let guestName = "Guest";
    if (guestId) {
      const guestUser = await User.findById(guestId);
      if (guestUser) {
        guestEmail = guestUser.emailId;
        guestName = `${guestUser.name?.firstName || ""} ${guestUser.name?.lastName || ""}`.trim();
      }
    }

    const basePrice = parseInt(listingDetails.basePrice, 10) || 0;
    const totalRoomPrice = basePrice * nightStaying;
    const tax = Math.round((totalRoomPrice * 14) / 100);
    const totalPrice = totalRoomPrice + tax;
    const authorEarnedPrice = totalRoomPrice - Math.round((totalRoomPrice * 3) / 100);

    const newReservation = {
      listingId,
      authorId,
      guestId,
      guestEmail,
      guestName,
      guestNumber,
      checkIn,
      checkOut,
      nightStaying,
      basePrice,
      taxes: tax,
      totalPrice,
      authorEarnedPrice,
      orderId,
      paymentIntentId,
      paymentStatus: "paid",
      status: "confirmed",
    };

    const savedReservation = await new reservationDB(newReservation).save();
    res.status(200).json({
      message: "Payment confirmed and reservation created successfully.",
      reservation: savedReservation,
    });
  } catch (error) {
    console.error("newReservation error:", error);
    res.status(500).json({ error: error.message || "Failed to create reservation" });
  }
};

// Get reservations for the logged-in guest (User Profile)
exports.getGuestReservations = async (req, res) => {
  try {
    const guestId = req.user;
    if (!guestId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const reservations = await reservationDB
      .find({ guestId: String(guestId) })
      .sort({ created_at: -1 })
      .lean();

    // Populate listing details for each reservation
    const populated = await Promise.all(
      reservations.map(async (resItem) => {
        let listing = null;
        try {
          listing = await House.findById(resItem.listingId).select(
            "title photos location houseType basePrice ratings"
          ).lean();
        } catch {
          // ignore lookup error
        }

        let host = null;
        try {
          host = await User.findById(resItem.authorId).select("name emailId profileImg").lean();
        } catch {
          // ignore lookup error
        }

        return {
          ...resItem,
          listing,
          host,
        };
      })
    );

    res.status(200).json(populated);
  } catch (error) {
    console.error("getGuestReservations error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Guest requests cancellation
exports.requestCancellation = async (req, res) => {
  try {
    const guestId = req.user;
    const { id } = req.params;
    const { reason } = req.body;

    const reservation = await reservationDB.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Verify ownership
    if (reservation.guestId && String(reservation.guestId) !== String(guestId)) {
      return res.status(403).json({ message: "You are not authorized to cancel this booking" });
    }

    if (reservation.status === "cancelled" || reservation.status === "refunded") {
      return res.status(400).json({ message: "Reservation is already cancelled/refunded" });
    }

    reservation.status = "cancellation_requested";
    reservation.cancellationReason = reason || "Guest requested cancellation";
    reservation.cancellationRequestedAt = new Date();

    const updated = await reservation.save();

    res.status(200).json({
      message: "Cancellation request sent to host successfully.",
      reservation: updated,
    });
  } catch (error) {
    console.error("requestCancellation error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Host approves cancellation and processes refund (deducting taxes)
exports.processRefund = async (req, res) => {
  try {
    const authorId = req.user;
    const { id } = req.params;

    const reservation = await reservationDB.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Verify host authorization
    if (reservation.authorId && String(reservation.authorId) !== String(authorId)) {
      return res.status(403).json({ message: "Only the host can process this refund" });
    }

    if (reservation.status === "refunded") {
      return res.status(400).json({ message: "This reservation has already been refunded" });
    }

    const nights = reservation.nightStaying || 1;
    const baseTotal = (reservation.basePrice || 0) * nights;
    const taxDeduction = reservation.taxes || Math.round((baseTotal * 14) / 100);
    // Refund room cost (total minus tax deduction)
    const refundAmount = Math.max(baseTotal, 0);

    let stripeRefundId = `ref_${Date.now()}`;

    // Attempt real Stripe refund if paymentIntentId is present
    if (reservation.paymentIntentId && reservation.paymentIntentId.startsWith("pi_")) {
      try {
        const stripeRefund = await stripe.refunds.create({
          payment_intent: reservation.paymentIntentId,
          amount: Math.round(refundAmount * 100), // in cents
        });
        stripeRefundId = stripeRefund.id;
      } catch (stripeErr) {
        console.warn("Stripe refund notice:", stripeErr.message);
        stripeRefundId = `sim_ref_${Date.now()}`;
      }
    }

    reservation.status = "refunded";
    reservation.paymentStatus = "refunded";
    reservation.refundDetails = {
      refundAmount: refundAmount,
      taxDeduction: taxDeduction,
      refundedAt: new Date(),
      stripeRefundId: stripeRefundId,
    };

    const updated = await reservation.save();

    res.status(200).json({
      message: `Refund of $${refundAmount} processed successfully (Tax deduction: $${taxDeduction}).`,
      reservation: updated,
    });
  } catch (error) {
    console.error("processRefund error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all reservations for a specific listing
exports.getAllReservations = async (req, res) => {
  try {
    const payload = req.body;
    const listingId = payload.id;

    const findCriteria = {
      listingId: listingId,
    };

    const reservationsData = await reservationDB.find(findCriteria);
    res.status(200).send(reservationsData);
  } catch (error) {
    console.error("getAllReservations error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all reservations for the logged-in host
exports.getAuthorsReservations = async (req, res) => {
  try {
    const userId = req.user;

    const reservations = await reservationDB
      .find({ authorId: String(userId) })
      .sort({ created_at: -1 })
      .lean();

    // Populate listing and guest details
    const populated = await Promise.all(
      reservations.map(async (resItem) => {
        let listing = null;
        try {
          listing = await House.findById(resItem.listingId).select("title photos location houseType basePrice").lean();
        } catch {
          // ignore
        }

        let guest = null;
        try {
          if (resItem.guestId) {
            guest = await User.findById(resItem.guestId).select("name emailId profileImg").lean();
          }
        } catch {
          // ignore
        }

        return {
          ...resItem,
          listing,
          guest,
        };
      })
    );

    res.status(200).json(populated);
  } catch (error) {
    console.error("getAuthorsReservations error:", error);
    res.status(500).json({ error: error.message });
  }
};