const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const House = require("../models/house.model.js");
const User = require("../models/user.model.js");
const reservationDB = require("../models/reservation.model.js");
const Coupon = require("../models/coupon.model.js");
const { sendNotification } = require("./notificationController.js");
const {
  getCurrencyForCountry,
  convertPrice,
  toSubunits,
  formatCurrency,
  EXCHANGE_RATES,
} = require("../utils/currency.js");
require("dotenv").config();

// Razorpay SDK Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_TQ65wJo8tIo228",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "M2AEUiRKOc3LBK7H0qxHMGgP",
});

/**
 * Get Razorpay Key ID for Frontend
 */
exports.getRazorpayKeyId = async (req, res) => {
  res.status(200).json({
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_TQ65wJo8tIo228",
    defaultCurrency: "INR",
  });
};

/**
 * Step 1: Create Razorpay Order with Dynamic Multi-Currency Support
 * Endpoint: POST /reservations/create-order
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const payload = req.body || {};
    const targetCurrency = (payload.currency || "INR").toUpperCase().trim();

    let totalAmountInTargetCurrency = 0;

    if (payload.amount && !isNaN(payload.amount)) {
      totalAmountInTargetCurrency = Number(payload.amount);
    } else if (payload.listingId && typeof payload.listingId === "string" && mongoose.Types.ObjectId.isValid(payload.listingId) && payload.nightStaying) {
      try {
        const listing = await House.findById(new mongoose.Types.ObjectId(payload.listingId));
        if (listing && req.user && String(listing.author) === String(req.user)) {
          return res.status(400).json({
            success: 0,
            error: "Hosts cannot reserve their own property listings.",
          });
        }
        if (listing && listing.basePrice) {
          const baseUSD = parseInt(listing.basePrice, 10);
          const nights = parseInt(payload.nightStaying, 10) || 1;
          const roomUSD = baseUSD * nights;
          
          // Calculate selected cuisine add-ons
          const cuisineAddons = Array.isArray(payload.selectedCuisineAddons) ? payload.selectedCuisineAddons : [];
          const cuisineUSD = cuisineAddons.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
          
          const totalUSD = roomUSD + cuisineUSD;
          const taxUSD = Math.round((totalUSD * 14) / 100);
          const totalStayUSD = totalUSD + taxUSD;

          // Convert USD to target guest currency
          totalAmountInTargetCurrency = convertPrice(totalStayUSD, "USD", targetCurrency);
        }
      } catch (err) {
        console.error("Listing price lookup error:", err);
      }
    }

    if (!totalAmountInTargetCurrency || totalAmountInTargetCurrency <= 0) {
      totalAmountInTargetCurrency = convertPrice(100, "USD", targetCurrency);
    }

    // Convert amount to sub-units (paise/cents)
    const amountInSubunits = toSubunits(totalAmountInTargetCurrency, targetCurrency);
    const receipt =
      payload.receipt ||
      `rcpt_${Date.now()}_${crypto.randomInt(1000, 10000)}`;

    const options = {
      amount: amountInSubunits,
      currency: targetCurrency,
      receipt,
      notes: {
        listingId: payload.listingId || "",
        guestName: payload.guestName || "Guest",
        guestCurrency: targetCurrency,
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: 1,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      formattedAmount: formatCurrency(totalAmountInTargetCurrency, targetCurrency),
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_TQ65wJo8tIo228",
    });
  } catch (error) {
    console.error("createRazorpayOrder error:", error);
    return res.status(500).json({
      success: 0,
      error: error.message || "Failed to create Razorpay order",
    });
  }
};

/**
 * Step 3: Verify Razorpay Signature & Confirm Booking with Cross-Border Currency Tracking
 * Endpoint: POST /reservations/verify-payment
 */
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      listingId,
      authorId,
      guestNumber = 1,
      checkIn,
      checkOut,
      nightStaying = 1,
      orderId,
      currency: clientGuestCurrency,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: 0,
        error: "Missing required Razorpay payment verification fields.",
      });
    }

    // Verify HMAC-SHA256 signature
    const keySecret =
      process.env.RAZORPAY_KEY_SECRET || "M2AEUiRKOc3LBK7H0qxHMGgP";
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: 0,
        error: "Payment verification failed: Signature mismatch.",
      });
    }

    if (!listingId || typeof listingId !== "string" || !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ success: 0, error: "Invalid listing ID format" });
    }

    const listingObjId = new mongoose.Types.ObjectId(listingId);
    const listingDetails = await House.findById(listingObjId);
    if (!listingDetails) {
      return res.status(404).json({ success: 0, error: "Listing not found" });
    }

    const guestId = req.user || req.body.guestId;
    if (guestId && String(listingDetails.author) === String(guestId)) {
      return res.status(400).json({
        success: 0,
        error: "Hosts cannot reserve their own property listings.",
      });
    }
    let guestEmail = "";
    let guestName = "Guest";
    let guestCountry = "India";
    let guestCurrency = clientGuestCurrency || "INR";

    if (guestId && typeof guestId === "string" && mongoose.Types.ObjectId.isValid(guestId)) {
      const guestObjId = new mongoose.Types.ObjectId(guestId);
      const guestUser = await User.findById(guestObjId);
      if (guestUser) {
        guestEmail = guestUser.emailId;
        guestName =
          `${guestUser.name?.firstName || ""} ${guestUser.name?.lastName || ""}`.trim();
        guestCountry = guestUser.country || "India";
        guestCurrency = guestUser.currency || clientGuestCurrency || getCurrencyForCountry(guestCountry);
      }
    }

    // Lookup Host Currency Details
    const resolvedAuthorId = authorId || listingDetails.author || listingDetails.authorId;
    let hostCountry = "India";
    let hostCurrency = "INR";

    if (resolvedAuthorId && typeof resolvedAuthorId === "string" && mongoose.Types.ObjectId.isValid(resolvedAuthorId)) {
      const hostObjId = new mongoose.Types.ObjectId(resolvedAuthorId);
      const hostUser = await User.findById(hostObjId);
      if (hostUser) {
        hostCountry = hostUser.country || "India";
        hostCurrency = hostUser.currency || getCurrencyForCountry(hostCountry);
      }
    }

    // Base USD calculation
    const basePriceUSD = parseInt(listingDetails.basePrice, 10) || 0;
    const nights = parseInt(nightStaying, 10) || 1;
    const totalRoomPriceUSD = basePriceUSD * nights;
    
    // Check & apply coupon discount if provided
    let discountUSD = 0;
    let appliedCouponCode = req.body.couponCode ? req.body.couponCode.trim().toUpperCase() : null;

    if (appliedCouponCode) {
      try {
        const coupon = await Coupon.findOne({
          code: appliedCouponCode,
          isActive: true,
          expiresAt: { $gt: new Date() },
        });

        if (coupon && coupon.usageCount < coupon.maxUsage) {
          if (coupon.discountType === "percentage") {
            discountUSD = Math.round((totalRoomPriceUSD * coupon.discountRate) / 100);
          } else {
            discountUSD = Math.min(coupon.discountRate, totalRoomPriceUSD);
          }

          // Record coupon usage
          coupon.usageCount += 1;
          coupon.usedBy.push({
            guestId,
            orderId: String(orderId || razorpay_order_id),
            usedAt: new Date(),
            discountApplied: discountUSD,
          });

          if (coupon.usageCount >= coupon.maxUsage) {
            coupon.isActive = false;
          }

          await coupon.save();
        } else {
          appliedCouponCode = null;
          discountUSD = 0;
        }
      } catch (couponErr) {
        console.error("Coupon verification error:", couponErr);
      }
    }

    // Calculate selected cuisine add-ons
    const selectedCuisineAddons = Array.isArray(req.body.selectedCuisineAddons) ? req.body.selectedCuisineAddons : [];
    const cuisineTotalPriceUSD = selectedCuisineAddons.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    const guestCuisineTotalPrice = convertPrice(cuisineTotalPriceUSD, "USD", guestCurrency);

    const discountedRoomUSD = Math.max(0, totalRoomPriceUSD - discountUSD);
    const subtotalWithCuisineUSD = discountedRoomUSD + cuisineTotalPriceUSD;
    const taxUSD = Math.round((subtotalWithCuisineUSD * 14) / 100);
    const totalPriceUSD = subtotalWithCuisineUSD + taxUSD;
    const originalTotalPriceUSD = (totalRoomPriceUSD + cuisineTotalPriceUSD) + Math.round(((totalRoomPriceUSD + cuisineTotalPriceUSD) * 14) / 100);
    const authorEarnedPriceUSD =
      discountedRoomUSD - Math.round((discountedRoomUSD * 3) / 100) + cuisineTotalPriceUSD;

    // Converted Guest Amounts
    const guestBasePrice = convertPrice(discountedRoomUSD, "USD", guestCurrency);
    const guestTaxes = convertPrice(taxUSD, "USD", guestCurrency);
    const guestTotalPaid = convertPrice(totalPriceUSD, "USD", guestCurrency);
    const guestDiscountAmount = convertPrice(discountUSD, "USD", guestCurrency);

    // Converted Host Earnings (in Host's native currency)
    const hostEarnings = convertPrice(authorEarnedPriceUSD, "USD", hostCurrency);

    const resolvedOrderId =
      orderId || crypto.randomInt(100000000, 1000000000);

    const newReservation = {
      listingId,
      authorId: resolvedAuthorId,
      guestId,
      guestEmail,
      guestName,
      guestNumber: parseInt(guestNumber, 10) || 1,
      checkIn,
      checkOut,
      nightStaying: nights,
      // USD Standard fields
      basePrice: basePriceUSD,
      taxes: taxUSD,
      totalPrice: totalPriceUSD,
      originalTotalPrice: originalTotalPriceUSD,
      couponCode: appliedCouponCode,
      couponDiscount: guestDiscountAmount,
      authorEarnedPrice: authorEarnedPriceUSD,
      // Cuisine Dining Experiences Add-ons
      selectedCuisineAddons,
      cuisineTotalPrice: cuisineTotalPriceUSD,
      guestCuisineTotalPrice,
      // Multi-Currency Cross-Border Fields
      currency: guestCurrency,
      guestCurrency,
      guestBasePrice,
      guestTaxes,
      guestTotalPaid,
      hostCurrency,
      hostEarnings,
      exchangeRate: EXCHANGE_RATES[guestCurrency] || 1.0,
      orderId: resolvedOrderId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus: "paid",
      status: "confirmed",
    };

    const savedReservation = await new reservationDB(newReservation).save();

    // Send real-time notifications to Guest and Host
    const io = req.app.get("io");
    if (io) {
      // Guest notification
      if (guestId) {
        await sendNotification(io, {
          userId: guestId,
          title: "Booking Confirmed! 🏨",
          message: `Your reservation at "${listingDetails.title || "Motel"}" (${nights} night(s)) has been confirmed.`,
          type: "booking",
          link: "/trips",
        });
      }
      // Host notification
      if (resolvedAuthorId) {
        await sendNotification(io, {
          userId: resolvedAuthorId,
          title: "New Reservation Received! 🎉",
          message: `${guestName} booked "${listingDetails.title || "Motel"}" for ${nights} night(s).`,
          type: "booking",
          link: "/dashboard",
        });
      }
    }

    return res.status(200).json({
      success: 1,
      message: "Razorpay payment verified and reservation created successfully.",
      reservation: savedReservation,
    });
  } catch (error) {
    console.error("verifyRazorpayPayment error:", error);
    return res.status(500).json({
      success: 0,
      error: error.message || "Failed to verify payment",
    });
  }
};

