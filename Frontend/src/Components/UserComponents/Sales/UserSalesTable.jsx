import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const UserSalesTable = () => {
  const [salesData, setSalesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [riceTypeFilter, setRiceTypeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [priceSearch, setPriceSearch] = useState("");
  const [closedFilter, setClosedFilter] = useState("All");
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8;

  const uniqueRiceTypes = [
    "All",
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

  const fetchSalesData = useCallback(async () => {
    const token = localStorage.getItem("user_token");

    try {
      const params = {
        rice_type: riceTypeFilter !== "All" ? riceTypeFilter : undefined,
        from_date: dateFilter.from || undefined,
        to_date: dateFilter.to || undefined,
        price: priceSearch || undefined,
        closed: closedFilter !== "All" ? closedFilter : undefined,
        sort_field: sortField,
        sort_order: sortOrder,
        page: currentPage,
        limit: itemsPerPage,
      };

      const response = await axios.get(
        "http://localhost:8000/user/sales/table",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );

      // ✅ Safely access data for test environments
      setSalesData(response.data?.data || []);
      setTotalPages(response.data?.pages || 1);
    } catch (error) {
      console.error("❌ Failed to fetch sales data:", error);
    }
  }, [
    riceTypeFilter,
    dateFilter,
    priceSearch,
    closedFilter,
    sortField,
    sortOrder,
    currentPage,
  ]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="mt-6 bg-white p-6 rounded-xl shadow-md">
      {/* 🔍 Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 text-sm">
        <div>
          <label htmlFor="rice-type" className="block text-gray-600 mb-1">
            Filter by Rice Type
          </label>
          <select
            id="rice-type"
            value={riceTypeFilter}
            onChange={(e) => setRiceTypeFilter(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:border-blue-400"
          >
            {uniqueRiceTypes.map((type, idx) => (
              <option key={idx} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="from-date" className="block text-gray-600 mb-1">
            From Date
          </label>
          <input
            id="from-date"
            type="date"
            value={dateFilter.from}
            onChange={(e) =>
              setDateFilter((prev) => ({ ...prev, from: e.target.value }))
            }
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:border-blue-400"
          />
        </div>

        <div>
          <label htmlFor="to-date" className="block text-gray-600 mb-1">
            To Date
          </label>
          <input
            id="to-date"
            type="date"
            value={dateFilter.to}
            onChange={(e) =>
              setDateFilter((prev) => ({ ...prev, to: e.target.value }))
            }
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:border-blue-400"
          />
        </div>

        <div>
          <label htmlFor="price-search" className="block text-gray-600 mb-1">
            Search Price Per KG
          </label>
          <input
            id="price-search"
            type="text"
            value={priceSearch}
            onChange={(e) => setPriceSearch(e.target.value)}
            placeholder="e.g. 150"
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:border-blue-400"
          />
        </div>

        <div>
          <label htmlFor="closed-filter" className="block text-gray-600 mb-1">
            Filter by Closed
          </label>
          <select
            id="closed-filter"
            value={closedFilter}
            onChange={(e) => setClosedFilter(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:border-blue-400"
          >
            <option value="All">All</option>
            <option value="Closed">Closed ✅</option>
            <option value="Open">Open ❌</option>
          </select>
        </div>
      </div>

      {/* 📊 Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50 text-gray-700 uppercase text-xs">
            <tr>
              {[
                "date",
                "rice_type",
                "quantity_kg",
                "gross_amount",
                "price_per_kg",
                "closed",
              ].map((field) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="p-3 text-left font-semibold cursor-pointer hover:bg-blue-100 transition border-b"
                >
                  {field
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                  {sortField === field && (sortOrder === "asc" ? " 🔼" : " 🔽")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {salesData.length > 0 ? (
              salesData.map((item, i) => (
                <tr
                  key={i}
                  className={`transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50`}
                >
                  <td className="p-3 border-b">{item.date}</td>
                  <td className="p-3 border-b">{item.rice_type}</td>
                  <td className="p-3 border-b">{item.quantity_kg}</td>
                  <td className="p-3 border-b">Rs. {item.gross_amount}</td>
                  <td className="p-3 border-b">Rs. {item.price_per_kg}</td>
                  <td
                    className="p-3 border-b"
                    role="cell"
                    data-testid="status-icon"
                  >
                    {item.closed ? "✅" : "❌"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center p-6 text-gray-500 bg-gray-50"
                >
                  No records found with selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📄 Pagination */}
      <div className="flex justify-center items-center mt-6 gap-4 text-sm">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 transition"
        >
          ⬅️ Prev
        </button>
        <span className="font-medium text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 transition"
        >
          Next ➡️
        </button>
      </div>
    </div>
  );
};

export default UserSalesTable;
