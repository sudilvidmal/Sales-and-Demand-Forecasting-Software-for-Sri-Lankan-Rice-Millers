import { useState, useEffect } from "react";

const DemandTable = () => {
  const [dayFilter, setDayFilter] = useState(30);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTableData = async (days) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("user_token");
      const res = await fetch(
        `http://localhost:8000/user/demand/table?days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setTableData(data.data || []);
      } else {
        setError(data.detail || "Failed to fetch demand table.");
      }
    } catch (err) {
      console.error("❌ Error fetching demand table:", err);
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData(dayFilter);
  }, [dayFilter]);

  if (loading) {
    return <p className="text-gray-500 text-sm">⏳ Loading demand table...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-sm">❌ {error}</p>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6 overflow-auto">
      {/* 🔥 Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          📊 Forecasted Demand by Rice Type
        </h2>
        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(parseInt(e.target.value))}
          className="border rounded-lg p-2 text-sm shadow-sm focus:ring focus:border-blue-400"
        >
          <option value={30}>Next 30 Days</option>
          <option value={60}>Next 60 Days</option>
          <option value={90}>Next 90 Days</option>
        </select>
      </div>

      {/* 🧾 Table */}
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-blue-50 text-gray-700 text-xs uppercase">
            <tr>
              <th className="p-3 text-left border-b">Rice Type</th>
              <th className="p-3 text-left border-b">
                Total Forecasted Demand (KG)
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((row, index) => (
                <tr
                  key={index}
                  className={`transition-colors ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-100 ${
                    index === 0 ? "bg-yellow-100 font-bold" : ""
                  }`}
                >
                  <td className="p-3 border-b">{row.rice_type || "N/A"}</td>
                  <td className="p-3 border-b">{row.total_qty.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={2}
                  className="p-6 text-center text-gray-500 bg-gray-50"
                >
                  No data available for selected period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DemandTable;
