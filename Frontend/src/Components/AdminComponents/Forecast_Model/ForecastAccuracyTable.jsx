import PropTypes from "prop-types";

const ForecastAccuracyTable = ({ data }) => {
  // Handle missing or non-array data
  if (!Array.isArray(data)) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md text-red-600 text-sm mb-6">
        ⚠️ No accuracy data available.
      </div>
    );
  }

  // Handle empty array
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md text-yellow-600 text-sm mb-6">
        ⚠️ No accuracy metrics found for the latest model.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        📊 Accuracy Metrics
      </h2>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50 text-gray-700 uppercase text-xs sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left border-b">Rice Type</th>
              <th className="p-3 text-center border-b">MAE (KG)</th>
              <th className="p-3 text-center border-b">R² Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-100 transition`}
              >
                <td className="p-3 border-b">{item.rice_type}</td>
                <td className="p-3 text-center border-b">
                  {item.mae !== undefined ? item.mae.toFixed(2) : "N/A"}
                </td>
                <td className="p-3 text-center border-b">
                  {item.r2_score !== undefined
                    ? item.r2_score.toFixed(2)
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ForecastAccuracyTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      rice_type: PropTypes.string.isRequired,
      mae: PropTypes.number,
      r2_score: PropTypes.number,
    })
  ).isRequired,
};

export default ForecastAccuracyTable;
