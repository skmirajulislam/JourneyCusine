const express = require("express");
const { verifyJwtToken } = require("../middleware/jwt.js");
const { getStripePublishableKey, createPaymentIntent, newReservation, getAllReservations, getAuthorsReservations } = require("../controllers/reservationController.js");
const router = express.Router();

router.use(express.json())

router.get("/config", getStripePublishableKey)
router.get("/get_author_reservations", verifyJwtToken, getAuthorsReservations)

router.post("/get_reservations", getAllReservations)
router.post("/create_payment_intent", createPaymentIntent)
router.post("/booking", verifyJwtToken, newReservation)



module.exports = router;