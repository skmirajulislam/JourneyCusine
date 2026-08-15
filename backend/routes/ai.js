const express = require("express");
const { handleAiChat } = require("../controllers/aiController.js");
const { verifyJwtToken } = require("../middleware/jwt.js");

const router = express.Router();

router.use(express.json());

// Protected AI endpoint - requires valid user authentication
router.post("/chat", verifyJwtToken, handleAiChat);

module.exports = router;
