import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: { font: { size: 10 } },
    },
    tooltip: {
      titleFont: { size: 12 },
      bodyFont: { size: 11 },
    },
  },
  scales: {
    x: {
      ticks: {
        font: { size: 10 },
        maxRotation: 45,
        minRotation: 45,
        autoSkip: false,
      },
      grid: { display: false },
    },
    y: {
      ticks: { font: { size: 10 } },
    },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
      labels: {
        font: { size: 10 },
        padding: 10,
      },
    },
    datalabels: {
      color: "#000",
      font: { size: 10 },
      formatter: (value, context) => {
        const total = context.dataset.data.reduce((a, b) => a + b, 0);
        const percentage = ((value / total) * 100).toFixed(1);
        return `${percentage}%`;
      },
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const value = context.raw;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${context.label}: ${value} KG (${percentage}%)`;
        },
      },
    },
  },
};

const UserSalesCharts = () => {
  const [barData, setBarData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [lineData, setLineData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChartData = async () => {
      const token = localStorage.getItem("user_token");

      try {
        const res = await axios.get("http://localhost:8000/user/sales/charts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;

        setBarData({
          labels: data.bar.labels,
          datasets: [
            {
              label: "Quantity (KG)",
              data: data.bar.data,
              backgroundColor: "#60a5fa",
              borderRadius: 4,
            },
          ],
        });

        setPieData({
          labels: data.pie.labels,
          datasets: [
            {
              data: data.pie.data,
              backgroundColor: [
                "#60a5fa",
                "#f87171",
                "#facc15",
                "#34d399",
                "#818cf8",
                "#fb923c",
                "#a78bfa",
                "#f472b6",
                "#fcd34d",
                "#38bdf8",
                "#c084fc",
              ],
            },
          ],
        });

        setLineData({
          labels: data.line.labels,
          datasets: [
            {
              label: "Daily Sales (KG)",
              data: data.line.data,
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              tension: 0.3,
              pointRadius: 4,
            },
          ],
        });
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
        setError("❌ Failed to load chart data.");
      }
    };

    fetchChartData();
  }, []);

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (!barData || !pieData || !lineData) {
    return <p className="text-sm text-gray-500">⏳ Loading charts...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 📊 Bar Chart */}
      <div className="bg-white p-4 rounded shadow h-[300px]">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          📊 Sales by Rice Type (Bar)
        </h3>
        <div className="h-[240px]">
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      {/* 🥧 Pie Chart */}
      <div className="bg-white p-4 rounded shadow h-[300px]">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          🥧 Sales Distribution (Pie)
        </h3>
        <div className="overflow-x-auto">
          <div className="w-[500px] h-[240px] mx-auto">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* 📈 Line Chart */}
      <div className="bg-white p-4 rounded shadow md:col-span-2 h-[340px]">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          📈 Sales Trend (Line)
        </h3>
        <div className="h-[280px]">
          <Line data={lineData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default UserSalesCharts;
