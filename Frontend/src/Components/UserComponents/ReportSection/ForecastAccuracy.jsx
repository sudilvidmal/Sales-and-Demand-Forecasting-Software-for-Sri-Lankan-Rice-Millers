import PropTypes from "prop-types";
import { useEffect } from "react";

const ForecastAccuracy = ({ model, onFilteredDataChange }) => {
  useEffect(() => {
    if (onFilteredDataChange && model?.per_rice_type_metrics) {
      onFilteredDataChange(model.per_rice_type_metrics);
    }
  }, [model, onFilteredDataChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
        📉 Forecast Accuracy Summary
      </h2>

      {/* 🔍 Model Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
        <div>
          <span className="font-medium">📅 Trained On:</span>{" "}
          <span>{model.training_date}</span>
        </div>
        <div>
          <span className="font-medium">🧠 Model:</span>{" "}
          <span>{model.model_name}</span>
        </div>
        <div>
          <span className="font-medium">⏳ Forecast Horizon:</span>{" "}
          {model.forecast_horizon_days} days
        </div>
        <div>
          <span className="font-medium">🍚 Rice Types Modeled:</span>{" "}
          {model.total_rice_types_modeled}
        </div>
        <div>
          <span className="font-medium">🧾 Records Used:</span>{" "}
          {model.total_records_used}
        </div>
      </div>

      {/* 📊 Accuracy Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-100 sticky top-0 text-blue-900 z-10">
            <tr>
              <th className="border p-3 text-left font-semibold">Rice Type</th>
              <th className="border p-3 text-left font-semibold">MAE (KG)</th>
              <th className="border p-3 text-left font-semibold">R² Score</th>
            </tr>
          </thead>
          <tbody>
            {model.per_rice_type_metrics?.length > 0 ? (
              model.per_rice_type_metrics.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="border p-2">{r.rice_type}</td>
                  <td className="border p-2">
                    {typeof r.mae === "number" ? r.mae.toFixed(2) : "N/A"}
                  </td>
                  <td className="border p-2">
                    {typeof r.r2_score === "number"
                      ? r.r2_score.toFixed(2)
                      : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="text-center text-gray-500 py-6 italic"
                >
                  No forecast accuracy data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ForecastAccuracy.propTypes = {
  model: PropTypes.shape({
    training_date: PropTypes.string.isRequired,
    model_name: PropTypes.string.isRequired,
    forecast_horizon_days: PropTypes.number.isRequired,
    total_rice_types_modeled: PropTypes.number.isRequired,
    total_records_used: PropTypes.number.isRequired,
    per_rice_type_metrics: PropTypes.arrayOf(
      PropTypes.shape({
        rice_type: PropTypes.string.isRequired,
        mae: PropTypes.number,
        r2_score: PropTypes.number,
      })
    ),
  }).isRequired,
  onFilteredDataChange: PropTypes.func,
};

export default ForecastAccuracy;
