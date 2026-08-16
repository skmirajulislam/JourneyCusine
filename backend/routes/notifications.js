const express = require("express");
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController.js");
const { verifyJwtToken } = require("../middleware/jwt.js");

const router = express.Router();
router.use(express.json());

router.get("/", verifyJwtToken, getUserNotifications);
router.patch("/mark_all_read", verifyJwtToken, markAllAsRead);
router.patch("/:id/read", verifyJwtToken, markAsRead);
router.delete("/:id", verifyJwtToken, deleteNotification);

module.exports = router;
