import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const RiceTypeBreakdown = ({ onFilteredChange }) => {
  const [performance, setPerformance] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dataRange, setDataRange] = useState({ from: "N/A", to: "N/A" });

  const fetchRiceBreakdownData = async () => {
    try {
      const query = new URLSearchParams();
      if (fromDate) query.append("from_date", fromDate);
      if (toDate) query.append("to_date", toDate);

      const token = localStorage.getItem("user_token");

      const response = await fetch(
        `http://localhost:8000/rice-breakdown?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (Array.isArray(result.data)) {
        setPerformance(result.data);
        setDataRange({
          from: result.earliest_date || "N/A",
          to: result.latest_date || "N/A",
        });

        if (onFilteredChange) onFilteredChange(result.data);
      } else {
        setPerformance([]);
        setDataRange({ from: "N/A", to: "N/A" });
        if (onFilteredChange) onFilteredChange([]);
      }
    } catch (err) {
      console.error("Rice breakdown fetch error:", err.message);
    }
  };


  useEffect(() => {
    fetchRiceBreakdownData();
  }, [fromDate, toDate]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
        🧾 Rice Type Breakdown
      </h2>

      {/* 🗓️ Date Filters */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="text-gray-700">
          From:
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="ml-2 px-3 py-1 border rounded shadow-sm"
          />
        </label>
        <label className="text-gray-700">
          To:
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="ml-2 px-3 py-1 border rounded shadow-sm"
          />
        </label>
        <button
          onClick={fetchRiceBreakdownData}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1.5 rounded shadow-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* 📅 Date Range Info */}
      <p className="text-sm text-gray-600">
        📆 Data Available: <strong>{dataRange.from}</strong> →{" "}
        <strong>{dataRange.to}</strong>
      </p>

      {/* 📊 Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded">
        <table className="min-w-full text-sm bg-white">
          <thead className="bg-blue-100 sticky top-0 text-blue-900 z-10">
            <tr>
              <th className="p-3 border font-semibold text-left">Rice Type</th>
              <th className="p-3 border font-semibold text-left">
                Total Sold (KG)
              </th>
              <th className="p-3 border font-semibold text-left">
                Revenue (Rs.)
              </th>
              <th className="p-3 border font-semibold text-left">
                Avg. Price (Rs.)
              </th>
            </tr>
          </thead>
          <tbody>
            {performance.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center text-gray-500 py-6 italic"
                >
                  No data available for the selected date range.
                </td>
              </tr>
            ) : (
              performance.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="border p-2">{row.rice_type}</td>
                  <td className="border p-2">
                    {row.total_quantity.toLocaleString()} KG
                  </td>
                  <td className="border p-2">
                    Rs. {row.total_revenue.toLocaleString()}
                  </td>
                  <td className="border p-2">
                    Rs. {row.avg_price_per_kg.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

RiceTypeBreakdown.propTypes = {
  onFilteredChange: PropTypes.func,
};

export default RiceTypeBreakdown;
