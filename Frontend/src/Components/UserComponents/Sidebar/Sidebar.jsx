import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { MdDashboard, MdInventory } from "react-icons/md";
import { AiOutlineUpload} from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FaChartLine } from "react-icons/fa";
import { MdPointOfSale } from "react-icons/md";
import User_Account from "../User_Account/User_Account";
import PropTypes from "prop-types";

const Sidebar = ({ showSidebar, onCloseSidebar }) => {
  const [user, setUser] = useState(null);
  const [showUserAccount, setShowUserAccount] = useState(false);

  const fetchUser = async () => {
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("user_token");

    if (!userId || !token) return;

    try {
      const res = await fetch(`http://localhost:8000/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await res.json();
      const profilePic = data.profilePic
        ? data.profilePic.startsWith("http")
          ? data.profilePic
          : `http://localhost:8000${data.profilePic}`
        : "https://randomuser.me/api/portraits/men/2.jpg";

      setUser({ ...data, profilePic });
    } catch (err) {
      console.error("User fetch failed:", err);
      setUser({
        fullName: "Guest",
        username: "guest",
        email: "guest@example.com",
        role: "User",
        phone: "",
        bio: "",
        profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden ${
          showSidebar ? "block" : "hidden"
        }`}
        onClick={onCloseSidebar}
      ></div>

      {/* Sidebar */}
      <div
        className={`bg-white/90 backdrop-blur-md fixed top-0 left-0 h-full w-64 px-4 py-6 shadow-2xl border-r border-gray-200 z-40 transform transition-transform duration-300 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{
          backdropFilter: "blur(2px)",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.8), hsla(217, 100.00%, 93.30%, 0.70))",
        }}
      >
        {/* Close Button (mobile) */}
        <div className="md:hidden flex justify-end mb-4">
          <button onClick={onCloseSidebar}>
            <span className="text-2xl text-gray-700">×</span>
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img
            src="/src/assets/Images/salesanddemandhome.jpg"
            alt="Sales and Demand Logo"
            className="h-16 object-contain"
          />
        </div>

        {/* Navigation */}
        <ul className="space-y-3 mb-8">
          {[
            { to: "/Dashboard", label: "Dashboard", icon: <MdDashboard /> },
            {
              to: "/DataEntryUser",
              label: "Upload Data",
              icon: <AiOutlineUpload />,
            },
            { to: "/Forecast", label: "Forecast", icon: <FaChartLine /> },
            { to: "/Sales", label: "Sales", icon: <MdPointOfSale /> },
            { to: "/Inventory", label: "Inventory", icon: <MdInventory /> },
            { to: "/SearchData", label: "Search Data", icon: <FiSearch /> },
            {
              to: "/Report",
              label: "Reports",
              icon: <HiOutlineDocumentReport />,
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

        

        {/* Stylish User Footer with Online Badge + Tooltip */}
        {user && (
          <div
            onClick={() => setShowUserAccount(true)}
            className="absolute bottom-6 left-4 w-[90%] bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg shadow-md flex items-center gap-4 cursor-pointer hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
          >
            <div className="relative group">
              <img
                src={user.profilePic}
                alt="User Profile"
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
              />
              {/* Animated Online Badge */}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full animate-ping"></span>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></span>

              {/* Tooltip */}
              <div className="absolute bottom-10 right-0 hidden group-hover:flex bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-lg transition-all duration-200 ease-in-out">
                Online
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 text-sm md:text-base">
                {user.fullName}
              </span>
              <span className="text-xs text-gray-500">@{user.username}</span>
            </div>

            <div className="ml-auto text-blue-400 text-xl font-bold pr-1">
              ⋮
            </div>
          </div>
        )}
      </div>

      {/* User Account Modal */}
      {showUserAccount && user && (
        <User_Account
          user={user}
          onClose={() => setShowUserAccount(false)}
          onProfileUpdate={fetchUser}
        />
      )}
    </>
  );
};

Sidebar.propTypes = {
  showSidebar: PropTypes.bool.isRequired,
  onCloseSidebar: PropTypes.func.isRequired,
};

export default Sidebar;
