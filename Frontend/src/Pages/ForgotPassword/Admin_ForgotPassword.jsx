import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AdminForgotPassword() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/admin-forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("✅ Password reset link sent successfully!");
        navigate("/Admin-Login");
      } else {
        toast.error(result.detail || "Failed to send reset link.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center animate-fade-in">
        {/* 🔑 Title with Icon */}
        <div className="mb-8">
          <div className="flex justify-center mb-2">
            <span className="text-4xl">🔐</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">
            Admin Password Reset
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Enter your admin username and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* 🧩 Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Admin Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your admin username"
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-lg transition duration-300"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
