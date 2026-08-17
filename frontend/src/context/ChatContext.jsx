/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import api, { getSocketUrl } from "../backend";
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

  const isChatOpenRef = useRef(isChatOpen);
  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  const activeConversationRef = useRef(activeConversation);
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  const fetchConversationsRef = useRef(fetchConversations);
  useEffect(() => {
    fetchConversationsRef.current = fetchConversations;
  }, [fetchConversations]);

  // Smart background conversations polling (30s interval, pauses when tab is hidden)
  useEffect(() => {
    if (!user?._id) return;

    let timerId = null;
    let isFetching = false;

    const pollConversations = async () => {
      if (document.hidden || isFetching) return;
      isFetching = true;
      try {
        await fetchConversations();
      } finally {
        isFetching = false;
        if (!document.hidden) {
          timerId = setTimeout(pollConversations, 30000); // 30s gentle interval for conversation list
        }
      }
    };

    const handleVisibilityOrFocus = () => {
      if (!document.hidden) {
        if (timerId) clearTimeout(timerId);
        pollConversations();
      }
    };

    // Initial fetch on mount / user change
    pollConversations();

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      if (timerId) clearTimeout(timerId);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, [user?._id, fetchConversations]);

  // Adaptive polling for active conversation messages
  // ONLY runs when chat modal is open AND active conversation exists AND tab is visible.
  // Backs off from 2.5s -> 4s -> 6s -> 8s if idle, resets to 2.5s on new activity.
  useEffect(() => {
    if (!user?._id || !activeConversation?._id || !isChatOpen) return;

    const convId = activeConversation._id;
    let timerId = null;
    let isFetching = false;
    let pollDelay = 2500;
    let unchangedCount = 0;

    const pollMessages = async () => {
      if (document.hidden || isFetching || !isChatOpenRef.current) return;
      isFetching = true;

      try {
        const res = await api.get(`/chat/messages/${convId}`);
        if (res.data?.success === 1 && Array.isArray(res.data.messages)) {
          const incomingMessages = res.data.messages;

          setMessages((prev) => {
            const hasChanged =
              prev.length !== incomingMessages.length ||
              (incomingMessages.length > 0 &&
                prev[prev.length - 1]?._id !== incomingMessages[incomingMessages.length - 1]._id);

            if (!hasChanged) {
              unchangedCount++;
              // Adaptive backoff when no new messages
              if (unchangedCount >= 3) pollDelay = 4000;
              if (unchangedCount >= 6) pollDelay = 6000;
              if (unchangedCount >= 10) pollDelay = 8000;
              return prev;
            }

            // Reset backoff on new message
            unchangedCount = 0;
            pollDelay = 2500;

            const pendingOptimistic = prev.filter(
              (m) =>
                m.isOptimistic &&
                !incomingMessages.some(
                  (im) =>
                    im.text === m.text &&
                    String(im.senderId?._id || im.senderId) ===
                      String(m.senderId?._id || m.senderId)
                )
            );

            return [...incomingMessages, ...pendingOptimistic];
          });

          if (res.data.conversation) {
            setConversations((prev) =>
              prev.map((c) => (c._id === convId ? res.data.conversation : c))
            );
          }
        }
      } catch {
        // Polling errors fail silently without disrupting user
      } finally {
        isFetching = false;
        if (!document.hidden && isChatOpenRef.current) {
          timerId = setTimeout(pollMessages, pollDelay);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && isChatOpenRef.current) {
        if (timerId) clearTimeout(timerId);
        pollDelay = 2500;
        unchangedCount = 0;
        pollMessages();
      }
    };

    // Start initial poll loop
    timerId = setTimeout(pollMessages, pollDelay);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      if (timerId) clearTimeout(timerId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [user?._id, activeConversation?._id, isChatOpen]);

  // Initialize Socket connection (graceful when supported, silent fallback on serverless)
  useEffect(() => {
    if (!user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socketUrl = getSocketUrl();
    if (!socketUrl) {
      // Serverless deployment (Vercel): real-time sync is handled seamlessly via HTTP polling & focus sync
      return;
    }

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 2,
      reconnectionDelay: 2000,
      timeout: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register_user", user._id);
    });

    socket.on("connect_error", () => {
      // Gracefully silent on serverless / non-socket environments
    });

    // Handle incoming message in active conversation
    socket.on("receive_message", (message) => {
      if (!message) return;
      setMessages((prev) => {
        // If exact ID exists, do nothing
        if (prev.some((m) => m._id === message._id)) return prev;

        // If an optimistic temporary message matches, replace it with the real saved message
        const optIndex = prev.findIndex(
          (m) =>
            m.isOptimistic &&
            m.conversationId === message.conversationId &&
            m.text === message.text &&
            String(m.senderId?._id || m.senderId) ===
              String(message.senderId?._id || message.senderId)
        );

        if (optIndex !== -1) {
          const updated = [...prev];
          updated[optIndex] = message;
          return updated;
        }

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
              updatedAt: message.createdAt,
            };
          }
          return c;
        })
      );
    });

    // Handle background incoming message notification
    socket.on("new_message_notification", ({ text }) => {
      if (!isChatOpenRef.current) {
        toast((t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id);
              setIsChatOpen(true);
            }}
            className="cursor-pointer flex items-center space-x-2 text-sm font-medium"
          >
            <span>💬 New message: {text ? (text.length > 40 ? text.slice(0, 40) + "..." : text) : "Received a message"}</span>
          </div>
        ), {
          duration: 4000,
          position: "top-right",
        });
      }
      fetchConversationsRef.current();
    });

    // Typing indicators
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
      socketRef.current = null;
    };
  }, [user?._id]);

  // Select active conversation and load messages
  const selectConversation = useCallback(
    async (conversation) => {
      if (!conversation?._id) return;
      setActiveConversation(conversation);
      setIsLoadingMessages(true);

      // Immediately clear unread count for this conversation in frontend state
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id === conversation._id) {
            const updatedUnread = { ...(c.unreadCount || {}) };
            if (user?._id) {
              updatedUnread[user._id] = 0;
              updatedUnread[String(user._id)] = 0;
            }
            return {
              ...c,
              unreadCount: updatedUnread,
            };
          }
          return c;
        })
      );

      // Join socket room if socket is connected
      if (socketRef.current && socketRef.current.connected) {
        if (activeConversationRef.current?._id) {
          socketRef.current.emit("leave_conversation", activeConversationRef.current._id);
        }
        socketRef.current.emit("join_conversation", conversation._id);
      }

      try {
        const res = await api.get(`/chat/messages/${conversation._id}`);
        if (res.data?.success === 1) {
          setMessages(res.data.messages || []);
          if (res.data.conversation) {
            setConversations((prev) =>
              prev.map((c) => (c._id === conversation._id ? res.data.conversation : c))
            );
          }
        }
      } catch (err) {
        console.error("load messages error:", err);
        toast.error("Failed to load messages");
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [user?._id]
  );

  // Send a message (bulletproof real-time persistence with 0ms optimistic UI)
  const sendMessage = async (text) => {
    if (!text || !text.trim() || !activeConversation?._id || !user?._id) return;

    const trimmedText = text.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    const optimisticMsg = {
      _id: tempId,
      conversationId: activeConversation._id,
      senderId: {
        _id: user._id,
        name: user.name,
        emailId: user.emailId,
        profileImg: user.profileImg,
      },
      text: trimmedText,
      createdAt: new Date().toISOString(),
      readBy: [user._id],
      isOptimistic: true,
    };

    // Instantly append message to thread (0ms latency)
    setMessages((prev) => [...prev, optimisticMsg]);

    // Instantly update conversations list lastMessage in sidebar
    setConversations((prev) =>
      prev.map((c) => {
        if (c._id === activeConversation._id) {
          return {
            ...c,
            lastMessage: {
              text: trimmedText,
              senderId: user._id,
              createdAt: new Date().toISOString(),
            },
          };
        }
        return c;
      })
    );

    const messageData = {
      conversationId: activeConversation._id,
      senderId: user._id,
      text: trimmedText,
    };

    // Emit via socket if available
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("send_message", messageData);
    }

    // Persist via REST API
    try {
      const res = await api.post("/chat/messages", messageData);
      if (res.data?.success === 1 && res.data.message) {
        const savedMessage = res.data.message;
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? savedMessage : m))
        );
      }
    } catch (err) {
      console.error("sendMessage error:", err);
      toast.error("Failed to send message");
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

  const deleteConversation = async (conversationId) => {
    try {
      const res = await api.delete(`/chat/conversations/${conversationId}`);
      if (res.data?.success === 1) {
        setConversations((prev) => prev.filter((c) => c._id !== conversationId));
        if (activeConversation?._id === conversationId) {
          setActiveConversation(null);
          setMessages([]);
        }
        toast.success("Conversation removed");
      }
    } catch (err) {
      console.error("deleteConversation error:", err);
      toast.error(err.response?.data?.message || "Failed to delete conversation");
    }
  };

  // Calculate total unread messages
  const unreadTotal = conversations.reduce((total, conv) => {
    // If the conversation is currently active and open, its messages are already viewed
    if (isChatOpen && activeConversation?._id === conv._id) {
      return total;
    }

    if (user?._id && conv.unreadCount) {
      let count = 0;
      if (conv.unreadCount instanceof Map) {
        count = conv.unreadCount.get(String(user._id)) || conv.unreadCount.get(user._id) || 0;
      } else if (typeof conv.unreadCount === "object") {
        count =
          conv.unreadCount[user._id] ||
          conv.unreadCount[String(user._id)] ||
          0;
      }
      return total + (Number(count) > 0 ? Number(count) : 0);
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
        deleteConversation,
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
