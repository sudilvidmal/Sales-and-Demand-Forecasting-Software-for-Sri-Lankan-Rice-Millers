import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

const helpTopicsList = [
  "How to upload sales data",
  "How to manually add sales data",
  "How to view sales reports",
  "How to logout",
  "How to reset password",
  "How to check low stock",
  "How to generate forecast",
];

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [bounce, setBounce] = useState(false);

  const messageEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          chatContainerRef.current;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
      }
    };
    const container = chatContainerRef.current;
    if (container) container.addEventListener("scroll", handleScroll);
    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSend = async (customQuestion = null) => {
    const question = customQuestion || userInput.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    setUserInput("");
    setLoading(true);
    setShowHelpPanel(false);

    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch("http://localhost:8000/chatbot/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", text: data.answer }]);
        setLoading(false);
        if (isMinimized) setBounce(true);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Error connecting to server." },
      ]);
      setLoading(false);
    }
  };

  const handleShowHelp = () => setShowHelpPanel(true);
  const handleMinimize = () => setIsMinimized(true);
  const handleRestore = () => setIsMinimized(false);

  return (
    <>
      {/* Bubble */}
      <button
        onClick={handleRestore}
        className={`fixed bottom-5 right-5 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 z-50 ${
          bounce ? "animate-bounce" : ""
        }`}
        aria-label="Open Chat"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H7l-5 5V5z" />
        </svg>
      </button>

      {/* Chat Window */}
      {!isMinimized && (
        <div className="fixed bottom-24 right-5 bg-white/80 backdrop-blur-md border rounded-2xl shadow-2xl w-[400px] max-h-[90vh] flex flex-col overflow-hidden z-50 transform scale-95 opacity-0 animate-grow-out transition-all duration-500">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-2xl shadow">
            <span className="font-semibold">Chatbot Assistant 🤖</span>
            <div className="flex gap-2">
              <button
                onClick={handleMinimize}
                className="hover:text-gray-300 text-xl"
              >
                ➖
              </button>
              <button onClick={onClose} className="hover:text-gray-300 text-xl">
                ✖️
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-5 overflow-y-auto space-y-4 relative bg-white/60 backdrop-blur-sm"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-xl max-w-[70%] text-sm shadow-md ${
                    msg.sender === "user"
                      ? "bg-blue-100 hover:bg-blue-200"
                      : "bg-gray-100 hover:bg-gray-200"
                  } transition-all`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-2 rounded-xl bg-gray-100 animate-pulse text-sm">
                  Typing...
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="absolute right-4 bottom-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow hover:bg-blue-700 transition-all"
              >
                ⬇️
              </button>
            )}
          </div>

          {/* Input + Help */}
          <div className="p-4 border-t bg-white/80 backdrop-blur-sm flex flex-col space-y-2 rounded-b-2xl">
            <button
              onClick={handleShowHelp}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-600 hover:to-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-all"
            >
              📋 Show Help Topics
            </button>

            <div className="flex">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 p-2 border border-gray-300 rounded-l-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <button
                onClick={() => handleSend()}
                className="bg-blue-600 text-white px-5 rounded-r-lg hover:bg-blue-700 text-sm transition-all"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Topics Panel */}
      {showHelpPanel && (
        <div
          className="fixed bottom-24 right-[27rem] bg-white/90 border rounded-2xl shadow-2xl w-64 max-h-[70vh] overflow-y-auto p-4 space-y-3 z-40 transform scale-90 opacity-0 animate-grow-out-help transition-all duration-500"
          style={{
            backdropFilter: "blur(2px)",
            background:
              "linear-gradient(135deg, rgba(15, 32, 70, 0.8), hsla(217, 69%, 39.2%, 0.7))",
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-white">📋 Help Topics</span>
            <button
              onClick={() => setShowHelpPanel(false)}
              className="text-gray-300 hover:text-white text-lg"
            >
              ✖️
            </button>
          </div>

          {helpTopicsList.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(topic)}
              className="text-left text-white hover:underline hover:text-blue-200 text-sm block w-full transition-all"
            >
              ➔ {topic}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

ChatWindow.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ChatWindow;
