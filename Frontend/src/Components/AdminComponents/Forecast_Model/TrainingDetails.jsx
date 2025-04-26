import PropTypes from "prop-types";

const TrainingDetails = ({
  model,
  trainingDate,
  horizon,
  riceTypes,
  totalRecords,
  dateRange,
}) => {
  const details = [
    { label: "✅ Model", value: model },
    { label: "📅 Training Date", value: trainingDate },
    { label: "⏳ Forecast Horizon", value: `${horizon} Days` },
    { label: "🍚 Rice Types Modeled", value: riceTypes },
    { label: "📊 Total Records Used", value: totalRecords },
    {
      label: "🗓️ Date Range",
      value: `${dateRange?.start} to ${dateRange?.end}`,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        🧠 Model Training Details
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {details.map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-md p-3 border border-gray-200"
          >
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="text-sm font-medium text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

TrainingDetails.propTypes = {
  model: PropTypes.string.isRequired,
  trainingDate: PropTypes.string.isRequired,
  horizon: PropTypes.number.isRequired,
  riceTypes: PropTypes.number.isRequired,
  totalRecords: PropTypes.number.isRequired,
  dateRange: PropTypes.shape({
    start: PropTypes.string,
    end: PropTypes.string,
  }).isRequired,
};

export default TrainingDetails;
