const Notification = require("../models/notification.model.js");
const mongoose = require("mongoose");

// Helper to push notification to DB and emit socket event if IO instance exists
exports.sendNotification = async (io, { userId, title, message, type = "system", link = "" }) => {
  try {
    if (!userId) return null;
    const userIdStr = String(userId);
    const notif = new Notification({
      userId: new mongoose.Types.ObjectId(userIdStr),
      title,
      message,
      type,
      link,
      isRead: false,
    });
    const saved = await notif.save();

    if (io) {
      io.to(`user_${userIdStr}`).emit("new_notification", saved);
    }
    return saved;
  } catch (err) {
    console.error("sendNotification helper error:", err);
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user;
    const userObjId = new mongoose.Types.ObjectId(userId);

    let notifications = await Notification.find({ userId: userObjId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: 1,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("getUserNotifications error:", error);
    res.status(500).json({ success: 0, error: "Failed to fetch notifications" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    const notif = await Notification.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { isRead: true },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ success: 0, error: "Notification not found" });
    }

    res.status(200).json({ success: 1, notification: notif });
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({ success: 0, error: "Failed to update notification" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user;

    await Notification.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: 1, message: "All notifications marked as read" });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    res.status(500).json({ success: 0, error: "Failed to mark all as read" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    await Notification.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    res.status(200).json({ success: 1, message: "Notification deleted" });
  } catch (error) {
    console.error("deleteNotification error:", error);
    res.status(500).json({ success: 0, error: "Failed to delete notification" });
  }
};
