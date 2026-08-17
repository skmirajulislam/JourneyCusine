const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

messageSchema.index({ conversationId: 1, created_at: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
