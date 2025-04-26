// 📄 Components/UserComponents/Demand/DemandSummary.jsx
import { useState, useEffect } from "react";

const DemandSummary = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDemandSummary = async () => {
    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch("http://localhost:8000/user/demand/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        setSummaryData(data);
      } else {
        setError(data.detail || "Failed to fetch demand summary.");
      }
    } catch (err) {
      console.error("❌ Error fetching demand summary:", err);
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandSummary();
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-gray-500">⏳ Loading demand summary...</p>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        ❌ {error}
        <button
          onClick={fetchDemandSummary}
          className="ml-2 text-blue-600 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!summaryData) {
    return <p className="text-sm text-gray-500">No summary data available.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Total Forecasted Demand */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
        <div className="bg-blue-100 rounded-full p-2">
          <span className="text-xl">📦</span>
        </div>
        <div>
          <h3 className="text-xs text-gray-500">Total Forecasted Demand</h3>
          <p className="text-lg font-bold">{summaryData.total_demand} KG</p>
        </div>
      </div>

      {/* Average Demand per Day */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
        <div className="bg-blue-100 rounded-full p-2">
          <span className="text-xl">📅</span>
        </div>
        <div>
          <h3 className="text-xs text-gray-500">Average Demand per Day</h3>
          <p className="text-lg font-bold">{summaryData.average_per_day} KG</p>
        </div>
      </div>

      {/* Top Rice Type */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
        <div className="bg-blue-100 rounded-full p-2">
          <span className="text-xl">🏆</span>
        </div>
        <div>
          <h3 className="text-xs text-gray-500">Top Rice Type</h3>
          <p className="text-sm font-bold">
            {summaryData.top_rice_type || "N/A"}
          </p>
          <p className="text-xs text-gray-600">
            {summaryData.top_rice_total} KG
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemandSummary;
