 
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  FiSend,
  FiX,
  FiRotateCcw,
  FiLock,
  FiMapPin,
  FiStar,
  FiExternalLink,
  FiMic,
  FiMicOff,
  FiCopy,
  FiCheck,
  FiDownload,
} from "react-icons/fi";
import { IoAirplane } from "react-icons/io5";
import { PulseLoader } from "react-spinners";
import api from "../../backend";

const QUICK_PROMPT_CHIPS = [
  "🏖️ Stays with Pool",
  "💰 Budget Deals under $50",
  "🗺️ Plan a 5-day Trip",
  "🌟 Top 5-Star Stays",
  "🍽️ Famous Food in Kolkata",
  "📅 Show My Bookings",
  "🛎️ Motel Check-in Rules",
  "🌤️ Best Season for Kerala",
];

const FormattedMessage = ({ content, isUser }) => {
  if (!content) return null;
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
        const cleanLine = isBullet ? line.trim().replace(/^[•-]\s*/, "") : line;

        const parts = [];
        let partIdx = 0;
        const boldRegex = /\*\*(.*?)\*\*/g;
        let match;
        let lastIndex = 0;

        while ((match = boldRegex.exec(cleanLine)) !== null) {
          if (match.index > lastIndex) {
            parts.push(cleanLine.substring(lastIndex, match.index));
          }
          parts.push(
            <strong
              key={`bold-${partIdx++}`}
              className={isUser ? "font-bold text-white" : "font-bold text-[#111827] dark:text-white"}
            >
              {match[1]}
            </strong>
          );
          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < cleanLine.length) {
          parts.push(cleanLine.substring(lastIndex));
        }

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1">
              <span className={isUser ? "text-white/80" : "text-[#ff385c] font-bold"}>•</span>
              <div className="flex-1 leading-relaxed">
                {parts.length > 0 ? parts : cleanLine}
              </div>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="leading-relaxed">
            {parts.length > 0 ? parts : line}
          </p>
        );
      })}
    </div>
  );
};

const AiChatWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "model",
      content: `Hello! 👋 I'm your **Journey Cuisine AI Concierge**.\n\nI can help you search verified motels, compare rates, plan day-by-day itineraries, explore famous regional food, calculate stay costs, and check your bookings. Where would you like to travel?`,
      listings: [],
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen]);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition error:", err);
        setIsListening(false);
      }
    }
  };

  const handleCopyItinerary = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleDownloadItinerary = (text, title = "Trip_Itinerary") => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendMessage = async (customPrompt) => {
    const promptToSend = typeof customPrompt === "string" ? customPrompt : inputValue;
    if (!promptToSend || !promptToSend.trim()) return;

    if (!user) {
      window.dispatchEvent(new Event("open-auth-popup"));
      return;
    }

    const userMessage = {
      role: "user",
      content: promptToSend.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.content)
        .slice(-8)
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          content: m.content,
        }));

      const res = await api.post("/ai/chat", {
        message: promptToSend.trim(),
        history: historyPayload,
      });

      if (res?.data?.success) {
        if (res.data.isTerminated) {
          setTimeout(() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.reload();
          }, 5000);
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: res.data.reply || "Here is what I found for you:",
            listings: res.data.listings || [],
            isWarning: res.data.isWarning,
            isTerminated: res.data.isTerminated,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content:
              res?.data?.error ||
              "I encountered an issue processing your request. Please try again.",
            listings: [],
          },
        ]);
      }
    } catch (err) {
      console.error("AI chat error:", err);
      const errMsg =
        err.response?.status === 401
          ? "Please sign in to continue chatting with Journey AI."
          : "Sorry, I had trouble connecting to the concierge. Please try again in a moment.";

      if (err.response?.status === 401) {
        window.dispatchEvent(new Event("open-auth-popup"));
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: errMsg,
          listings: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "model",
        content: `Hi ${
          user?.name?.firstName || "there"
        }! Chat history cleared. How can I help with your motel search, food recommendations, or travel plans?`,
        listings: [],
      },
    ]);
  };

  const handleOpenChat = () => {
    if (isFlying) return;
    setIsFlying(true);
    setTimeout(() => {
      setIsOpen(true);
      setIsFlying(false);
    }, 420);
  };

  return (
    <>
      {/* Floating Widget Trigger Button (Airplane Logo Only) */}
      <div className="fixed bottom-6 right-6 z-[1400] flex flex-col items-end">
        {!isOpen && (
          <button
            type="button"
            onClick={handleOpenChat}
            disabled={isFlying}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#ff385c] to-[#e00b41] hover:from-[#e00b41] hover:to-[#c00735] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white/30 overflow-visible"
            aria-label="Open AI Travel Assistant"
            title="Journey AI Travel Assistant"
          >
            {/* Wind Rays Contrail Animation */}
            {isFlying && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="absolute -bottom-1 -left-1 w-8 h-[2.5px] bg-gradient-to-l from-white via-white/80 to-transparent rounded-full animate-wind-ray-1 shadow-sm" />
                <div className="absolute -bottom-3 -left-3 w-12 h-[3px] bg-gradient-to-l from-white via-white/90 to-transparent rounded-full animate-wind-ray-2 shadow-sm" />
                <div className="absolute 1 -left-4 w-7 h-[2px] bg-gradient-to-l from-white via-white/70 to-transparent rounded-full animate-wind-ray-3 shadow-sm" />
              </div>
            )}

            <IoAirplane
              size={26}
              className={`transition-all ${
                isFlying
                  ? "animate-plane-takeoff"
                  : "-rotate-45 group-hover:rotate-0"
              }`}
            />
            {!isFlying && (
              <span className="flex h-3.5 w-3.5 absolute -top-0.5 -right-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-[#181818]"></span>
              </span>
            )}
          </button>
        )}

        {/* AI Chat Window */}
        {isOpen && (
          <div className="w-[92vw] sm:w-[440px] h-[600px] max-h-[85vh] bg-white dark:bg-[#181818] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Window Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#ff385c] to-[#e00b41] text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-full bg-white/20">
                  <IoAirplane size={18} className="-rotate-45" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">
                    Journey AI Concierge
                  </h3>
                  <p className="text-[10px] text-white/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Motels, Cuisine &amp; Trips • Live DB Grounded
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-white/80 hover:text-white">
                {user && (
                  <button
                    type="button"
                    onClick={handleClearChat}
                    title="Reset chat"
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <FiRotateCcw size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* If NOT logged in: Lock Card */}
            {!user ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-neutral-50 dark:bg-[#1e1e1e]">
                <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-[#ff385c] mb-4 shadow-xs">
                  <FiLock size={36} />
                </div>
                <h4 className="text-base font-bold text-[#111827] dark:text-white">
                  Sign in to chat with Journey AI
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 max-w-xs leading-relaxed mb-6">
                  Your personal AI travel assistant is ready to help you find the
                  cheapest stays, explore destinations, and plan your trips.
                </p>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("open-auth-popup"))}
                  className="w-full max-w-xs py-3 rounded-2xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <IoAirplane size={16} className="-rotate-45" /> Log In / Register to Chat
                </button>
              </div>
            ) : (
              /* If logged in: Full Chat Interface */
              <>
                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-neutral-50/50 dark:bg-[#121212]/50">
                  {messages.map((msg, index) => {
                    const isUser = msg.role === "user";
                    const isItinerary = !isUser && msg.content && msg.content.includes("Personalized Itinerary");

                    return (
                      <div
                        key={index}
                        className={`flex flex-col ${
                          isUser ? "items-end" : "items-start"
                        }`}
                      >
                        {/* Chat Bubble */}
                        <div
                          className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                            isUser
                              ? "bg-[#ff385c] text-white rounded-br-xs shadow-xs font-medium"
                              : "bg-white dark:bg-[#222222] text-[#111827] dark:text-[#efefef] border border-neutral-200 dark:border-neutral-800 rounded-bl-xs shadow-xs"
                          }`}
                        >
                          <FormattedMessage content={msg.content} isUser={isUser} />
                        </div>

                        {/* Itinerary Action Tools (Copy & Download) */}
                        {isItinerary && (
                          <div className="flex items-center gap-2 mt-1.5 pl-1">
                            <button
                              type="button"
                              onClick={() => handleCopyItinerary(msg.content, index)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
                            >
                              {copiedIndex === index ? (
                                <>
                                  <FiCheck className="text-emerald-500" size={11} /> Copied!
                                </>
                              ) : (
                                <>
                                  <FiCopy size={11} /> Copy Plan
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadItinerary(msg.content, "Trip_Plan")}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
                            >
                              <FiDownload size={11} /> Download (.txt)
                            </button>
                          </div>
                        )}

                        {/* Interactive Listing Recommendation Cards (Horizontal Carousel) */}
                        {!isUser && msg.listings && msg.listings.length > 0 && (
                          <div className="mt-2.5 w-full space-y-1.5 max-w-full">
                            <div className="flex items-center justify-between pr-1">
                              <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Recommended Stays ({msg.listings.length})
                              </p>
                              <span className="text-[10px] text-neutral-400">
                                Swipe &rarr;
                              </span>
                            </div>
                            <div className="flex flex-row overflow-x-auto gap-2.5 pb-2 pt-1 no-scrollbar snap-x scroll-smooth">
                              {msg.listings.map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => navigate(`/rooms/${item.id}`)}
                                  className="w-[185px] shrink-0 snap-start flex flex-col p-2 rounded-2xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700/80 hover:border-[#ff385c] dark:hover:border-[#ff385c] shadow-xs hover:shadow-md transition-all cursor-pointer group"
                                >
                                  {item.thumbnail ? (
                                    <img
                                      src={item.thumbnail}
                                      alt={item.title}
                                      className="w-full h-24 object-cover rounded-xl group-hover:scale-[1.02] transition-transform"
                                    />
                                  ) : (
                                    <div className="w-full h-24 rounded-xl bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] text-neutral-500">
                                      No img
                                    </div>
                                  )}
                                  <div className="mt-2 flex flex-col flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <h5 className="font-bold text-[#111827] dark:text-white truncate text-xs group-hover:text-[#ff385c] transition-colors">
                                        {item.title}
                                      </h5>
                                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500 shrink-0">
                                        <FiStar size={10} />
                                        {item.ratings || "New"}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1 mt-0.5">
                                      <FiMapPin size={9} />
                                      {item.location}
                                    </p>
                                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-neutral-100 dark:border-neutral-800/80">
                                      <span className="font-bold text-xs text-[#111827] dark:text-white">
                                        ${item.pricePerNight}
                                        <span className="text-[10px] font-normal text-neutral-500">
                                          {" "}
                                          /night
                                        </span>
                                      </span>
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#ff385c] group-hover:underline">
                                        View <FiExternalLink size={9} />
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Loading typing bubble */}
                  {isLoading && (
                    <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 text-neutral-500 w-20 shadow-xs">
                      <PulseLoader color="#ff385c" size={5} margin={2} />
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Horizontal Quick Action Chips */}
                <div className="px-3 py-2 bg-neutral-100/80 dark:bg-[#1a1a1a] border-t border-neutral-200 dark:border-neutral-800 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
                  {QUICK_PROMPT_CHIPS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-[#252525] hover:bg-neutral-200 dark:hover:bg-[#303030] text-neutral-700 dark:text-neutral-300 font-medium transition-all border border-neutral-200 dark:border-neutral-700 cursor-pointer whitespace-nowrap shrink-0 hover:scale-105 active:scale-95"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar with Voice Button */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 bg-white dark:bg-[#181818] border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 shrink-0"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      isListening
                        ? "Listening... Speak now 🎙️"
                        : "Ask about motels, food, cost, trips, bookings..."
                    }
                    disabled={isLoading}
                    className={`flex-1 p-2.5 rounded-2xl border ${
                      isListening
                        ? "border-rose-500 ring-2 ring-rose-400 bg-rose-50/20"
                        : "border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#252525]"
                    } text-[#111827] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#ff385c]`}
                  />

                  {/* Speech to Text Microphone Button */}
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    title={isListening ? "Stop listening" : "Speak your message"}
                    className={`p-2.5 rounded-2xl transition-all shadow-xs cursor-pointer shrink-0 ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse ring-2 ring-rose-400"
                        : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {isListening ? <FiMicOff size={15} /> : <FiMic size={15} />}
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="p-2.5 rounded-2xl bg-[#ff385c] hover:bg-[#d90b63] disabled:opacity-40 text-white transition-all shadow-xs cursor-pointer shrink-0"
                    aria-label="Send message"
                  >
                    <FiSend size={15} />
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AiChatWidget;
