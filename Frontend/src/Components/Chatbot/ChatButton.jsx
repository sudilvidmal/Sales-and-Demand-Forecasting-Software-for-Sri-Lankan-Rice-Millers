import { useState } from "react";
import ChatWindow from "./ChatWindow";

const ChatButton = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      {/* Only show ChatWindow */}
      {showChat && <ChatWindow onClose={() => setShowChat(false)} />}

      {/* If chat not opened yet, show Floating Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-5 right-5 p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-110 transition-transform z-50"
          aria-label="Open Chat"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H7l-5 5V5z" />
          </svg>
        </button>
      )}
    </>
  );
};

export default ChatButton;
