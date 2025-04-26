import { useState } from "react";
import PropTypes from "prop-types";

const ITEMS_PER_PAGE = 10;

const ForecastTable = ({ riceType, forecastData }) => {
  const [currentPage, setCurrentPage] = useState(1); 

  const totalPages = Math.ceil(forecastData.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = forecastData.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">
        📅 Forecast Table: {riceType}
      </h3>

      {forecastData.length === 0 ? (
        <p className="text-sm text-gray-500">No forecast data available.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-300 text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Predicted Quantity (KG)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2 border">{item.date}</td>
                    <td className="p-2 border">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <span className="text-gray-600">
              Showing {startIdx + 1}–
              {Math.min(startIdx + ITEMS_PER_PAGE, forecastData.length)} of{" "}
              {forecastData.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded shadow bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                ◀ Prev
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded shadow bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next ▶
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

ForecastTable.propTypes = {
  riceType: PropTypes.string.isRequired,
  forecastData: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ForecastTable;
