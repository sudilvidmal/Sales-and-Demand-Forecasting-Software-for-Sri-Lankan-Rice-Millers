import { useState, useEffect } from "react";
import { RotateCcw, Filter as FilterIcon } from "lucide-react";

const ITEMS_PER_PAGE = 5;

// ✅ Rice Types List
const RICE_TYPES = [
  "SIERRA RED RAW RICE -5KG",
  "SIERRA RED RAW RICE -10KG",
  "SIERRA RED RAW RICE -25KG",
  "SIERRA WHITE BASMATHI RICE -5KG",
  "SIERRA WHITE BASMATHI RICE -25KG",
  "SIERRA WHITE RAW RICE -5KG",
  "SIERRA WHITE RAW RICE -10KG",
  "SIERRA WHITE RAW RICE -25KG",
  "SAUMYA WHITE NADU RICE 5KG",
  "SAUMYA WHITE NADU RICE 10KG",
  "SAUMYA WHITE NADU RICE 25KG",
];

const InventoryTable = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    riceType: "",
    date: "",
    warehouse: "",
  });
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [warehouses, setWarehouses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem("user_token");
        const res = await fetch("http://localhost:8000/inventory/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();
        setData(result);
        setFilteredData(result);

        const uniqueWarehouses = [
          ...new Set(result.map((item) => item.warehouse)),
        ];
        setWarehouses(uniqueWarehouses);
      } catch (err) {
        console.error("❌ Failed to fetch inventory data", err);
        setError("Failed to load inventory records.");
      }
    };

    fetchInventory();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilter = () => {
    const filtered = data.filter((item) => {
      const matchRiceType = filters.riceType
        ? item.riceType === filters.riceType
        : true;
      const matchDate = filters.date
        ? item.dateReceived === filters.date
        : true;
      const matchWarehouse = filters.warehouse
        ? item.warehouse === filters.warehouse
        : true;
      return matchRiceType && matchDate && matchWarehouse;
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({ riceType: "", date: "", warehouse: "" });
    setFilteredData(data);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const totalQuantity = filteredData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      {/* 🔍 Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        {/* 🔽 Rice Type Dropdown */}
        <select
          name="riceType"
          value={filters.riceType}
          onChange={handleFilterChange}
          className="w-full md:w-1/3 border rounded-lg p-2 text-sm shadow-sm focus:ring focus:border-blue-400"
        >
          <option value="">🍚 All Rice Types</option>
          {RICE_TYPES.map((type, idx) => (
            <option key={idx} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* 📅 Date Picker */}
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          className="w-full md:w-1/4 border rounded-lg p-2 text-sm shadow-sm focus:ring focus:border-blue-400"
        />

        {/* 🏢 Warehouse Dropdown */}
        <select
          name="warehouse"
          value={filters.warehouse}
          onChange={handleFilterChange}
          className="w-full md:w-1/4 border rounded-lg p-2 text-sm shadow-sm focus:ring focus:border-blue-400"
        >
          <option value="">📍 All Warehouses</option>
          {warehouses.map((w, i) => (
            <option key={i} value={w}>
              {w}
            </option>
          ))}
        </select>

        {/* 🎯 Action Buttons */}
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleFilter}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <FilterIcon size={16} /> Filter
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* 📋 Table */}
      {error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <div className="overflow-x-auto max-h-96 rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-50 text-gray-700 uppercase text-xs sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left font-semibold">Rice Type</th>
                <th className="p-3 text-left font-semibold">Quantity (KG)</th>
                <th className="p-3 text-left font-semibold">Batch No.</th>
                <th className="p-3 text-left font-semibold">Warehouse</th>
                <th className="p-3 text-left font-semibold">Date Received</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-100 transition`}
                  >
                    <td className="p-3">{row.riceType}</td>
                    <td className="p-3">
                      {row.quantity < 30 ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                          {row.quantity} ⚠ Low
                        </span>
                      ) : (
                        row.quantity
                      )}
                    </td>
                    <td className="p-3">{row.batchNo}</td>
                    <td className="p-3">{row.warehouse}</td>
                    <td className="p-3">{row.dateReceived}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/7486/7486359.png"
                        alt="No Data"
                        className="w-10 h-10 opacity-60"
                      />
                      No matching records found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔢 Pagination */}
      {filteredData.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4 text-sm">
          <span className="text-gray-600">
            Showing {Math.min(startIndex + 1, filteredData.length)}–
            {Math.min(endIndex, filteredData.length)} of {filteredData.length}{" "}
            entries • Total Quantity: {totalQuantity.toLocaleString()} KG
          </span>

          {totalPages > 1 && (
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 transition"
              >
                ◀ Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-lg border ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
                      : "bg-white hover:bg-gray-100"
                  } transition`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Next ▶
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