/**
 * Save new reservation (direct or post-verification fallback)
 */
exports.newReservation = async (req, res) => {
  try {
    const payload = req.body;
    const listingId = payload.listingId;
    const authorId = payload.authorId;
    const guestNumber = parseInt(payload.guestNumber, 10) || 1;
    const checkIn = payload.checkIn;
    const checkOut = payload.checkOut;
    const nightStaying = parseInt(payload.nightStaying, 10) || 1;
    const orderId =
      payload.orderId || crypto.randomInt(100000000, 1000000000);
    const guestId = req.user || payload.guestId;

    if (!listingId || typeof listingId !== "string" || !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ message: "Invalid listing ID format" });
    }

    const listingObjId = new mongoose.Types.ObjectId(listingId);
    const listingDetails = await House.findById(listingObjId);
    if (!listingDetails) {
      return res.status(404).json({ message: "Listing not found" });
    }

    let guestEmail = "";
    let guestName = "Guest";
    let guestCountry = "India";
    let guestCurrency = payload.currency || "INR";

    if (guestId && typeof guestId === "string" && mongoose.Types.ObjectId.isValid(guestId)) {
      const guestObjId = new mongoose.Types.ObjectId(guestId);
      const guestUser = await User.findById(guestObjId);
      if (guestUser) {
        guestEmail = guestUser.emailId;
        guestName =
          `${guestUser.name?.firstName || ""} ${guestUser.name?.lastName || ""}`.trim();
        guestCountry = guestUser.country || "India";
        guestCurrency = guestUser.currency || payload.currency || getCurrencyForCountry(guestCountry);
      }
    }

    const resolvedAuthorId = authorId || listingDetails.author || listingDetails.authorId;
    let hostCurrency = "INR";
    if (resolvedAuthorId && typeof resolvedAuthorId === "string" && mongoose.Types.ObjectId.isValid(resolvedAuthorId)) {
      const hostObjId = new mongoose.Types.ObjectId(resolvedAuthorId);
      const hostUser = await User.findById(hostObjId);
      if (hostUser) {
        hostCurrency = hostUser.currency || getCurrencyForCountry(hostUser.country || "India");
      }
    }

    const basePriceUSD = parseInt(listingDetails.basePrice, 10) || 0;
    const totalRoomPriceUSD = basePriceUSD * nightStaying;

    // Calculate selected cuisine add-ons
    const selectedCuisineAddons = Array.isArray(payload.selectedCuisineAddons) ? payload.selectedCuisineAddons : [];
    const cuisineTotalPriceUSD = selectedCuisineAddons.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    const guestCuisineTotalPrice = convertPrice(cuisineTotalPriceUSD, "USD", guestCurrency);

    const subtotalWithCuisineUSD = totalRoomPriceUSD + cuisineTotalPriceUSD;
    const taxUSD = Math.round((subtotalWithCuisineUSD * 14) / 100);
    const totalPriceUSD = subtotalWithCuisineUSD + taxUSD;
    const authorEarnedPriceUSD =
      totalRoomPriceUSD - Math.round((totalRoomPriceUSD * 3) / 100) + cuisineTotalPriceUSD;

    const guestBasePrice = convertPrice(totalRoomPriceUSD, "USD", guestCurrency);
    const guestTaxes = convertPrice(taxUSD, "USD", guestCurrency);
    const guestTotalPaid = convertPrice(totalPriceUSD, "USD", guestCurrency);
    const hostEarnings = convertPrice(authorEarnedPriceUSD, "USD", hostCurrency);

    const newReservation = {
      listingId,
      authorId: resolvedAuthorId,
      guestId,
      guestEmail,
      guestName,
      guestNumber,
      checkIn,
      checkOut,
      nightStaying,
      basePrice: basePriceUSD,
      taxes: taxUSD,
      totalPrice: totalPriceUSD,
      authorEarnedPrice: authorEarnedPriceUSD,
      // Cuisine Dining Experiences Add-ons
      selectedCuisineAddons,
      cuisineTotalPrice: cuisineTotalPriceUSD,
      guestCuisineTotalPrice,
      currency: guestCurrency,
      guestCurrency,
      guestBasePrice,
      guestTaxes,
      guestTotalPaid,
      hostCurrency,
      hostEarnings,
      exchangeRate: EXCHANGE_RATES[guestCurrency] || 1.0,
      orderId,
      razorpayOrderId: payload.razorpayOrderId || payload.razorpay_order_id,
      razorpayPaymentId:
        payload.razorpayPaymentId || payload.razorpay_payment_id,
      razorpaySignature:
        payload.razorpaySignature || payload.razorpay_signature,
      paymentStatus: "paid",
      status: "confirmed",
    };

    const savedReservation = await new reservationDB(newReservation).save();

    // Send real-time notifications to Guest and Host
    const io = req.app.get("io");
    if (io) {
      if (guestId) {
        await sendNotification(io, {
          userId: guestId,
          title: "Booking Confirmed! 🏨",
          message: `Your reservation at "${listingDetails.title || "Motel"}" (${nightStaying} night(s)) has been confirmed.`,
          type: "booking",
          link: "/trips",
        });
      }
      if (authorId) {
        await sendNotification(io, {
          userId: authorId,
          title: "New Reservation Received! 🎉",
          message: `${guestName} booked "${listingDetails.title || "Motel"}" for ${nightStaying} night(s).`,
          type: "booking",
          link: "/dashboard",
        });
      }
    }

    return res.status(200).json({
      message: "Reservation confirmed successfully.",
      reservation: savedReservation,
    });
  } catch (error) {
    console.error("newReservation error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to create reservation" });
  }
};

