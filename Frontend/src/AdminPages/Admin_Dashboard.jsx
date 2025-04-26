import { useEffect, useState } from "react";
import Admin_Sidebar from "../Components/AdminComponents/Admin_Sidebar/Admin_sidebar";
import Admin_Navbar from "../Components/AdminComponents/Admin_Navbar/Admin_Navbar";
import AdminStatsCards from "../Components/AdminComponents/Admin_Dashboard_components/AdminStatsCards";
import ForecastCalendar from "../Components/AdminComponents/Admin_Dashboard_components/ForecastCalendar";
import ModelPerformanceSummary from "../Components/AdminComponents/Admin_Dashboard_components/ModelPerformanceSummary";
import { toast } from "react-toastify";
import PageLoader from "../Components/Common/PageLoader"; // ✅ Import

const Admin_Dashboard = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    userCount: 0,
    riceTypes: 0,
    activeModels: 0,
    activeAccounts: 0,
    inactiveAccounts: 0,
  });
  const [modelPerformance, setModelPerformance] = useState({
    mape: 0,
    r2_score: 0,
  });
  const [loading, setLoading] = useState(true); // ✅ Add loading state
  const [error, setError] = useState(""); // ✅ Add error state
  const [fadeIn, setFadeIn] = useState(false); // ✅ Add fade-in state

  const handleToggleSidebar = () => setShowSidebar(!showSidebar);
  const handleCloseSidebar = () => setShowSidebar(false);

  // Fetch model performance summary and dashboard stats
  const fetchData = async () => {
    try {
      setError(""); // Clear previous errors
      const token = localStorage.getItem("admin_token");
      const [statsRes, modelRes] = await Promise.all([
        fetch("http://localhost:8000/admin-dashboard/admin-stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8000/admin-dashboard/model-summary", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const statsData = await statsRes.json();
      const modelData = await modelRes.json();

      if (!statsRes.ok || !modelRes.ok) {
        throw new Error("Failed to fetch dashboard data.");
      }

      setDashboardStats(statsData);
      setModelPerformance({
        mape: modelData.mape || 0,
        r2_score: modelData.r2_percentage || 0,
      });
    } catch (error) {
      console.error("❌ Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setFadeIn(true), 100); // Smooth transition
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toast handler for calendar reminders
  const handleNotificationSent = (msg) => {
    toast.success(msg || "✅ Notification sent!");
  };

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      {/* 🔒 Mobile Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-20 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* 📚 Sidebar */}
      <Admin_Sidebar
        showSidebar={showSidebar}
        onCloseSidebar={handleCloseSidebar}
      />

      {/* 🧭 Navbar */}
      <Admin_Navbar onToggleSidebar={handleToggleSidebar} />

      {/* 📊 Main Content */}
      {loading ? (
        <div className="flex-1 flex flex-col md:ml-64 z-10 p-4 sm:p-6 overflow-auto mt-[64px]">
          <PageLoader pageType="admin-dashboard" />
        </div>
      ) : (
        <div
          className={`flex-1 flex flex-col md:ml-64 z-10 p-4 sm:p-6 overflow-auto mt-[64px] space-y-6 transition-all duration-700 ${
            fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
          aria-busy="false"
        >
          {/* 📛 Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded">
              ⚠️ {error}
              <button
                onClick={() => {
                  setLoading(true);
                  setError("");
                  fetchData();
                }}
                className="ml-4 text-blue-600 underline"
              >
                Retry
              </button>
            </div>
          )}
          <AdminStatsCards stats={dashboardStats} />
          <ForecastCalendar onNotificationSent={handleNotificationSent} />
          <ModelPerformanceSummary
            mape={modelPerformance.mape}
            r2_score={modelPerformance.r2_score}
          />
        </div>
      )}
    </div>
  );
};

export default Admin_Dashboard;