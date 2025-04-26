import {
  FaUpload,
  FaChartBar,
  FaDatabase,
  FaExclamationTriangle,
} from "react-icons/fa";
import PropTypes from "prop-types";

// 🔵 Updated Icon Map
const iconMap = {
  sales_upload: <FaUpload />,
  forecast_generated: <FaChartBar />,
  forecast_saved: <FaChartBar />,
  forecast_records: <FaChartBar />,
  stock_sync: <FaDatabase />,
  manual_entry: <FaUpload />,
  shop_closed: <FaExclamationTriangle />,
  default: <FaChartBar />,
};

// ✅ Format Timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp); // ✨ Convert string to Date object
  const options = {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-US", options).replace(",", ""); // e.g., 17 Apr 11:43 AM
};

const D_list_two = ({ logs }) => {
  if (!Array.isArray(logs)) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-96">
        <h3 className="text-gray-700 font-semibold mb-4">System Logs</h3>
        <p className="text-red-500 text-sm">⚠️ Logs not available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-96">
      <h3 className="text-gray-700 font-semibold mb-4">
        System Logs & Upload Status
      </h3>
      <ul className="overflow-y-auto h-[calc(100%-2rem)] pr-2">
        {logs.map((log, index) => (
          <li key={index} className="flex items-center py-2 border-b">
            <div className="text-blue-500 mr-3 text-lg">
              {iconMap[log.event_type] || iconMap.default}
            </div>
            <div>
              <p className="text-gray-700">{log.description}</p>
              <p className="text-sm text-gray-500">
                {formatTimestamp(log.timestamp)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

D_list_two.propTypes = {
  logs: PropTypes.array.isRequired,
};

export default D_list_two;
