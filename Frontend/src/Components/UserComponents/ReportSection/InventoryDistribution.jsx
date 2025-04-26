import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const InventoryDistribution = ({ batches, onFilteredChange }) => {
  const [filteredBatches, setFilteredBatches] = useState(batches);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [warehouse, setWarehouse] = useState("All");

  useEffect(() => {
    let filtered = batches;

    if (fromDate) {
      filtered = filtered.filter(
        (b) => new Date(b.dateReceived) >= new Date(fromDate)
      );
    }

    if (toDate) {
      filtered = filtered.filter(
        (b) => new Date(b.dateReceived) <= new Date(toDate)
      );
    }

    if (warehouse !== "All") {
      filtered = filtered.filter((b) => b.warehouse === warehouse);
    }

    setFilteredBatches(filtered);

    if (onFilteredChange) {
      onFilteredChange(filtered);
    }
  }, [batches, fromDate, toDate, warehouse, onFilteredChange]);

  const warehouseOptions = ["All", ...new Set(batches.map((b) => b.warehouse))];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
        📦 Inventory Distribution
      </h2>

      {/* 🔍 Filters */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="text-gray-700 font-medium">
          From:
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="ml-2 border px-3 py-1 rounded shadow-sm"
          />
        </label>
        <label className="text-gray-700 font-medium">
          To:
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="ml-2 border px-3 py-1 rounded shadow-sm"
          />
        </label>
        <label className="text-gray-700 font-medium">
          Warehouse:
          <select
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            className="ml-2 border px-3 py-1 rounded shadow-sm"
          >
            {warehouseOptions.map((w, i) => (
              <option key={i} value={w}>
                {w}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            setFromDate("");
            setToDate("");
            setWarehouse("All");
          }}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1.5 rounded shadow-sm"
        >
          🔄 Reset Filters
        </button>
      </div>

      {/* 📊 Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded">
        <table className="min-w-full text-sm bg-white">
          <thead className="bg-blue-100 sticky top-0 z-10 text-blue-900">
            <tr>
              <th className="p-3 border font-semibold text-left">Rice Type</th>
              <th className="p-3 border font-semibold text-left">Batch No</th>
              <th className="p-3 border font-semibold text-left">Warehouse</th>
              <th className="p-3 border font-semibold text-left">
                Quantity (KG)
              </th>
              <th className="p-3 border font-semibold text-left">
                Received Date
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBatches.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center text-gray-500 py-6 italic"
                >
                  No records found for the selected filters.
                </td>
              </tr>
            ) : (
              filteredBatches.map((b, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="border p-2">{b.riceType}</td>
                  <td className="border p-2">{b.batchNo}</td>
                  <td className="border p-2">{b.warehouse}</td>
                  <td className="border p-2">{b.quantity.toLocaleString()}</td>
                  <td className="border p-2">{b.dateReceived}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

InventoryDistribution.propTypes = {
  batches: PropTypes.arrayOf(
    PropTypes.shape({
      riceType: PropTypes.string.isRequired,
      batchNo: PropTypes.string.isRequired,
      warehouse: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      dateReceived: PropTypes.string.isRequired,
    })
  ).isRequired,
  onFilteredChange: PropTypes.func,
};

export default InventoryDistribution;
