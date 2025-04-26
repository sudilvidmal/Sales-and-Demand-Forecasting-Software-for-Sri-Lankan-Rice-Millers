import PropTypes from "prop-types";

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

const timeDurations = [30, 60, 90];

const RiceTypeSelector = ({
  selectedRice,
  onRiceChange,
  selectedDays,
  onDaysChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      {/* Rice Type Selector */}
      <div>
        <label
          htmlFor="rice-type-select"
          className="text-sm text-gray-700 font-medium mb-2 block"
        >
          Select Rice Type:
        </label>
        <select
          id="rice-type-select"
          value={selectedRice}
          onChange={(e) => onRiceChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          {riceTypes.map((type, idx) => (
            <option key={idx} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Time Duration Selector */}
      <div>
        <label
          htmlFor="forecast-days-select"
          className="text-sm text-gray-700 font-medium mb-2 block"
        >
          Select Forecast Duration:
        </label>
        <select
          id="forecast-days-select"
          value={selectedDays}
          onChange={(e) => onDaysChange(parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          {timeDurations.map((days) => (
            <option key={days} value={days}>
              {days} Days
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

RiceTypeSelector.propTypes = {
  selectedRice: PropTypes.string.isRequired,
  onRiceChange: PropTypes.func.isRequired,
  selectedDays: PropTypes.number.isRequired,
  onDaysChange: PropTypes.func.isRequired,
};

export default RiceTypeSelector;
