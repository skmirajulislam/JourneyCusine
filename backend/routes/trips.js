const express = require("express");
const {
  getUserTrips,
  createTrip,
  deleteTrip,
  addDestination,
  removeDestination,
  addActivity,
  removeActivity,
  inviteCollaborator,
  joinTripByInvite,
  removeCollaborator,
  updateSplitStatus,
} = require("../controllers/tripController.js");
const { verifyJwtToken } = require("../middleware/jwt.js");
const { standardLimiter } = require("../middleware/rateLimiter.js");

const router = express.Router();
router.use(express.json());
router.use(standardLimiter);

router.get("/", verifyJwtToken, getUserTrips);
router.post("/", verifyJwtToken, createTrip);
router.delete("/:id", verifyJwtToken, deleteTrip);
router.post("/:id/destinations", verifyJwtToken, addDestination);
router.delete("/:id/destinations/:destId", verifyJwtToken, removeDestination);
router.post("/:id/destinations/:destId/activities", verifyJwtToken, addActivity);
router.delete("/:id/destinations/:destId/activities/:activityId", verifyJwtToken, removeActivity);

// Group Collaboration & Split-Pay routes
router.post("/:id/invite", verifyJwtToken, inviteCollaborator);
router.post("/join/:inviteCode", verifyJwtToken, joinTripByInvite);
router.delete("/:id/collaborators/:collaboratorId", verifyJwtToken, removeCollaborator);
router.patch("/:id/split_status", verifyJwtToken, updateSplitStatus);

module.exports = router;
