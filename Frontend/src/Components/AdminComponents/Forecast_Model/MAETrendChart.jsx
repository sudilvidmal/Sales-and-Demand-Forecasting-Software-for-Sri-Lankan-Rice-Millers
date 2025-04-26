// ✅ FRONTEND COMPONENT: MAER2TrendChart.jsx

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

const MAER2TrendChart = ({ data, riceType }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-md font-semibold text-gray-700 mb-2">
        📊 MAE & R² Trend - {riceType}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="training_date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 1]} />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="mae"
            stroke="#ef4444"
            name="MAE"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="r2_score"
            stroke="#3b82f6"
            name="R² Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

MAER2TrendChart.propTypes = {
  data: PropTypes.array.isRequired,
  riceType: PropTypes.string.isRequired,
};

export default MAER2TrendChart;
