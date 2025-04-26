import { MdDashboard, MdInventory2 } from "react-icons/md";

import { FaUser, FaUserShield, FaTimes, FaChartLine } from "react-icons/fa";
import { RiLineChartLine } from "react-icons/ri";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Admin_Account from "../Admin_Account/Admin_Account";

const Admin_Sidebar = ({ showSidebar, onCloseSidebar }) => {
  const [username, setUsername] = useState("");
  const [adminInfo, setAdminInfo] = useState(null);
  const [showAccountPopup, setShowAccountPopup] = useState(false);

  useEffect(() => {
    const adminId = localStorage.getItem("admin_id");
    const token = localStorage.getItem("admin_token");

    if (adminId && token) {
      fetch(`http://localhost:8000/admin/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Unauthorized");
          return res.json();
        })
        .then((data) => {
          setUsername(data.fullName);
          setAdminInfo({
            ...data,
            profilePic: data.profilePic
              ? `http://localhost:8000${data.profilePic}`
              : "https://randomuser.me/api/portraits/men/1.jpg",
            status: "online", // ✅ Simulated status for now (you can later make it dynamic from backend!)
          });
        })
        .catch((err) => {
          console.error("❌ Failed to fetch admin info:", err);
          setUsername("Guest");
          setAdminInfo({
            fullName: "Guest",
            profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
            status: "offline", // Guest assumed offline
          });
        });
    } else {
      setUsername("Guest");
      setAdminInfo({
        fullName: "Guest",
        profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
        status: "offline",
      });
    }
  }, []);

  // ✅ Dynamic Badge Color
  const getBadgeColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-400";
      case "away":
        return "bg-yellow-400";
      case "offline":
      default:
        return "bg-red-400";
    }
  };

  // ✅ Dynamic Tooltip Text
  const getStatusText = (status) => {
    switch (status) {
      case "online":
        return "Online";
      case "away":
        return "Away";
      case "offline":
      default:
        return "Offline";
    }
  };

  return (
    <>
      {/* Sidebar Container */}
      <div
        className={`bg-white/90 backdrop-blur-md fixed top-0 left-0 h-full w-64 px-4 py-6 shadow-2xl border-r border-gray-200 z-30 transform transition-transform duration-300 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Close Button (mobile) */}
        <div className="md:hidden flex justify-end mb-4">
          <button onClick={onCloseSidebar}>
            <FaTimes className="text-gray-600 text-xl" />
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img
            src="src/assets/Images/salesanddemandhome.jpg"
            alt="Sales and Demand Logo"
            className="h-16 object-contain"
          />
        </div>

        {/* Navigation */}
        <ul className="space-y-3 mb-8">
          {[
            {
              to: "/Admin_Dashboard",
              label: "Dashboard",
              icon: <MdDashboard />,
            },
            {
              to: "/Admin_Section_User_Page",
              label: "User Management",
              icon: <FaUser />,
            },
            {
              to: "/Admin_Section_Admin_Page",
              label: "Admin Management",
              icon: <FaUserShield />,
            },
            {
              to: "/Forecast_Model",
              label: "Forecast Model",
              icon: <RiLineChartLine />,
            },
            {
              to: "/Admin_Inventory",
              label: "Inventory Management",
              icon: <MdInventory2 />,
            },
            {
              to: "/Admin_Sales_Management",
              label: "Sales Management",
              icon: <FaChartLine />,
            },
          ].map(({ to, label, icon }, idx) => (
            <li key={idx}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-500"
                      : "text-gray-700 hover:bg-gray-100 hover:pl-5"
                  }`
                }
              >
                <div className="text-blue-500 text-xl">{icon}</div>
                <span className="text-sm">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

    
        {/* Admin Footer with Dynamic Badge + Tooltip */}
        <div
          onClick={() => setShowAccountPopup(true)}
          className="absolute bottom-6 left-4 w-[90%] bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg shadow-md flex items-center gap-4 cursor-pointer hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
        >
          <div className="relative group">
            <img
              src={adminInfo?.profilePic}
              alt="Admin Profile"
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
            />
            {/* Dynamic Online Badge */}
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${getBadgeColor(
                adminInfo?.status
              )} border-2 border-white rounded-full animate-ping`}
            ></span>
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${getBadgeColor(
                adminInfo?.status
              )} border-2 border-white rounded-full`}
            ></span>

            {/* Dynamic Tooltip */}
            <div className="absolute bottom-10 right-0 hidden group-hover:flex bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-lg transition-all duration-200 ease-in-out">
              {getStatusText(adminInfo?.status)}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 text-sm md:text-base">
              {username}
            </span>
            <span className="text-xs text-gray-500">Admin</span>
          </div>

          <div className="ml-auto text-blue-400 text-xl font-bold pr-1">⋮</div>
        </div>
      </div>

      {/* Admin Profile Popup */}
      {showAccountPopup && (
        <Admin_Account
          admin={adminInfo}
          onClose={() => setShowAccountPopup(false)}
        />
      )}
    </>
  );
};

Admin_Sidebar.propTypes = {
  showSidebar: PropTypes.bool.isRequired,
  onCloseSidebar: PropTypes.func.isRequired,
};

export default Admin_Sidebar;
