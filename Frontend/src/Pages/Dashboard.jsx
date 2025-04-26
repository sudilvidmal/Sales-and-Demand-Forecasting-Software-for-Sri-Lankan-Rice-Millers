import { useState, useEffect } from "react";
import axios from "axios";


import KPICard from "../Components/UserComponents/Dashboard_components/KPICard";
import Chart from "../Components/UserComponents/Dashboard_components/Chart";
import D_list_one from "../Components/UserComponents/Dashboard_components/D_list_one";
import D_list_two from "../Components/UserComponents/Dashboard_components/D_list_two";
import Layout from "../Components/Layout";
import PageLoader from "../Components/Common/PageLoader"; // ✅ Import PageLoader

const Dashboard = () => {
  const [kpiData, setKpiData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [stockLevels, setStockLevels] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // ✅ Add error state
  const [fadeIn, setFadeIn] = useState(false); // ✅ Add fade-in state

  // 🔁 Fetch All Dashboard Data
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("user_token");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [kpiRes, chartRes, stockRes, logRes] = await Promise.all([
          axios.get("http://localhost:8000/user/dashboard/kpi", { headers }),
          axios.get("http://localhost:8000/user/dashboard/charts", { headers }),
          axios.get(
            "http://localhost:8000/user/dashboard/current-stock-levels",
            { headers }
          ),
          axios.get("http://localhost:8000/user/dashboard/system-logs", {
            headers,
          }),
        ]);

        setKpiData(kpiRes.data);
        setChartData(chartRes.data);
        setStockLevels(stockRes.data.stock_levels || []);
        setSystemLogs(logRes.data.logs || []);
      } catch (err) {
        console.error("❌ Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
        setTimeout(() => setFadeIn(true), 100); // ✅ Smooth transition
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      {loading ? (
        <PageLoader pageType="dashboard" /> // ✅ Use PageLoader
      ) : (
        <div
          className={`flex-1 flex flex-col p-4 sm:p-6 overflow-auto transition-all duration-700 ${
            fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
          aria-busy="false"
        >
          {/* 📛 Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded mb-6">
              ⚠️ {error}
            </div>
          )}

          {/* 📊 KPI Cards */}
          <div className="mt-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData ? (
              <>
                <KPICard
                  title="Today's Sales"
                  value={`${kpiData?.todaysSales?.toFixed(2) || "0.00"} kg`}
                  percentage={kpiData?.todaysSalesTrend ?? 0}
                  trend={kpiData?.todaysSalesTrend >= 0 ? "up" : "down"}
                  icon="🛒"
                />
                <KPICard
                  title="Next 30 Days Forecast"
                  value={`${
                    kpiData?.forecastNext30Days?.toFixed(2) || "0.00"
                  } kg`}
                  percentage={kpiData?.forecastTrend ?? 0}
                  trend={kpiData?.forecastTrend >= 0 ? "up" : "down"}
                  icon="📈"
                />
                <KPICard
                  title="Stock Remaining"
                  value={`${
                    kpiData?.totalStockRemaining?.toFixed(2) || "0.00"
                  } kg`}
                  percentage={kpiData?.stockTrend ?? 0}
                  trend={kpiData?.stockTrend >= 0 ? "up" : "down"}
                  icon="🏬"
                />
                <KPICard
                  title="Understock Alerts"
                  value={`${kpiData?.understockCount || 0} Types`}
                  percentage={0}
                  trend="down"
                  icon="⚠️"
                />
              </>
            ) : (
              <p className="text-sm text-red-500">
                ❌ Failed to load KPI data.
              </p>
            )}
          </div>

          {/* 📈 Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Chart
                title="Rice Sales (Last 7 Days)"
                type="line"
                data={chartData?.rice_sales_last_7_days || []}
              />
              <p className="text-gray-600 mt-3 text-sm">
                Daily sales trend across all rice types 📅
              </p>
              
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Chart
                title="Upcoming Forecasted Demand"
                type="bar"
                data={chartData?.forecasted_demand || []}
              />
              <p className="text-gray-600 mt-3 text-sm">
                Expected demand by rice type for the next 7–14 days 📊
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Chart
                title="Stock Movement Per Day"
                type="line"
                data={chartData?.stock_movement || []}
              />
              <p className="text-gray-600 mt-3 text-sm">
                Incoming vs outgoing stock activity 📦
              </p>
            </div>
          </div>

          {/* 📦 Stock Levels and System Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <D_list_one stockLevels={stockLevels} />
            </div>
            <div>
              <D_list_two logs={systemLogs} />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
