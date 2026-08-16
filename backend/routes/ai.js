const express = require("express");
const {
  handleAiChat,
  moderateImage,
  generateListingDescription,
  calculateSmartPricing,
} = require("../controllers/aiController.js");
const { verifyJwtToken } = require("../middleware/jwt.js");
const { standardLimiter } = require("../middleware/rateLimiter.js");

const router = express.Router();

router.use(express.json({ limit: "20mb" }));
router.use(standardLimiter);

// Protected AI chat endpoint
router.post("/chat", verifyJwtToken, handleAiChat);

// Protected AI Image Safety Moderation endpoint
router.post("/moderate_image", verifyJwtToken, moderateImage);

// AI Listing Description & Copywriting Generator
router.post("/generate_description", verifyJwtToken, generateListingDescription);

// AI Smart Pricing Recommendation Engine
router.post("/smart_pricing", verifyJwtToken, calculateSmartPricing);

module.exports = router;
