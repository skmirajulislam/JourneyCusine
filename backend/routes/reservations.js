const express = require("express");
const { verifyJwtToken } = require("../middleware/jwt.js");
const {
  getRazorpayKeyId,
  createRazorpayOrder,
  verifyRazorpayPayment,
  newReservation,
  getAllReservations,
  getAuthorsReservations,
  getGuestReservations,
  requestCancellation,
  processRefund,
} = require("../controllers/reservationController.js");

const router = express.Router();

router.use(express.json());

// Public config endpoint for frontend to get Razorpay Key ID
router.get("/config", getRazorpayKeyId);

// Razorpay Order Creation (Step 1)
router.post("/create_razorpay_order", createRazorpayOrder);
router.post("/create-order", createRazorpayOrder);

// Razorpay Signature Verification & Booking Confirmation (Step 3)
router.post("/verify_payment", verifyJwtToken, verifyRazorpayPayment);
router.post("/verify-payment", verifyJwtToken, verifyRazorpayPayment);

// Guest & Host Reservation Queries
router.get("/get_author_reservations", verifyJwtToken, getAuthorsReservations);
router.get("/my_bookings", verifyJwtToken, getGuestReservations);
router.post("/get_reservations", getAllReservations);
router.post("/booking", verifyJwtToken, newReservation);

// Cancellation & Refund Routes
router.post("/request_cancellation/:id", verifyJwtToken, requestCancellation);
router.post("/process_refund/:id", verifyJwtToken, processRefund);

module.exports = router;