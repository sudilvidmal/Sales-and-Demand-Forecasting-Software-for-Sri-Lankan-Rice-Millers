import { useState, useEffect } from "react";
import axios from "axios";

import InventoryStatsCards from "../Components/UserComponents/Inventory/InventoryStatsCards";
import InventoryTable from "../Components/UserComponents/Inventory/InventoryTable";
import InventoryCharts from "../Components/UserComponents/Inventory/InventoryCharts";
import LowStockAlerts from "../Components/UserComponents/Inventory/LowStockAlerts";
import RemainingInventoryTable from "../Components/UserComponents/Inventory/RemainingInventoryTable";
import InventoryDepletionTable from "../Components/UserComponents/Inventory/InventoryDepletionTable";
import Layout from "../Components/Layout";
import PageLoader from "../Components/Common/PageLoader"; // ✅ Import PageLoader

const Inventory = () => {
  const [stats, setStats] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const [analysisData, setAnalysisData] = useState([]);
  const [depletionData, setDepletionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("user_token");

  // 🔁 Fetch overall stats
  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:8000/inventory/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch inventory stats", err);
      setError("Failed to load inventory stats.");
    }
  };

  // 📦 Fetch inventory records
  const fetchInventoryData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/inventory/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventoryData(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch inventory data", err);
      setError("Failed to load inventory data.");
    }
  };

  // 📉 Forecast comparison
  const fetchAnalysisData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/inventory/analysis", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalysisData(res.data.data);
    } catch (err) {
      console.error("❌ Failed to fetch inventory analysis", err);
      setError("Failed to load inventory forecast analysis.");
    }
  };

  // 📉 Inventory depletion (from sales)
  const fetchDepletionData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/inventory/depletion", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepletionData(res.data.data);
    } catch (err) {
      console.error("❌ Failed to fetch inventory depletion", err);
      setError("Failed to load inventory depletion data.");
    }
  };

  // 🔁 Fetch all data and manage loading state
  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchStats(),
        fetchInventoryData(),
        fetchAnalysisData(),
        fetchDepletionData(),
      ]);
    } finally {
      setLoading(false); // ✅ Set loading to false after all requests complete
    }
  };

  // 🔁 Refresh trigger
  const handleRefreshAnalysis = async () => {
    setLoading(true);
    await fetchAnalysisData();
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // 📊 Pie chart by rice type
  const riceTypeTotals = inventoryData.reduce((acc, item) => {
    acc[item.riceType] = (acc[item.riceType] || 0) + item.quantity;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(riceTypeTotals),
    datasets: [
      {
        data: Object.values(riceTypeTotals),
        backgroundColor: [
          "#60a5fa",
          "#facc15",
          "#f87171",
          "#34d399",
          "#f472b6",
          "#818cf8",
          "#fb923c",
          "#22d3ee",
          "#a78bfa",
        ],
      },
    ],
  };

  // 📈 Line chart: stock received daily
  const dailySums = inventoryData.reduce((acc, item) => {
    acc[item.dateReceived] = (acc[item.dateReceived] || 0) + item.quantity;
    return acc;
  }, {});

  const lineData = {
    labels: Object.keys(dailySums),
    datasets: [
      {
        label: "Stock Added (KG)",
        data: Object.values(dailySums),
        borderColor: "#10b981",
        backgroundColor: "#a7f3d0",
        tension: 0.3,
      },
    ],
  };

  // ⚠️ Filter low stock items
  const lowStockItems = analysisData.filter(
    (item) => item.status === "⚠️ Low" || item.status === "🛑 Critical"
  );

  return (
    <Layout>
      {loading ? (
        <PageLoader pageType="inventory" /> // ✅ Use PageLoader
      ) : (
        <div
          className="min-h-screen flex bg-gray-100 relative"
          aria-busy="false"
        >
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-auto space-y-10">
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded">
                ⚠️ {error}
              </div>
            )}

            {/* 📊 Overall Stats Cards */}
            {stats && <InventoryStatsCards stats={stats} />}

            {inventoryData.length > 0 ? (
              <>
                {/* 📋 Inventory Records */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    📋 Inventory Records
                  </h2>
                  <p className="text-sm text-gray-500">
                    Complete list of all inventory entries added, including
                    batch numbers, warehouse, and quantities.
                  </p>
                  <InventoryTable data={inventoryData} />
                </div>

                {/* 📊 Remaining Inventory vs Forecast */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    📊 Remaining Inventory vs Forecast
                  </h2>
                  <p className="text-sm text-gray-500">
                    Shows forecasted 30-day demand compared against current
                    stock levels for each rice type.
                  </p>
                  <RemainingInventoryTable
                    analysisData={analysisData}
                    onRefresh={handleRefreshAnalysis}
                  />
                </div>

                {/* 📉 Inventory Depletion */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    📉 Inventory Depletion (Daily)
                  </h2>
                  <p className="text-sm text-gray-500">
                    Tracks daily stock depletion based on recorded sales data
                    over time.
                  </p>
                  <InventoryDepletionTable data={depletionData} />
                </div>

                {/* 📈 Inventory Charts */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    📈 Inventory Analytics
                  </h2>
                  <p className="text-sm text-gray-500">
                    Visualizations showing inventory stock distribution and
                    daily stock movement trends.
                  </p>
                  <InventoryCharts
                    inventoryData={inventoryData}
                    pieData={pieData}
                    lineData={lineData}
                  />
                </div>

                {/* ⚠️ Low Stock Alerts */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    ⚠️ Low Stock Alerts
                  </h2>
                  <p className="text-sm text-gray-500">
                    List of rice types with critically low or warning-level
                    stock that may require replenishment soon.
                  </p>
                  <LowStockAlerts lowStockItems={lowStockItems} />
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-10">
                📭 No inventory records found.
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inventory;
