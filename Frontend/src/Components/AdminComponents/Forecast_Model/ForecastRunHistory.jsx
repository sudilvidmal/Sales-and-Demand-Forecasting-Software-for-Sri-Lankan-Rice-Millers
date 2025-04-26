import PropTypes from "prop-types";

const ForecastRunHistory = ({ trainingData }) => {
  if (!trainingData || trainingData.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          🗓 Forecast Run History
        </h3>
        <p className="text-sm text-gray-500">No run history available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-md font-semibold text-gray-800 mb-4">
        🗓 Forecast Run History
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">Training Date</th>
              <th className="p-2 border">Model</th>
              <th className="p-2 border text-center">Rice Types</th>
              <th className="p-2 border text-center">Records</th>
              <th className="p-2 border text-center">Horizon</th>
            </tr>
          </thead>
          <tbody>
            {trainingData.map((entry, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 even:bg-gray-50 text-gray-700"
              >
                <td className="p-2 border">
                  {entry.training_date?.split(" ")[0] ?? "-"}
                </td>
                <td className="p-2 border">{entry.model_name}</td>
                <td className="p-2 border text-center">
                  {entry.total_rice_types_modeled}
                </td>
                <td className="p-2 border text-center">
                  {entry.total_records_used}
                </td>
                <td className="p-2 border text-center">
                  {entry.forecast_horizon_days} days
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ForecastRunHistory.propTypes = {
  trainingData: PropTypes.arrayOf(
    PropTypes.shape({
      training_date: PropTypes.string,
      model_name: PropTypes.string,
      forecast_horizon_days: PropTypes.number,
      total_rice_types_modeled: PropTypes.number,
      total_records_used: PropTypes.number,
    })
  ).isRequired,
};

export default ForecastRunHistory;
