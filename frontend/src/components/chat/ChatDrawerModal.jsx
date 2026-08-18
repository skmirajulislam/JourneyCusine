import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../hooks/useAuth";
import {
  FiX,
  FiSend,
  FiMessageSquare,
  FiChevronLeft,
  FiHome,
  FiCheck,
  FiUser,
  FiTrash2,
} from "react-icons/fi";
import { useCurrency } from "../../context/CurrencyContext";

const QUICK_INQUIRIES = [
  "Is early check-in available?",
  "What is the Wi-Fi speed?",
  "Are pets allowed on the property?",
  "Can I add homemade breakfast for my stay?",
  "Is parking free on premise?",
];

const ChatDrawerModal = () => {
  const { user } = useAuth();
  const {
    isChatOpen,
    setIsChatOpen,
    conversations,
    activeConversation,
    selectConversation,
    messages,
    sendMessage,
    deleteConversation,
    isLoadingMessages,
    isTyping,
    typingUser,
    socket,
  } = useChat();
  const { formatPrice } = useCurrency();

  const [inputText, setInputText] = useState("");
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const messagesEndRef = useRef(null);

  // When active conversation is loaded/selected, show thread on mobile
  useEffect(() => {
    if (activeConversation) {
      setMobileShowThread(true);
    }
  }, [activeConversation]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isChatOpen]);

  const otherParticipant = useMemo(() => {
    if (!activeConversation?.participants) return null;
    const found = activeConversation.participants.find(
      (p) => String(p?._id || p) !== String(user?._id)
    );
    if (typeof found === "object" && found !== null && found.name) {
      return found;
    }
    // Fallback: lookup in conversations cache
    const matchedConv = conversations.find((c) => c._id === activeConversation._id);
    const populatedFromConv = matchedConv?.participants?.find(
      (p) => typeof p === "object" && String(p?._id) !== String(user?._id)
    );
    return populatedFromConv || (typeof found === "object" ? found : null);
  }, [activeConversation, conversations, user?._id]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(inputText);
    setInputText("");

    // Stop typing notification
    if (socket && activeConversation?._id) {
      socket.emit("stop_typing", {
        conversationId: activeConversation._id,
        senderId: user?._id,
      });
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    // Emit typing status
    if (socket && activeConversation?._id && user?._id) {
      if (e.target.value.length > 0) {
        socket.emit("typing", {
          conversationId: activeConversation._id,
          senderName: user.name?.firstName || "Guest",
          senderId: user._id,
        });
      } else {
        socket.emit("stop_typing", {
          conversationId: activeConversation._id,
          senderId: user._id,
        });
      }
    }
  };

  if (!isChatOpen) return null;

  return (
    <div
      onClick={() => setIsChatOpen(false)}
      className="fixed inset-0 z-[2500] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.98 }}
        transition={{ duration: 0.22 }}
        className="w-full sm:max-w-4xl h-full sm:h-[650px] bg-white dark:bg-[#181818] rounded-none sm:rounded-[28px] md:rounded-[32px] overflow-hidden shadow-2xl border-0 sm:border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row relative"
      >
        {/* LEFT COLUMN: Conversations List */}
        <div
          className={`w-full sm:w-[320px] sm:shrink-0 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full bg-neutral-50/50 dark:bg-[#141414] ${
            mobileShowThread && activeConversation ? "hidden sm:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-[#ff385c]">
                <FiMessageSquare size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Messages &amp; Inquiries
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* List of Conversations */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="py-12 px-4 text-center text-neutral-500 dark:text-neutral-400">
                <FiMessageSquare size={28} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
                <p className="text-xs font-semibold">No messages yet</p>
                <p className="text-[11px] mt-1 text-neutral-400">
                  Click &ldquo;Contact Host&rdquo; on any property to ask questions before booking!
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = activeConversation?._id === conv._id;
                const partner = conv.participants?.find(
                  (p) => String(p._id || p) !== String(user?._id)
                );
                const partnerName = partner?.name
                  ? `${partner.name.firstName || ""} ${partner.name.lastName || ""}`.trim()
                  : "Host";

                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      selectConversation(conv);
                      setMobileShowThread(true);
                    }}
                    className={`group relative w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-[#222222] shadow-xs border border-neutral-200 dark:border-neutral-700"
                        : "hover:bg-neutral-100 dark:hover:bg-[#1a1a1a]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0 font-bold text-xs uppercase overflow-hidden">
                      {partner?.profileImg ? (
                        <img
                          src={partner.profileImg}
                          alt={partnerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        partnerName[0] || <FiUser size={16} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {partnerName}
                        </h4>
                        {conv.lastMessage?.createdAt && (
                          <span className="text-[10px] text-neutral-400">
                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      {conv.listingId?.title && (
                        <p className="text-[10px] text-[#ff385c] font-semibold truncate mt-0.5">
                          🏠 {conv.listingId.title}
                        </p>
                      )}

                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {conv.lastMessage?.text || "Started conversation"}
                      </p>
                    </div>

                    <button
                      type="button"
                      title="Delete conversation"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv._id);
                      }}
                      className="absolute right-2 top-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-400 hover:text-rose-500 transition-all cursor-pointer"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Thread */}
        <div
          className={`flex-1 flex flex-col h-full bg-white dark:bg-[#181818] ${
            mobileShowThread && activeConversation ? "flex" : "hidden sm:flex"
          }`}
        >
          {activeConversation ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-3.5 sm:p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-[#181818]">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                  <button
                    type="button"
                    onClick={() => setMobileShowThread(false)}
                    className="sm:hidden p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0"
                    title="Back to conversations"
                  >
                    <FiChevronLeft size={22} />
                  </button>

                  <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-xs uppercase shrink-0 overflow-hidden">
                    {otherParticipant?.profileImg ? (
                      <img
                        src={otherParticipant.profileImg}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      otherParticipant?.name?.firstName?.[0] || <FiUser size={16} />
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <span>
                        {otherParticipant?.name
                          ? `${otherParticipant.name.firstName || ""} ${otherParticipant.name.lastName || ""}`.trim()
                          : "Host"}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Online" />
                    </h4>
                    {activeConversation.listingId && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-[200px] sm:max-w-sm flex items-center gap-1">
                        <FiHome size={11} className="text-[#ff385c]" />
                        <span>{activeConversation.listingId.title}</span>
                        {activeConversation.listingId.basePrice && (
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            • {formatPrice(activeConversation.listingId.basePrice)}/night
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/40 dark:bg-[#121212]">
                {isLoadingMessages ? (
                  <div className="py-20 text-center text-xs text-neutral-400">Loading message history...</div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Send a message to start this inquiry!
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1 max-w-xs mx-auto">
                      Ask about check-in flexibility, special meal options, or parking rules.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = String(msg.senderId?._id || msg.senderId) === String(user?._id);

                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                            isMe
                              ? "bg-[#ff385c] text-white rounded-br-xs font-medium"
                              : "bg-white dark:bg-[#252525] text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-bl-xs"
                          }`}
                        >
                          {msg.text}
                        </div>

                        <span className="text-[9px] text-neutral-400 mt-1 px-1 flex items-center gap-1">
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {isMe && <FiCheck size={10} className="text-emerald-500" />}
                        </span>
                      </div>
                    );
                  })
                )}

                {/* Real-time Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-neutral-500 italic bg-white dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700 rounded-2xl px-3 py-2 w-fit">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce delay-200" />
                    </span>
                    <span>{typingUser} is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Inquiry Suggestions */}
              <div className="px-3 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#181818] overflow-x-auto flex gap-1.5 no-scrollbar">
                {QUICK_INQUIRIES.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="shrink-0 px-2.5 py-1 rounded-full text-[11px] bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 hover:text-[#ff385c] dark:hover:bg-rose-950/40 text-neutral-600 dark:text-neutral-300 font-medium transition cursor-pointer"
                  >
                    + {q}
                  </button>
                ))}
              </div>

              {/* Message Input Form */}
              <form
                onSubmit={handleSend}
                className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type a message to the host..."
                  value={inputText}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#252525] text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-2xl bg-[#ff385c] hover:bg-[#d90b63] disabled:opacity-40 text-white transition cursor-pointer shadow-xs"
                >
                  <FiSend size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500 dark:text-neutral-400 relative">
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer"
                title="Close chat"
              >
                <FiX size={20} />
              </button>
              <div className="p-4 rounded-3xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mb-3">
                <FiMessageSquare size={36} />
              </div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                Select a conversation
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs">
                Pick a host inquiry on the left or send a message directly from any listing page.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ChatDrawerModal;
