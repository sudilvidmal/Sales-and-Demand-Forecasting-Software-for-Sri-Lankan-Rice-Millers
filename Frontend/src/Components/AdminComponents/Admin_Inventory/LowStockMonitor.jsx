import { useEffect, useState } from "react";
import axios from "axios";

const LowStockMonitor = () => {
  const [lowStockData, setLowStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLowStock = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        "http://localhost:8000/admin/inventory/low-stock",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLowStockData(res.data.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch low stock data", err);
      setError("Failed to load low stock data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStock();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <h2 className="text-md font-semibold text-red-600">
          ⚠️ Low Stock Monitor
        </h2>
        <span className="text-xs text-gray-500">
          Showing rice types with <strong>Remaining Stock</strong> below 50 KG
        </span>
      </div>

      {loading ? (
        <div className="text-gray-500 p-4">⏳ Loading...</div>
      ) : error ? (
        <div className="text-red-600 p-4">{error}</div>
      ) : lowStockData.length === 0 ? (
        <div className="text-gray-500 p-4">📭 No low stock items found.</div>
      ) : (
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-red-50 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left">Rice Type</th>
                <th className="p-3 text-left">Remaining Stock (KG)</th>
                <th className="p-3 text-left">Warehouse</th>
                <th className="p-3 text-left">Batch No</th>
                <th className="p-3 text-left">Date Received</th>
              </tr>
            </thead>
            <tbody>
              {lowStockData.map((item, i) => (
                <tr
                  key={item.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-red-50/30"}
                >
                  <td className="p-3">{item.riceType}</td>
                  <td className="p-3 text-red-600 font-bold">
                    {item.remainingStock} KG
                  </td>
                  <td className="p-3">{item.warehouse}</td>
                  <td className="p-3">{item.batchNo}</td>
                  <td className="p-3">{item.dateReceived}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LowStockMonitor;
