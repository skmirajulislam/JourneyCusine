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

  // Smart background polling for real-time notification sync
  // Uses Page Visibility API and sequential scheduling to avoid overloading server/client
  useEffect(() => {
    if (!user?._id) return;

    let timerId = null;
    let isFetching = false;

    const poll = async () => {
      if (document.hidden || isFetching) return;
      isFetching = true;
      try {
        await fetchNotifications();
      } finally {
        isFetching = false;
        if (!document.hidden) {
          timerId = setTimeout(poll, 40000); // 40s gentle interval for background notifications
        }
      }
    };

    const handleVisibilityOrFocus = () => {
      if (!document.hidden) {
        if (timerId) clearTimeout(timerId);
        poll();
      }
    };

    // Initial check
    timerId = setTimeout(poll, 40000);

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      if (timerId) clearTimeout(timerId);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, [user?._id, fetchNotifications]);

  // Real-time socket notification listener (works when socket server is available)
  useEffect(() => {
    if (!user?._id) return;
    const socketServerUrl = API.endsWith("/api/")
      ? API.replace("/api/", "")
      : API.replace("/api", "");

    const socket = io(socketServerUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 2,
      reconnectionDelay: 2000,
      timeout: 5000,
    });

    socket.on("connect", () => {
      // Register socket in user's personal room immediately on connect
      socket.emit("register_user", String(user._id));
    });

    socket.on("connect_error", () => {
      // Gracefully silent on serverless / non-socket environments
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
