import { useState } from "react";
import { FaSyncAlt, FaBars } from "react-icons/fa";
import PropTypes from "prop-types";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Admin_Navbar = ({ onToggleSidebar }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);

    // ✅ Show toast notification
    toast.info("🔄 Page refreshing...", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      theme: "colored",
    });

    // ✅ Then reload page after short delay
    setTimeout(() => {
      window.location.reload();
    }, 1200); // Slightly more than toast duration
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-400 px-4 py-3 md:py-4 flex items-center justify-between shadow-md h-[64px] md:ml-64 backdrop-blur-md bg-opacity-90">
        {/* Hamburger Icon (Mobile) */}
        <div className="md:hidden mr-4">
          <FaBars
            className="text-white text-2xl cursor-pointer hover:text-gray-200 transition-all duration-150"
            onClick={onToggleSidebar}
            title="Toggle Sidebar"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Icon Section */}
        <div className="flex items-center gap-x-6 pr-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="text-white text-2xl hover:text-gray-200 transition-all duration-150 focus:outline-none"
            title="Refresh Page"
          >
            {refreshing ? (
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

Admin_Navbar.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
};

export default Admin_Navbar;
