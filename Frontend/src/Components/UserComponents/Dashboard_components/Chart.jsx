import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import axios from "axios";

const Chart = ({ title, type }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem("user_token");

        const res = await axios.get(
          "http://localhost:8000/user/dashboard/charts",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const allData = res.data;

        if (title === "Rice Sales (Last 7 Days)") {
          setData(allData.rice_sales_last_7_days || []);
        } else if (title === "Upcoming Forecasted Demand") {
          const cleanedData = (allData.forecasted_demand || []).map((item) => {
            const cleanedName = item.name
              .replace(/SIERRA|SAUMYA|RICE/gi, "")
              .replace(/-/g, "")
              .replace(/\s{2,}/g, " ")
              .trim();
            return { name: cleanedName, value: item.value };
          });
          setData(cleanedData);
        } else if (title === "Stock Movement Per Day") {
          setData(allData.stock_movement || []);
        }
      } catch (err) {
        console.error("❌ Failed to fetch chart data:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [title]);

  return (
    <div className="w-full h-60">
      <h3 className="text-gray-700 font-semibold mb-2">{title}</h3>
      {loading ? (
        <p className="text-sm text-gray-500 mt-4">⏳ Loading chart...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-red-500 mt-4">📭 No data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          {type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </div> 
  );
};

Chart.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["line", "bar"]).isRequired,
};

export default Chart;
