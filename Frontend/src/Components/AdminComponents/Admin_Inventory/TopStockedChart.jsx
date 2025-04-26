import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const TopStockedChart = () => {
  const [chartData, setChartData] = useState([]);

  const fetchTopStocked = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        "http://localhost:8000/admin/inventory/top-stocked",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChartData(res.data.data || []);
    } catch (err) {
      console.error("❌ Failed to load top stocked chart", err);
    }
  };

  useEffect(() => {
    fetchTopStocked();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-6">
      <h2 className="text-md font-semibold text-gray-800 mb-2">
        📊 Top 5 Most Stocked Rice Types
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="riceType"
            type="category"
            tick={{ fontSize: 12 }}
            width={200}
          />
          <Tooltip />
          <Bar dataKey="quantity" fill="#60a5fa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopStockedChart;
