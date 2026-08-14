const express = require("express");
const {
  getUserTrips,
  createTrip,
  deleteTrip,
  addDestination,
  removeDestination,
  addActivity,
  removeActivity,
} = require("../controllers/tripController.js");
const { verifyJwtToken } = require("../middleware/jwt.js");

const router = express.Router();
router.use(express.json());

router.get("/", verifyJwtToken, getUserTrips);
router.post("/", verifyJwtToken, createTrip);
router.delete("/:id", verifyJwtToken, deleteTrip);
router.post("/:id/destinations", verifyJwtToken, addDestination);
router.delete("/:id/destinations/:destId", verifyJwtToken, removeDestination);
router.post("/:id/destinations/:destId/activities", verifyJwtToken, addActivity);
router.delete("/:id/destinations/:destId/activities/:activityId", verifyJwtToken, removeActivity);

module.exports = router;
