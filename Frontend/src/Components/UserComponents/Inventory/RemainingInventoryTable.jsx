import PropTypes from "prop-types";

const RemainingInventoryTable = ({ analysisData, onRefresh }) => {
  const latestUpdate = analysisData?.[0]?.last_updated || null;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mt-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-md font-semibold text-gray-800">
          📦 Remaining Inventory Projection (Post-Forecast)
        </h2>
        <button
          onClick={onRefresh}
          className="bg-blue-500 text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-600 transition"
          aria-label="Refresh Inventory Analysis"
        >
          🔄 Refresh
        </button>
      </div>

      {latestUpdate && (
        <p className="text-xs text-gray-500 mb-3">
          Last updated:{" "}
          {new Date(latestUpdate).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      )}

      {analysisData.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          📭 No analysis data available.
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[400px]">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left font-semibold">Rice Type</th>
                <th
                  className="p-3 text-left font-semibold"
                  title="Current available stock from inventory (before forecast deduction)"
                >
                  Remaining Stock (KG)
                </th>
                <th
                  className="p-3 text-left font-semibold"
                  title="Predicted total sales quantity for next 30 days"
                >
                  90-Day Forecast (KG)
                </th>
                <th
                  className="p-3 text-left font-semibold"
                  title="Projected stock after subtracting forecasted sales"
                >
                  After Forecast (KG)
                </th>
                <th className="p-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.map((item, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="p-3">{item.riceType}</td>
                  <td className="p-3">{item.current_stock_kg}</td>
                  <td className="p-3">{item.forecast_30_days_qty}</td>
                  <td className="p-3">{item.post_forecast_stock_kg}</td>
                  <td className="p-3 font-medium">
                    <span
                      className={`${
                        item.status.includes("Healthy")
                          ? "text-green-600"
                          : item.status.includes("Low")
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

RemainingInventoryTable.propTypes = {
  analysisData: PropTypes.arrayOf(
    PropTypes.shape({
      riceType: PropTypes.string.isRequired,
      current_stock_kg: PropTypes.number.isRequired,
      forecast_30_days_qty: PropTypes.number.isRequired,
      post_forecast_stock_kg: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      last_updated: PropTypes.string,
    })
  ).isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default RemainingInventoryTable;
