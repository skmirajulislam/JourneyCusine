const express = require("express");
const { handleAiChat, moderateImage } = require("../controllers/aiController.js");
const { verifyJwtToken } = require("../middleware/jwt.js");

const router = express.Router();

router.use(express.json({ limit: "20mb" }));

// Protected AI chat endpoint
router.post("/chat", verifyJwtToken, handleAiChat);

// Protected AI Image Safety Moderation endpoint
router.post("/moderate_image", verifyJwtToken, moderateImage);

module.exports = router;