/**
 * Get reservations for the logged-in guest (User Profile)
 */
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

    const populated = await Promise.all(
      reservations.map(async (resItem) => {
        let listing = null;
        try {
          listing = await House.findById(resItem.listingId)
            .select("title photos location houseType basePrice ratings")
            .lean();
        } catch {
          // ignore
        }

        let host = null;
        try {
          host = await User.findById(resItem.authorId)
            .select("name emailId profileImg country currency")
            .lean();
        } catch {
          // ignore
        }

        return {
          ...resItem,
          listing,
          host,
        };
      })
    );

    return res.status(200).json(populated);
  } catch (error) {
    console.error("getGuestReservations error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Guest requests cancellation
 */
exports.requestCancellation = async (req, res) => {
  try {
    const guestId = req.user;
    const { id } = req.params;
    const { reason } = req.body;

    const reservation = await reservationDB.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (
      reservation.guestId &&
      String(reservation.guestId) !== String(guestId)
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to cancel this booking" });
    }

    if (
      reservation.status === "cancelled" ||
      reservation.status === "refunded"
    ) {
      return res
        .status(400)
        .json({ message: "Reservation is already cancelled/refunded" });
    }

    // Prevent cancellation if checkout date has already passed
    const outDate = new Date(reservation.checkOut || reservation.checkIn || reservation.created_at);
    outDate.setHours(23, 59, 59, 999);
    if (outDate < new Date()) {
      return res.status(400).json({
        message: "Cannot request cancellation or refund for a completed stay.",
      });
    }

    reservation.status = "cancellation_requested";
    reservation.cancellationReason = reason || "Guest requested cancellation";
    reservation.cancellationRequestedAt = new Date();

    const updated = await reservation.save();

    return res.status(200).json({
      message: "Cancellation request sent to host successfully.",
      reservation: updated,
    });
  } catch (error) {
    console.error("requestCancellation error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Host approves cancellation and processes refund via Razorpay in guest currency
 */
exports.processRefund = async (req, res) => {
  try {
    const authorId = req.user;
    const { id } = req.params;

    const reservation = await reservationDB.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (
      reservation.authorId &&
      String(reservation.authorId) !== String(authorId)
    ) {
      return res
        .status(403)
        .json({ message: "Only the host can process this refund" });
    }

    if (reservation.status === "refunded") {
      return res
        .status(400)
        .json({ message: "This reservation has already been refunded" });
    }

    const guestCurrency = reservation.guestCurrency || reservation.currency || "INR";
    const nights = reservation.nightStaying || 1;

    // Refund calculation in guest currency
    const guestTotalPaid = reservation.guestTotalPaid || convertPrice(reservation.totalPrice || 0, "USD", guestCurrency);
    const guestBasePrice = reservation.guestBasePrice || convertPrice((reservation.basePrice || 0) * nights, "USD", guestCurrency);
    const taxDeduction = reservation.guestTaxes || (guestTotalPaid - guestBasePrice);
    const refundAmount = Math.max(guestBasePrice, 0);

    let razorpayRefundId = `rzp_ref_${Date.now()}`;

    if (
      reservation.razorpayPaymentId &&
      reservation.razorpayPaymentId.startsWith("pay_")
    ) {
      try {
        const refundResponse = await razorpay.payments.refund(
          reservation.razorpayPaymentId,
          {
            amount: toSubunits(refundAmount, guestCurrency),
            notes: {
              reason: "Host approved cancellation with tax deduction",
              reservationId: reservation._id.toString(),
              currency: guestCurrency,
            },
          }
        );
        if (refundResponse && refundResponse.id) {
          razorpayRefundId = refundResponse.id;
        }
      } catch (rzpErr) {
        console.warn(
          "Razorpay refund API call note:",
          rzpErr.message || rzpErr
        );
        razorpayRefundId = `sim_rzp_ref_${Date.now()}`;
      }
    }

    reservation.status = "refunded";
    reservation.paymentStatus = "refunded";
    reservation.refundDetails = {
      refundAmount: refundAmount,
      taxDeduction: taxDeduction,
      refundCurrency: guestCurrency,
      refundedAt: new Date(),
      razorpayRefundId: razorpayRefundId,
    };

    const updated = await reservation.save();

    return res.status(200).json({
      message: `Refund of ${formatCurrency(refundAmount, guestCurrency)} processed via Razorpay (${formatCurrency(taxDeduction, guestCurrency)} tax retained).`,
      reservation: updated,
    });
  } catch (error) {
    console.error("processRefund error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get all reservations for a specific listing
 */
exports.getAllReservations = async (req, res) => {
  try {
    const payload = req.body || {};
    const listingId = typeof payload.id === "string" ? payload.id.trim() : "";

    if (!listingId) {
      return res.status(400).json({ error: "Listing ID is required" });
    }

    const reservationsData = await reservationDB.find({ listingId: listingId });
    return res.status(200).send(reservationsData);
  } catch (error) {
    console.error("getAllReservations error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get all reservations for the logged-in host
 */
exports.getAuthorsReservations = async (req, res) => {
  try {
    const userId = req.user;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find all houses authored by this user
    let authorHouseIds = [];
    try {
      const houses = await House.find({
        $or: [
          { author: String(userId) },
          { author: new mongoose.Types.ObjectId(userId) },
        ],
      }).select("_id");
      authorHouseIds = houses.map((h) => String(h._id));
    } catch {
      // ignore
    }

    const queryConditions = [
      { authorId: String(userId) },
    ];

    if (mongoose.Types.ObjectId.isValid(userId)) {
      queryConditions.push({ authorId: new mongoose.Types.ObjectId(userId) });
    }

    if (authorHouseIds.length > 0) {
      queryConditions.push({ listingId: { $in: authorHouseIds } });
    }

    const reservations = await reservationDB
      .find({ $or: queryConditions })
      .sort({ created_at: -1 })
      .lean();

    const populated = await Promise.all(
      reservations.map(async (resItem) => {
        let listing = null;
        try {
          listing = await House.findById(resItem.listingId)
            .select("title photos location houseType basePrice")
            .lean();
        } catch {
          // ignore
        }

        let guest = null;
        try {
          if (resItem.guestId) {
            guest = await User.findById(resItem.guestId)
              .select("name emailId profileImg country currency")
              .lean();
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

    return res.status(200).json(populated);
  } catch (error) {
    console.error("getAuthorsReservations error:", error);
    return res.status(500).json({ error: error.message });
  }
};