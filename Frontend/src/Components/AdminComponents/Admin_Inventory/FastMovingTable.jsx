import { useEffect, useState } from "react";
import axios from "axios";

const FastMovingTable = () => {
  const [fastMovingData, setFastMovingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFastMovingData = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        "http://localhost:8000/admin/inventory/fast-moving",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFastMovingData(res.data.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch fast-moving data", err);
      setError("Failed to load fast-moving rice data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFastMovingData();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-6 overflow-x-auto">
      <h2 className="text-md font-semibold text-gray-800 mb-2">
        ⚡ Fast-Moving or Low Stock Rice Types
      </h2>

      {loading ? (
        <div className="text-gray-500 p-4">⏳ Loading data...</div>
      ) : error ? (
        <div className="text-red-600 p-4">{error}</div>
      ) : fastMovingData.length === 0 ? (
        <div className="text-gray-500 p-4">📭 No fast-moving items found.</div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-yellow-50">
            <tr>
              <th className="p-3 text-left">Rice Type</th>
              <th className="p-3 text-left">Current Stock</th>
              <th className="p-3 text-left">Avg. Daily Sales</th>
              <th className="p-3 text-left">Forecast (30 Days)</th>
              <th className="p-3 text-left">Warehouse</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {fastMovingData.map((item, i) => (
              <tr
                key={item.riceType + i}
                className={i % 2 === 0 ? "bg-white" : "bg-yellow-50/50"}
              >
                <td className="p-3">{item.riceType}</td>
                <td className="p-3">{item.currentStock} KG</td>
                <td className="p-3">{item.avgDailySales.toFixed(1)} KG</td>
                <td className="p-3">{item.forecast30Days} KG</td>
                <td className="p-3">{item.warehouse}</td>
                <td className="p-3">
                  <span className="text-orange-600 font-medium">
                    🔥 Fast Moving
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FastMovingTable;
