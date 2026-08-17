import { useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import {
  FiX,
  FiBell,
  FiCheck,
  FiTrash2,
  FiCalendar,
  FiNavigation,
  FiAward,
  FiMessageSquare,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";
import { FadeLoader } from "react-spinners";

const getTypeIcon = (type) => {
  switch (type) {
    case "system_error":
    case "server_down":
      return <FiAlertTriangle className="text-red-500" size={16} />;
    case "system_success":
      return <FiCheckCircle className="text-emerald-500" size={16} />;
    case "booking":
      return <FiCalendar className="text-rose-500" size={16} />;
    case "trip":
      return <FiNavigation className="text-blue-500" size={16} />;
    case "reward":
      return <FiAward className="text-amber-500" size={16} />;
    case "chat":
      return <FiMessageSquare className="text-emerald-500" size={16} />;
    default:
      return <FiInfo className="text-neutral-500" size={16} />;
  }
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "Just now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationDrawerModal = () => {
  const {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    closeDrawer,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // "all" | "booking" | "trip" | "reward"

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "booking") return n.type === "booking" || n.type === "stay" || n.type === "reservation";
    if (filter === "trip") return n.type === "trip" || n.type === "trips" || n.type === "travel";
    if (filter === "reward") return n.type === "reward" || n.type === "coupon" || n.type === "loyalty" || n.type === "points";
    return n.type === filter;
  });

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif._id);
    }
    if (notif.link) {
      closeDrawer();
      navigate(notif.link);
    }
  };

  return (
    <div className="fixed inset-0 z-[2500] flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={closeDrawer} />

      {/* Drawer Container */}
      <div
        className="relative w-full sm:w-[420px] h-full bg-white dark:bg-[#181818] shadow-2xl border-l border-neutral-200 dark:border-[#2e2e2e] flex flex-col z-10 animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-[#262626] flex items-center justify-between gap-3 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#ff385c]">
              <FiBell size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[#ff385c] text-white">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Bookings, dining &amp; trip updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                title="Mark all as read"
                className="p-2 text-xs font-bold text-[#ff385c] hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
              >
                <FiCheck size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={closeDrawer}
              className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#262626] rounded-xl transition cursor-pointer"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-[#262626] flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {[
            { id: "all", label: "All" },
            { id: "booking", label: "🏨 Stays" },
            { id: "trip", label: "👥 Trips" },
            { id: "reward", label: "🎁 Rewards" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filter === tab.id
                  ? "bg-[#111827] dark:bg-white text-white dark:text-[#111827]"
                  : "bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <FadeLoader color="#ff385c" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-20 text-center text-neutral-400">
              <FiBell className="mx-auto text-4xl mb-2 opacity-40" />
              <p className="text-xs font-bold">No notifications yet</p>
              <p className="text-[11px] mt-0.5">You&apos;re all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex items-start gap-3 ${
                  notif.isRead
                    ? "bg-white dark:bg-[#1f1f1f] border-neutral-200 dark:border-[#2e2e2e] opacity-80"
                    : "bg-gradient-to-br from-rose-50/40 to-white dark:from-[#201518] dark:to-[#1a1a1a] border-rose-200 dark:border-rose-950/60 shadow-xs"
                }`}
              >
                {/* Unread indicator dot */}
                {!notif.isRead && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#ff385c] animate-pulse" />
                )}

                {/* Type Icon Container */}
                <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  {getTypeIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {notif.title}
                  </h4>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-neutral-400 font-semibold mt-1.5 block">
                    {formatTimeAgo(notif.createdAt)}
                  </span>
                </div>

                {/* Delete button on hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition cursor-pointer"
                  title="Delete notification"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawerModal;
