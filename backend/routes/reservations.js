const express = require("express");
const { verifyJwtToken } = require("../middleware/jwt");
const { getStripePublishableKey, createPaymentIntent, newReservation, getAllReservations, getAuthorsReservations } = require("../controllers/reservationController");
const router = express.Router();

router.use(express.json())

router.get("/config", getStripePublishableKey)
router.get("/get_author_reservations", verifyJwtToken, getAuthorsReservations)

router.post("/get_reservations", getAllReservations)
router.post("/create_payment_intent", createPaymentIntent)
router.post("/booking", verifyJwtToken, newReservation)



module.exports = router;