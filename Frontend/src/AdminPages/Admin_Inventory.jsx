import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// 🧭 Layout
import Admin_Sidebar from "../Components/AdminComponents/Admin_Sidebar/Admin_sidebar";
import Admin_Navbar from "../Components/AdminComponents/Admin_Navbar/Admin_Navbar";

// 📦 Inventory Components
import LowStockMonitor from "../Components/AdminComponents/Admin_Inventory/LowStockMonitor";
import FastMovingTable from "../Components/AdminComponents/Admin_Inventory/FastMovingTable";
import TopStockedChart from "../Components/AdminComponents/Admin_Inventory/TopStockedChart";
import InventoryRecordsTable from "../Components/AdminComponents/Admin_Inventory/InventoryRecordsTable";

const Admin_Inventory = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [setInventoryData] = useState([]); // ✅ fixed missing variable
  const [setLineData] = useState({}); // ✅ fixed missing variable

  const handleToggleSidebar = () => setShowSidebar((prev) => !prev);
  const handleCloseSidebar = () => setShowSidebar(false);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const token = localStorage.getItem("adminToken"); // ✅ Fetch admin token
        if (!token) {
          console.error("❌ No admin token found. Please login again.");
          return;
        }

        const res = await axios.get(
          "http://localhost:8000/admin/inventory/all",
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ Pass token here
            },
          }
        );
        const data = res.data.data || [];
        setInventoryData(data);

        

        // 📅 Line Chart Prep
        const dateMap = {};
        data.forEach((item) => {
          const date = item.dateReceived;
          dateMap[date] = (dateMap[date] || 0) + item.quantity;
        });

        const sortedDates = Object.keys(dateMap).sort();
        const values = sortedDates.map((d) => dateMap[d]);

        setLineData({
          labels: sortedDates,
          datasets: [
            {
              label: "Stock Added",
              data: values,
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.3)",
            },
          ],
        });
      } catch (err) {
        console.error("❌ Failed to fetch inventory data", err);
      }
    };

    fetchInventoryData();
  }, []);

  return (
    <div className="relative min-h-screen flex bg-gray-100 overflow-hidden">
      {/* 🔒 Sidebar Backdrop (Mobile) */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-20 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* 🧭 Sidebar */}
      <Admin_Sidebar
        showSidebar={showSidebar}
        onCloseSidebar={handleCloseSidebar}
      />

      {/* 🧭 Navbar */}
      <Admin_Navbar onToggleSidebar={handleToggleSidebar} />

      {/* 📊 Scrollable Content */}
      <div className="flex-1 flex flex-col md:ml-64 z-10 p-4 sm:p-6 mt-[64px] space-y-8 overflow-auto">
        {/* 📋 Inventory Table */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            📋 Inventory Records
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            View and manage all rice inventory records including batch details
            and warehouse information.
          </p>
          <InventoryRecordsTable />
        </section>

        {/* ⚠️ Low Stock */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            ⚠️ Low Stock Monitor
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Identifies rice batches where remaining stock is below the safety
            threshold (e.g., under 50 KG).
          </p>
          <LowStockMonitor />
        </section>

        {/* ⚡ Fast-Moving Table */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            ⚡ Fast-Moving or At-Risk Rice Types
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Highlights rice types with high demand or low inventory compared to
            forecasted 30-day sales.
          </p>
          <FastMovingTable />
        </section>

        {/* 📈 Top Stock Chart */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            📈 Top 5 Stocked Rice Types
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Quickly review the most stocked rice types across all warehouses.
          </p>
          <TopStockedChart />
        </section>

        {/* 🔔 Toast Feedback */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default Admin_Inventory;
