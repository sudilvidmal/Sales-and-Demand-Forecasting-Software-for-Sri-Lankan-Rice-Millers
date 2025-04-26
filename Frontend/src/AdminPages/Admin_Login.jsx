import { useState } from "react";
import { useNavigate } from "react-router-dom";
import salesanddemand from "../assets/images/salesanddemand.png";
import { ShieldCheck, Eye, EyeOff } from "lucide-react"; // ✅ Added Eye icons
import { toast } from "react-toastify";

export default function Admin_LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ New state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("admin_token", result.access_token);
        localStorage.setItem("admin_id", result.admin.id);
        localStorage.setItem("admin_username", result.admin.username);

        toast.success("✅ Login successful!");
        navigate("/Admin_Dashboard");
      } else {
        setError(
          typeof result.detail === "string" ? result.detail : "Login failed."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleReset = () => {
    setUsername("");
    setPassword("");
    setError("");
  };

  return (
    <div className="relative h-screen bg-cover bg-center flex items-center justify-center login-background">
      {/* Top Right Icons */}
      <div className="absolute top-6 right-6 flex space-x-4">
        <div
          onClick={() => (window.location.href = "/LoginPage")}
          className="cursor-pointer text-white hover:text-blue-300 transition"
          title="Go to User Login"
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A11.955 11.955 0 0112 15c2.206 0 4.254.594 6.004 1.612M15 11a3 3 0 10-6 0 3 3 0 006 0z"
            />
          </svg>
        </div>
        <div
          onClick={() => (window.location.href = "/Admin-Login")}
          className="cursor-pointer text-white hover:text-red-400 transition"
          title="Admin Login"
        >
          <ShieldCheck size={32} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full max-w-6xl items-center justify-between">
        {/* Left Content */}
        <div className="flex flex-col items-start w-1/2 ml-30">
          <img
            src={salesanddemand}
            alt="Rice Forecast"
            className="w-140 h-auto mb-4"
          />
          <p className="text-lg font-bold text-white ml-49">
            Document Management System
          </p>
          <p className="text-sm font-light text-white mt-2 ml-49">
            © 2025 Rice Miller Forecast Pvt Ltd
          </p>
        </div>

        {/* Login Card */}
        <div
          className="w-1/3 p-8 rounded-xl shadow-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 32, 70, 0.8), hsla(217, 69.00%, 39.20%, 0.70))",
            backdropFilter: "blur(2px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Admin Login
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm text-white mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full px-4 py-2 bg-white bg-opacity-80 border border-white rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Password */}
            <div className="mb-4 relative">
              <label
                htmlFor="password"
                className="block text-sm text-white mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2 bg-white bg-opacity-80 border border-white rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {/* 👁️ Eye Icon */}
              <div
                className="absolute inset-y-0 right-3 top-8 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            {/* Forgot Password */}
            <div className="flex items-center justify-between mb-4 text-white">
              <button
                type="button"
                onClick={() => navigate("/AdminForgotPassword")}
                className="text-sm text-blue-300 hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#333C4D] to-[#0B0E14] hover:from-blue-500 hover:to-blue-700 text-white py-2 rounded-lg shadow-lg transition duration-300"
            >
              Login
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="w-full mt-4 bg-[#AEC9FF] hover:bg-gray-400 text-white py-2 rounded-lg shadow-lg transition duration-300"
            >
              Reset
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
