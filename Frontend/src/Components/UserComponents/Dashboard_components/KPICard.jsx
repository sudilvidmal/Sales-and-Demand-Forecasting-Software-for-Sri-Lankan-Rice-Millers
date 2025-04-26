import PropTypes from "prop-types";

const KPICard = ({ title, value, percentage, trend, icon }) => {
  const getTrendColor = () => {
    if (percentage === 0) {
      return "text-gray-400"; // Neutral gray for 0% 🚀
    }
    return trend === "up" ? "text-green-500" : "text-red-500";
  };

  const getTrendIcon = () => {
    if (percentage === 0) {
      return "⬤"; // Circle for 0% 🚀
    }
    return trend === "up" ? "▲" : "▼";
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md flex items-center justify-between hover:shadow-lg transition-all">
      {/* Left Side - Icon and Text */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-full text-xl">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h2 className="text-xl font-bold text-gray-800">{value}</h2>
        </div>
      </div>

      {/* Right Side - Percentage Change */}
      <div className={`text-sm font-semibold ${getTrendColor()}`}>
        {getTrendIcon()} {Math.abs(percentage)}%
      </div>
    </div>
  );
};

KPICard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  percentage: PropTypes.number.isRequired,
  trend: PropTypes.oneOf(["up", "down"]).isRequired,
  icon: PropTypes.node.isRequired,
};

export default KPICard;
