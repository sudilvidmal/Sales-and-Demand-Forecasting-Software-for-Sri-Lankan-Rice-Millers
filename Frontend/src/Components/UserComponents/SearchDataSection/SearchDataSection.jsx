import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";

const SearchDataSection = () => {
  const [riceType, setRiceType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [dataRange, setDataRange] = useState({ min_date: "", max_date: "" });

  const token = localStorage.getItem("user_token");

  useEffect(() => {
    const fetchDataRange = async () => {
      try {
        const res = await fetch("http://localhost:8000/data-range", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();
        setDataRange(result);
      } catch (err) {
        console.error("Failed to fetch data range", err);
      }
    };
    fetchDataRange();
  }, [token]);

  const handleFilter = async () => {
    try {
      const response = await fetch("http://localhost:8000/search-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rice_type: riceType,
          from_date: fromDate,
          to_date: toDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch data");
      }

      const formatted = data.map((item) => ({
        Date: item.date,
        "Rice Type": item.rice_type,
        "Quantity (KG)": item.quantity_kg,
        "Amount per 1KG (Rs)": item.price_per_kg,
      }));

      setFilteredData(formatted);
      toast.success("🔍 Filter applied!");
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  const handleReset = () => {
    setRiceType("");
    setFromDate("");
    setToDate("");
    setFilteredData([]);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      {/* 🔍 Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Rice Type</label>
          <select
            value={riceType}
            onChange={(e) => setRiceType(e.target.value)}
            className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring focus:border-blue-400 text-sm"
          >
            <option value="">All Types</option>
            {[
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
            ].map((type, idx) => (
              <option key={idx} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring focus:border-blue-400 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring focus:border-blue-400 text-sm"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleFilter}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            🔍 Filter
          </button>
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition text-sm"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* 📅 Available Data Range */}
      {dataRange.min_date && dataRange.max_date && (
        <p className="text-sm text-gray-600 mb-4">
          📅 Data available from <strong>{dataRange.min_date}</strong> to{" "}
          <strong>{dataRange.max_date}</strong>
        </p>
      )}

      {/* 📤 Export */}
      {filteredData.length > 0 && (
        <div className="flex justify-end mb-4">
          <CSVLink
            data={filteredData}
            filename="filtered_sales_data.csv"
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition text-sm"
          >
            ⬇️ Export CSV
          </CSVLink>
        </div>
      )}

      {/* 📊 Results Table */}
      <div className="overflow-x-auto max-h-[450px] rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50 text-gray-700 uppercase text-xs sticky top-0 z-10">
            <tr>
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Rice Type</th>
              <th className="p-3 border-b">Quantity (KG)</th>
              <th className="p-3 border-b">Amount per 1KG (Rs)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-8 text-gray-500 bg-gray-50"
                >
                  No matching records found.
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-100 transition`}
                >
                  <td className="p-3 border-b">{row.Date}</td>
                  <td className="p-3 border-b">{row["Rice Type"]}</td>
                  <td className="p-3 border-b">{row["Quantity (KG)"]}</td>
                  <td className="p-3 border-b">{row["Amount per 1KG (Rs)"]}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SearchDataSection;
