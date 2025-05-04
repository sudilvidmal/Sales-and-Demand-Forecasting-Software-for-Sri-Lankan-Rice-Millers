import PropTypes from "prop-types";
import { useState, useEffect } from "react";

const InventoryImpact = ({ inventory, onFilteredChange }) => {
  const [filteredInventory, setFilteredInventory] = useState(inventory);
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    let filtered = inventory;
    if (selectedStatus !== "All") {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }
    setFilteredInventory(filtered);

    if (onFilteredChange) {
      onFilteredChange(filtered);
    }
  }, [inventory, selectedStatus, onFilteredChange]);

  const statusOptions = ["All", ...new Set(inventory.map((i) => i.status))];

  const getStatusBadge = (status) => {
    const base = "inline-block px-2 py-1 text-xs font-semibold rounded";
    switch (status) {
      case "🟢 Healthy":
        return `${base} bg-green-100 text-green-800`;
      case "🟡 Low":
        return `${base} bg-yellow-100 text-yellow-800`;
      case "🛑 Critical":
      case "🔴 Critical":
        return `${base} bg-red-100 text-red-800`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
        🧾 Inventory Forecast Impact
      </h2>

      {/* Status Filter */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="text-gray-700 font-medium">
          Filter by Status:
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="ml-2 border px-3 py-1 rounded shadow-sm"
          >
            {statusOptions.map((status, idx) => (
              <option key={idx} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => setSelectedStatus("All")} 
          className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
        >
          🔄 Reset Filter
        </button>
      </div>

      {/* 📊 Inventory Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-100 sticky top-0 z-10 text-blue-900">
            <tr>
              <th className="p-3 border text-left font-semibold">Rice Type</th>
              <th className="p-3 border text-left font-semibold">
                Current Stock (KG)
              </th>
              <th className="p-3 border text-left font-semibold">
                Forecast (90 Days)
              </th>
              <th className="p-3 border text-left font-semibold">
                After Forecast
              </th>
              <th className="p-3 border text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center text-gray-500 py-6 italic"
                >
                  No matching inventory data found.
                </td>
              </tr>
            ) : (
              filteredInventory.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="border p-2">{item.riceType}</td>
                  <td className="border p-2">{item.current_stock_kg} KG</td>
                  <td className="border p-2">{item.forecast_30_days_qty} KG</td>
                  <td className="border p-2">
                    {item.post_forecast_stock_kg} KG
                  </td>
                  <td className="border p-2">
                    <span className={getStatusBadge(item.status)}>
                      {item.status}
                    </span>
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

InventoryImpact.propTypes = {
  inventory: PropTypes.arrayOf(
    PropTypes.shape({
      riceType: PropTypes.string.isRequired,
      current_stock_kg: PropTypes.number.isRequired,
      forecast_30_days_qty: PropTypes.number.isRequired,
      post_forecast_stock_kg: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  onFilteredChange: PropTypes.func,
};

export default InventoryImpact;
