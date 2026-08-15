const express = require("express");
const { verifyJwtToken } = require("../middleware/jwt.js");
const {
  getStripePublishableKey,
  createPaymentIntent,
  newReservation,
  getAllReservations,
  getAuthorsReservations,
  getGuestReservations,
  requestCancellation,
  processRefund,
} = require("../controllers/reservationController.js");

const router = express.Router();

router.use(express.json());

router.get("/config", getStripePublishableKey);
router.get("/get_author_reservations", verifyJwtToken, getAuthorsReservations);
router.get("/my_bookings", verifyJwtToken, getGuestReservations);

router.post("/get_reservations", getAllReservations);
router.post("/create_payment_intent", createPaymentIntent);
router.post("/booking", verifyJwtToken, newReservation);
router.post("/request_cancellation/:id", verifyJwtToken, requestCancellation);
router.post("/process_refund/:id", verifyJwtToken, processRefund);

module.exports = router;