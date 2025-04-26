import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import PropTypes from "prop-types";

const ForecastVsActualChart = ({ data, riceType }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-md font-semibold text-gray-700 mb-2">
        📉 Forecast vs Actual - {riceType}
      </h3>

      {hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend /> {/* ✅ Chart Legend Added Here */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#ef4444"
              name="Actual Sales"
              dot={{ r: 2 }}
              isAnimationActive={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#3b82f6"
              name="Forecasted Sales"
              dot={{ r: 2 }}
              isAnimationActive={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-gray-500">
          ⚠️ No data available for this rice type.
        </p>
      )}
    </div>
  );
};

ForecastVsActualChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      actual: PropTypes.number,
      forecast: PropTypes.number,
    })
  ).isRequired,
  riceType: PropTypes.string.isRequired,
};

export default ForecastVsActualChart;
