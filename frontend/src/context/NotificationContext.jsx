/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { API } from "../backend";
import { useAuth } from "../hooks/useAuth";
import io from "socket.io-client";
import { toast } from "react-hot-toast";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get("/notifications");
      if (res.data?.success === 1) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("fetchNotifications error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time socket notification listener & service status monitoring
  useEffect(() => {
    const handleServiceStatus = (e) => {
      const { isDown } = e.detail || {};
      if (isDown) {
        setNotifications((prev) => {
          if (prev.some((n) => n._id === "backend-service-down-alert")) return prev;
          const downAlert = {
            _id: "backend-service-down-alert",
            title: "⚠️ Backend Service Disconnected",
            message: "Unable to reach the Journey Cuisine server. Please check your internet connection or server status.",
            type: "system_error",
            createdAt: new Date().toISOString(),
            isRead: false,
            isServerAlert: true,
          };
          setUnreadCount((c) => c + 1);
          return [downAlert, ...prev];
        });
      } else {
        // When connected/restored, silently clear the down alert
        setNotifications((prev) => {
          const target = prev.find((n) => n._id === "backend-service-down-alert");
          if (target && !target.isRead) {
            setUnreadCount((c) => Math.max(0, c - 1));
          }
          return prev.filter((n) => n._id !== "backend-service-down-alert");
        });
      }
    };

    window.addEventListener("backend-service-status", handleServiceStatus);
    return () => {
      window.removeEventListener("backend-service-status", handleServiceStatus);
    };
  }, []);

  // Real-time socket notification listener
  useEffect(() => {
    if (!user?._id) return;
    const socketServerUrl = API.endsWith("/api/")
      ? API.replace("/api/", "")
      : API.replace("/api", "");

    const socket = io(socketServerUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on("connect", () => {
      // Register socket in user's personal room immediately on connect/reconnect
      socket.emit("register_user", String(user._id));
      window.dispatchEvent(
        new CustomEvent("backend-service-status", {
          detail: { isDown: false },
        })
      );
    });

    socket.on("connect_error", () => {
      window.dispatchEvent(
        new CustomEvent("backend-service-status", {
          detail: { isDown: true, message: "Socket connection error" },
        })
      );
    });

    socket.on("new_notification", (notif) => {
      if (!notif) return;
      setNotifications((prev) => {
        // Avoid duplicate notification items
        if (prev.some((n) => n._id === notif._id)) return prev;
        return [notif, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    });

    // Also listen to custom local event for immediate in-app booking confirmation push
    const handleLocalBookingNotification = (e) => {
      const { notification } = e.detail || {};
      if (notification) {
        setNotifications((prev) => {
          if (prev.some((n) => n._id === notification._id)) return prev;
          return [notification, ...prev];
        });
        setUnreadCount((prev) => prev + 1);
      }
    };

    window.addEventListener("local-booking-notification", handleLocalBookingNotification);

    return () => {
      window.removeEventListener("local-booking-notification", handleLocalBookingNotification);
      socket.disconnect();
    };
  }, [user?._id]);

  const markAsRead = async (id) => {
    if (typeof id === "string" && id.startsWith("backend-service-")) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return;
    }
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.data?.success === 1) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("markAsRead error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await api.patch("/notifications/mark_all_read");
      if (res.data?.success === 1) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (err) {
      console.error("markAllAsRead error:", err);
    }
  };

  const deleteNotification = async (id) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n._id === id);
      if (target && !target.isRead) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      return prev.filter((n) => n._id !== id);
    });

    if (typeof id === "string" && id.startsWith("backend-service-")) {
      return;
    }

    try {
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      console.error("deleteNotification error:", err);
    }
  };

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        isLoading,
        openDrawer,
        closeDrawer,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
