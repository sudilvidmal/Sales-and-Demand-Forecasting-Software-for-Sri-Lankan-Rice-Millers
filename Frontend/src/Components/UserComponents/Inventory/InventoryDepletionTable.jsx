import { useEffect, useState } from "react";
import axios from "axios";

const InventoryDepletionTable = () => {
  const [depletionData, setDepletionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDepletionData = async () => {
    try {
      const token = localStorage.getItem("user_token");

      const res = await axios.get("http://localhost:8000/inventory/depletion", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDepletionData(res.data.data);
    } catch (err) {
      console.error("❌ Failed to fetch inventory depletion data", err);
      setError("Failed to load inventory depletion data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepletionData();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-6 overflow-x-auto">
      <h2 className="text-md font-semibold text-gray-800 mb-2">
        📉 Inventory Depletion After Daily Sales (Batch-Wise Estimate)
      </h2>

      {loading ? (
        <div className="text-gray-500 p-4">⏳ Loading data...</div>
      ) : error ? (
        <div className="text-red-600 p-4">{error}</div>
      ) : depletionData.length === 0 ? (
        <div className="text-gray-500 p-4">📭 No depletion records found.</div>
      ) : (
        <div className="overflow-y-auto max-h-[400px]">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Rice Type</th>
                <th className="p-3 text-left">Initial Stock (KG)</th>
                <th className="p-3 text-left">Date Received</th>
                <th className="p-3 text-left">Used So Far (KG)</th>
                <th className="p-3 text-left">Remaining Stock (KG)</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {depletionData.map((item, i) => {
                const remaining = item.remainingStock;
                const statusLabel =
                  remaining > 20
                    ? "✅ Healthy"
                    : remaining > 0
                    ? "⚠️ Low"
                    : "🛑 Out of Stock";

                const statusClass =
                  remaining > 20
                    ? "text-green-600"
                    : remaining > 0
                    ? "text-yellow-600"
                    : "text-red-600";

                return (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-3">{item.riceType}</td>
                    <td className="p-3">{item.initialStock}</td>
                    <td className="p-3">{item.dateReceived}</td>
                    <td className="p-3">{item.usedSoFar}</td>
                    <td className="p-3">
                      {remaining < 0 ? 0 : remaining.toFixed(2)}
                    </td>
                    <td className="p-3 font-medium">
                      <span className={statusClass}>{statusLabel}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryDepletionTable;
