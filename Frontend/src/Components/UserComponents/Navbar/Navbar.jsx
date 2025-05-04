import { useState, useEffect } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { HiMenu } from "react-icons/hi";
import { FiBell } from "react-icons/fi";
import PropTypes from "prop-types";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Navbar = ({ onToggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshingPage, setRefreshingPage] = useState(false);

  // 🔁 Fetch notifications only
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:8000/notifications/get-user-notifications"
      );
      const data = await res.json();
      setNotifications(data || []);
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🚮 Dismiss notifications
  const clearNotifications = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/notifications/dismiss-user-notifications",
        { method: "PATCH" }
      );
      const data = await res.json();
      if (res.ok) {
        setNotifications([]);
        console.log("✅ Notifications dismissed:", data);
      }
    } catch (err) {
      console.error("❌ Failed to dismiss notifications:", err);
    }
  };

  // 🔄 Full page reload
  const handlePageRefresh = () => {
    setRefreshingPage(true);

    // Toast message
    toast.info("🔄 Page refreshing...", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      theme: "colored",
    });

    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-blue-400 px-4 py-3 md:py-4 flex items-center justify-between shadow-md h-[64px] md:ml-64 backdrop-blur-md bg-opacity-90"
        style={{
          backdropFilter: "blur(2px)",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.8), hsla(217, 100.00%, 93.30%, 0.70))",
        }}
      >
        {/* 🍔 Mobile Sidebar Toggle */}
        <button
          className="text-blue-500 text-2xl md:hidden focus:outline-none hover:text-gray-200 transition-all duration-200"
          onClick={onToggleSidebar}
        >
          <HiMenu />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* 🔔 Notifications & Refresh */}
        <div className="flex items-center gap-6 pr-2">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative text-blue-500 text-2xl hover:text-gray-200 transition-all duration-150 focus:outline-none"
              title="Notifications"
            >
              <FiBell />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-3 w-80 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-10 transition-transform duration-300 animate-fade-in-up scale-95 hover:scale-100 z-50 border border-gray-200"
                style={{
                  backdropFilter: "blur(2px)",
                  background:
                    "linear-gradient(135deg, rgba(15, 32, 70, 0.8), hsla(217, 69%, 39.2%, 0.7))",
                }}
              >
                {/* 🔔 Notifications List */}
                <div className="p-4 max-h-72 overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="flex justify-center items-center py-6">
                      <div className="h-5 w-5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-gray-300 text-sm">
                      <div className="text-3xl mb-2">📭</div>
                      <p>No new notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((note, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-3 bg-white/10 rounded-md text-gray-100 hover:bg-white/20 cursor-pointer transition-transform transform hover:scale-[1.02]"
                        >
                          {note.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 🔄 Notification Controls */}
                <div className="flex justify-between items-center border-t border-gray-400 px-4 py-3 bg-white/5 rounded-b-xl">
                  {/* Refresh Notifications */}
                  <button
                    onClick={fetchNotifications}
                    className="flex items-center gap-1 text-blue-200 text-xs font-semibold hover:underline hover:text-blue-300 transition-colors"
                  >
                    <FaSyncAlt className="text-sm" /> Refresh
                  </button>

                  {/* Clear All Notifications */}
                  <button
                    onClick={clearNotifications}
                    className="flex items-center gap-1 text-red-300 text-xs font-semibold hover:underline hover:text-red-400 transition-colors"
                  >
                    🗑 Clear All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Full Page Refresh */}
          <button
            onClick={handlePageRefresh}
            className="text-blue-500 text-2xl hover:text-gray-200 transition-all duration-150 focus:outline-none relative"
            title="Refresh Page"
          >
            {refreshingPage ? (
              <FaSyncAlt className="animate-spin" />
            ) : (
              <FaSyncAlt />
            )}
          </button>
        </div>
      </nav>

      {/* Toast Notifications */}
      <ToastContainer />
    </>
  );
};

Navbar.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
};

export default Navbar;
