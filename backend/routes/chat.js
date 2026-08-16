const express = require("express");
const router = express.Router();
const { verifyJwtToken } = require("../middleware/jwt.js");
const { standardLimiter } = require("../middleware/rateLimiter.js");
const {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
} = require("../controllers/chatController.js");

router.use(standardLimiter);

router.post("/start", verifyJwtToken, startConversation);
router.get("/conversations", verifyJwtToken, getConversations);
router.delete("/conversations/:conversationId", verifyJwtToken, deleteConversation);
router.get("/messages/:conversationId", verifyJwtToken, getMessages);
router.post("/messages", verifyJwtToken, sendMessage);

module.exports = router;
