import PropTypes from "prop-types";
import { useState, useEffect } from "react";

const ForecastData = ({ data, fromDate, toDate, onFilteredDataChange }) => {
  const [localFromDate, setLocalFromDate] = useState(fromDate || "");
  const [localToDate, setLocalToDate] = useState(toDate || "");
  const [selectedRiceType, setSelectedRiceType] = useState("");

  const riceTypes = [
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

  const filteredData = data.filter((row) => {
    const date = new Date(row.date);
    const afterFrom = localFromDate ? date >= new Date(localFromDate) : true;
    const beforeTo = localToDate ? date <= new Date(localToDate) : true;
    const riceMatch = selectedRiceType
      ? row.rice_type === selectedRiceType
      : true;
    return afterFrom && beforeTo && riceMatch;
  });

  useEffect(() => {
    if (onFilteredDataChange) {
      onFilteredDataChange(filteredData);
    }
  }, [filteredData, onFilteredDataChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-blue-800 mb-2 flex items-center gap-2">
        📊 Forecast for Next 90 Days
      </h2>
      <p className="text-gray-600 text-sm mb-4">
        Use the filters below to view specific forecasted rice sales by date and
        type.
      </p>

      {/* 🔍 Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            📅 From Date
          </label>
          <input
            type="date"
            value={localFromDate}
            onChange={(e) => setLocalFromDate(e.target.value)}
            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            📅 To Date
          </label>
          <input
            type="date"
            value={localToDate}
            onChange={(e) => setLocalToDate(e.target.value)}
            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            🍚 Rice Type
          </label>
          <select
            value={selectedRiceType}
            onChange={(e) => setSelectedRiceType(e.target.value)}
            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">All Types</option>
            {riceTypes.map((type, idx) => (
              <option key={idx} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 📊 Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded">
        <table className="min-w-full text-sm bg-white">
          <thead className="bg-blue-100 sticky top-0 z-10 text-blue-900">
            <tr>
              <th className="p-3 border font-semibold text-left">Date</th>
              <th className="p-3 border font-semibold text-left">Rice Type</th>
              <th className="p-3 border font-semibold text-left">
                Forecast (KG)
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="text-center text-gray-500 py-6 italic"
                >
                  No forecast data found for the selected filters.
                </td>
              </tr>
            ) : (
              filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="p-2 border">{row.date}</td>
                  <td className="p-2 border">{row.rice_type}</td>
                  <td className="p-2 border">{row.forecast}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ForecastData.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      rice_type: PropTypes.string.isRequired,
      forecast: PropTypes.number.isRequired,
    })
  ).isRequired,
  fromDate: PropTypes.string,
  toDate: PropTypes.string,
  onFilteredDataChange: PropTypes.func,
};

export default ForecastData;
