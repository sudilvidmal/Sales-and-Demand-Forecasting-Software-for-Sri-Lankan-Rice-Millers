import { useState } from "react";
import Sidebar from "./UserComponents/Sidebar/Sidebar";
import Navbar from "./UserComponents/Navbar/Navbar";
import ChatButton from "./Chatbot/ChatButton"; // ✅ import ChatButton
import PropTypes from "prop-types";

const Layout = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      {/* Sidebar */}
      <Sidebar
        showSidebar={showSidebar}
        onCloseSidebar={() => setShowSidebar(false)}
      />

      {/* Mobile Sidebar Backdrop */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-10 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Navbar */}
      <Navbar onToggleSidebar={() => setShowSidebar(!showSidebar)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 z-0 p-4 sm:p-6 overflow-auto mt-[64px]">
        {children}
      </div>

      {/* 🔥 Chatbot Floating Button */}
      <ChatButton />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
