import PropTypes from "prop-types";

const LowStockAlerts = ({ lowStockItems }) => {
  if (lowStockItems.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 shadow-sm">
      <h3 className="text-red-700 font-semibold text-md mb-3 flex items-center gap-2">
        ⚠️ Low Stock Alerts
      </h3>
      <ul className="space-y-2">
        {lowStockItems.map((item, i) => (
          <li
            key={i}
            className="bg-white p-3 rounded border border-red-100 shadow-sm flex justify-between items-center"
          >
            <span className="text-sm font-medium text-gray-800">
              🧺 <span className="font-semibold">{item.riceType}</span>
            </span>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                item.quantity < 10
                  ? "bg-red-600 text-white"
                  : "bg-yellow-300 text-gray-800"
              }`}
            >
              {item.quantity} KG
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

LowStockAlerts.propTypes = {
  lowStockItems: PropTypes.arrayOf(
    PropTypes.shape({
      riceType: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default LowStockAlerts;
