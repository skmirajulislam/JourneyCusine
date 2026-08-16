const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const auth = require("./routes/auth.js");
const house = require("./routes/house.js");
const reservations = require("./routes/reservations.js");
const trips = require("./routes/trips.js");
const ai = require("./routes/ai.js");
const coupon = require("./routes/coupon.js");
const review = require("./routes/review.js");
const chat = require("./routes/chat.js");
const loyalty = require("./routes/loyalty.js");
const notifications = require("./routes/notifications.js");

const Message = require("./models/message.model.js");
const Conversation = require("./models/conversation.model.js");

require("dotenv").config();

const { createRouteHandler } = require("uploadthing/express");
const { uploadRouter } = require("./uploadthing.js");

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const { apiLimiter } = require("./middleware/rateLimiter.js");

// parse Data
app.use(express.json({ limit: "20mb" }));
app.use(cors());
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(apiLimiter);

// UploadThing route handler
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: {
      token: process.env.UPLOADTHING_TOKEN,
    },
  })
);

// Use routes
app.use("/auth", auth);
app.use("/house", house);
app.use("/reservations", reservations);
app.use("/trips", trips);
app.use("/ai", ai);
app.use("/coupons", coupon);
app.use("/reviews", review);
app.use("/chat", chat);
app.use("/loyalty", loyalty);
app.use("/notifications", notifications);

// Real-Time Socket.io Connection Handlers
io.on("connection", (socket) => {
  // User joins a personal notification room for incoming message badges
  socket.on("register_user", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
    }
  });

  // User joins a conversation chat room
  socket.on("join_conversation", (conversationId) => {
    if (conversationId) {
      socket.join(`conversation_${conversationId}`);
    }
  });

  // User leaves a conversation chat room
  socket.on("leave_conversation", (conversationId) => {
    if (conversationId) {
      socket.leave(`conversation_${conversationId}`);
    }
  });

  // Real-time message sending
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, senderId, text } = data;
      if (!conversationId || !senderId || !text || !text.trim()) return;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const senderObjId = new mongoose.Types.ObjectId(senderId);
      const newMessage = await new Message({
        conversationId: conversation._id,
        senderId: senderObjId,
        text: text.trim(),
        readBy: [senderObjId],
      }).save();

      conversation.lastMessage = {
        text: text.trim(),
        senderId: senderObjId,
        createdAt: new Date(),
      };

      // Increment unread count for other participants
      conversation.participants.forEach((pId) => {
        const pStr = String(pId);
        if (pStr !== String(senderId)) {
          const currentCount = conversation.unreadCount.get(pStr) || 0;
          conversation.unreadCount.set(pStr, currentCount + 1);
          // Notify the recipient's personal room of new message
          io.to(`user_${pStr}`).emit("new_message_notification", {
            conversationId: conversation._id,
            text: text.trim(),
            senderId,
          });
        }
      });

      await conversation.save();

      const populatedMessage = await Message.findById(newMessage._id).populate(
        "senderId",
        "name emailId profileImg"
      );

      const populatedConversation = await Conversation.findById(conversation._id)
        .populate("participants", "name emailId profileImg role")
        .populate("listingId", "title photos basePrice location houseType");

      // Broadcast message to the conversation room
      io.to(`conversation_${conversationId}`).emit("receive_message", populatedMessage);
      io.to(`conversation_${conversationId}`).emit("conversation_updated", populatedConversation || conversation);
    } catch (err) {
      console.error("socket send_message error:", err);
    }
  });

  // Real-time typing indicators
  socket.on("typing", ({ conversationId, senderName, senderId }) => {
    socket.to(`conversation_${conversationId}`).emit("user_typing", { senderName, senderId });
  });

  socket.on("stop_typing", ({ conversationId, senderId }) => {
    socket.to(`conversation_${conversationId}`).emit("user_stop_typing", { senderId });
  });

  socket.on("disconnect", () => {
    // Socket disconnected
  });
});

async function main() {
  let mongoUri = process.env.MONGODB_URI || "";
  const dbName = process.env.DB_NAME || "motel-develpoment-db";
  if (!mongoUri) {
    mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tkzvadc.mongodb.net/${dbName}`;
  } else if (mongoUri.endsWith("/")) {
    mongoUri = `${mongoUri}${dbName}`;
  }

  try {
    await mongoose.connect(mongoUri);
    const { seedDefaultCoupons } = require("./controllers/couponController.js");
    await seedDefaultCoupons();
    const port = process.env.PORT || 5001;
    server.listen(port, () => {
      console.log(`Server is running with Socket.io on port ${port}`);
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Unable to start the server:", error.message);
    process.exitCode = 1;
  }
}

app.get("/", (req, res) => {
  res.send(`Express + Socket.io server is working on ${process.env.PORT || 5001}`);
});

main();
