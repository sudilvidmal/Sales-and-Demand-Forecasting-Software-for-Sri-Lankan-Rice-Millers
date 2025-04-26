import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import PropTypes from "prop-types";

const ForecastChart = ({ riceType, forecastData }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">
        📊 Sales Forecast for {riceType}
      </h3>
      {forecastData.length === 0 ? (
        <p className="text-sm text-gray-500">No forecast data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="quantity" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

ForecastChart.propTypes = {
  riceType: PropTypes.string.isRequired,
  forecastData: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ForecastChart;
