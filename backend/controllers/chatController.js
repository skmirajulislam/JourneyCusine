const mongoose = require("mongoose");
const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const User = require("../models/user.model");
const House = require("../models/house.model");

/**
 * Start or get an existing conversation for a listing inquiry
 * POST /chat/start
 * Body: { hostId, listingId, initialMessage }
 */
exports.startConversation = async (req, res) => {
  try {
    const currentUserId = req.user;
    const { hostId, listingId, initialMessage } = req.body;

    if (!hostId) {
      return res.status(400).json({ success: 0, message: "Host ID is required" });
    }

    if (String(currentUserId) === String(hostId)) {
      return res.status(400).json({ success: 0, message: "You cannot message yourself" });
    }

    const currentObjId = new mongoose.Types.ObjectId(currentUserId);
    const hostObjId = new mongoose.Types.ObjectId(hostId);
    const listingObjId = listingId && mongoose.Types.ObjectId.isValid(listingId)
      ? new mongoose.Types.ObjectId(listingId)
      : null;

    // Find existing conversation between these two users (optionally for this listing)
    let conversation = await Conversation.findOne({
      participants: { $all: [currentObjId, hostObjId] },
      ...(listingObjId ? { listingId: listingObjId } : {}),
    })
      .populate("participants", "name emailId profilePic role")
      .populate("listingId", "title photos basePrice location houseType");

    if (!conversation) {
      conversation = await new Conversation({
        participants: [currentObjId, hostObjId],
        listingId: listingObjId,
        unreadCount: new Map([
          [String(currentUserId), 0],
          [String(hostId), initialMessage ? 1 : 0],
        ]),
      }).save();

      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "name emailId profilePic role")
        .populate("listingId", "title photos basePrice location houseType");
    }

    let createdMessage = null;
    if (initialMessage && initialMessage.trim()) {
      createdMessage = await new Message({
        conversationId: conversation._id,
        senderId: currentObjId,
        text: initialMessage.trim(),
        readBy: [currentObjId],
      }).save();

      conversation.lastMessage = {
        text: initialMessage.trim(),
        senderId: currentObjId,
        createdAt: new Date(),
      };
      await conversation.save();
    }

    return res.status(200).json({
      success: 1,
      conversation,
      message: createdMessage,
    });
  } catch (error) {
    console.error("startConversation error:", error);
    return res.status(500).json({ success: 0, message: error.message || "Failed to start conversation" });
  }
};

/**
 * Get all conversations for the authenticated user
 * GET /chat/conversations
 */
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user;
    if (!currentUserId) {
      return res.status(401).json({ success: 0, message: "Unauthorized" });
    }

    const currentObjId = new mongoose.Types.ObjectId(currentUserId);

    const conversations = await Conversation.find({
      participants: currentObjId,
    })
      .populate("participants", "name emailId profilePic role")
      .populate("listingId", "title photos basePrice location houseType")
      .sort({ "lastMessage.createdAt": -1, updated_at: -1 });

    return res.status(200).json({
      success: 1,
      conversations,
    });
  } catch (error) {
    console.error("getConversations error:", error);
    return res.status(500).json({ success: 0, message: error.message || "Failed to get conversations" });
  }
};

/**
 * Get message history for a conversation
 * GET /chat/messages/:conversationId
 */
exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user;
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ success: 0, message: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: 0, message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => String(p) === String(currentUserId)
    );
    if (!isParticipant) {
      return res.status(403).json({ success: 0, message: "Unauthorized to view this conversation" });
    }

    // Mark messages as read by current user
    const currentObjId = new mongoose.Types.ObjectId(currentUserId);
    await Message.updateMany(
      { conversationId, readBy: { $ne: currentObjId } },
      { $addToSet: { readBy: currentObjId } }
    );

    // Reset unread count for current user
    if (conversation.unreadCount && conversation.unreadCount.has(String(currentUserId))) {
      conversation.unreadCount.set(String(currentUserId), 0);
      await conversation.save();
    }

    const messages = await Message.find({ conversationId })
      .populate("senderId", "name emailId profilePic")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: 1,
      messages,
      conversation,
    });
  } catch (error) {
    console.error("getMessages error:", error);
    return res.status(500).json({ success: 0, message: error.message || "Failed to get messages" });
  }
};

/**
 * Send a message via REST API (fallback if socket disconnects)
 * POST /chat/messages
 * Body: { conversationId, text }
 */
exports.sendMessage = async (req, res) => {
  try {
    const currentUserId = req.user;
    if (!conversationId || typeof conversationId !== "string" || !mongoose.Types.ObjectId.isValid(conversationId) || !text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ success: 0, message: "Valid conversation ID and text are required" });
    }

    const convObjId = new mongoose.Types.ObjectId(conversationId);
    const conversation = await Conversation.findById(convObjId);
    if (!conversation) {
      return res.status(404).json({ success: 0, message: "Conversation not found" });
    }

    const currentObjId = new mongoose.Types.ObjectId(currentUserId);
    const newMessage = await new Message({
      conversationId: conversation._id,
      senderId: currentObjId,
      text: text.trim(),
      readBy: [currentObjId],
    }).save();

    // Update conversation lastMessage & increment other participants' unread count
    conversation.lastMessage = {
      text: text.trim(),
      senderId: currentObjId,
      createdAt: new Date(),
    };

    conversation.participants.forEach((pId) => {
      const pStr = String(pId);
      if (pStr !== String(currentUserId)) {
        const currentCount = conversation.unreadCount.get(pStr) || 0;
        conversation.unreadCount.set(pStr, currentCount + 1);
      }
    });

    await conversation.save();

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "name emailId profilePic"
    );

    return res.status(200).json({
      success: 1,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ success: 0, message: error.message || "Failed to send message" });
  }
};
