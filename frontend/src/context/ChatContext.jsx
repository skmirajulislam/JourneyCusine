/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import api, { API } from "../backend";
import { toast } from "react-hot-toast";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  const socketUrl = API.startsWith("http")
    ? API.replace(/\/+$/, "")
    : window.location.origin;

  // Fetch all user conversations
  const fetchConversations = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await api.get("/chat/conversations");
      if (res.data?.success === 1) {
        setConversations(res.data.conversations || []);
      }
    } catch (err) {
      console.error("fetchConversations error:", err);
    }
  }, [user?._id]);

  // Initialize Socket connection
  useEffect(() => {
    if (!user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register_user", user._id);
    });

    // Handle incoming message in active conversation
    socket.on("receive_message", (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });

      // Update conversations list last message
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id === message.conversationId) {
            return {
              ...c,
              lastMessage: {
                text: message.text,
                senderId: message.senderId?._id || message.senderId,
                createdAt: message.createdAt,
              },
            };
          }
          return c;
        })
      );
    });

    // Handle notification when not in active chat
    socket.on("new_message_notification", ({ text }) => {
      fetchConversations();
      if (!isChatOpen) {
        toast((t) => (
          <div
            onClick={() => {
              setIsChatOpen(true);
              toast.dismiss(t.id);
            }}
            className="flex items-center gap-2 cursor-pointer text-xs font-semibold"
          >
            <span>💬 New inquiry: {text.slice(0, 35)}...</span>
          </div>
        ));
      }
    });

    // Handle typing status
    socket.on("user_typing", ({ senderName, senderId }) => {
      if (senderId !== user._id) {
        setIsTyping(true);
        setTypingUser(senderName || "Host");
      }
    });

    socket.on("user_stop_typing", ({ senderId }) => {
      if (senderId !== user._id) {
        setIsTyping(false);
        setTypingUser("");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id, socketUrl, isChatOpen, fetchConversations]);

  useEffect(() => {
    if (user?._id) {
      fetchConversations();
    }
  }, [user?._id, fetchConversations]);

  // Select active conversation and load messages
  const selectConversation = useCallback(
    async (conversation) => {
      if (!conversation?._id) return;
      setActiveConversation(conversation);
      setIsLoadingMessages(true);

      // Join socket room
      if (socketRef.current) {
        if (activeConversation?._id) {
          socketRef.current.emit("leave_conversation", activeConversation._id);
        }
        socketRef.current.emit("join_conversation", conversation._id);
      }

      try {
        const res = await api.get(`/chat/messages/${conversation._id}`);
        if (res.data?.success === 1) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error("load messages error:", err);
        toast.error("Failed to load messages");
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [activeConversation?._id]
  );

  // Send a message
  const sendMessage = async (text) => {
    if (!text.trim() || !activeConversation?._id || !user?._id) return;

    const messageData = {
      conversationId: activeConversation._id,
      senderId: user._id,
      text: text.trim(),
    };

    // Emit via socket for real-time delivery
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("send_message", messageData);
    } else {
      // Fallback REST call
      try {
        const res = await api.post("/chat/messages", messageData);
        if (res.data?.success === 1) {
          setMessages((prev) => [...prev, res.data.message]);
        }
      } catch (err) {
        console.error("sendMessage error:", err);
        toast.error("Failed to send message");
      }
    }
  };

  // Open chat directly with a host for a specific listing
  const openChatWithHost = async ({ hostId, listingId, initialMessage }) => {
    if (!user) {
      toast.error("Please log in to chat with the host");
      window.dispatchEvent(new Event("open-auth-popup"));
      return;
    }

    if (String(user._id) === String(hostId)) {
      toast("You are the host of this motel property!", { icon: "ℹ️" });
      setIsChatOpen(true);
      return;
    }

    try {
      const res = await api.post("/chat/start", {
        hostId,
        listingId,
        initialMessage,
      });

      if (res.data?.success === 1 && res.data.conversation) {
        await fetchConversations();
        selectConversation(res.data.conversation);
        setIsChatOpen(true);
      }
    } catch (err) {
      console.error("openChatWithHost error:", err);
      toast.error(err.response?.data?.message || "Failed to start conversation");
    }
  };

  // Calculate total unread messages
  const unreadTotal = conversations.reduce((total, conv) => {
    if (user?._id && conv.unreadCount && typeof conv.unreadCount === "object") {
      const count = conv.unreadCount[user._id] || 0;
      return total + count;
    }
    return total;
  }, 0);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        isChatOpen,
        setIsChatOpen,
        isLoadingMessages,
        isTyping,
        typingUser,
        selectConversation,
        sendMessage,
        openChatWithHost,
        unreadTotal,
        socket: socketRef.current,
        fetchConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
