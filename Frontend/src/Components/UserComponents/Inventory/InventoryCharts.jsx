import { useEffect, useState } from "react";
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
  TimeScale,
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
  TimeScale,
  ChartDataLabels
);

const InventoryCharts = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [pieData, setPieData] = useState(null);
  const [lineData, setLineData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("user_token");

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [invRes, pieRes, lineRes] = await Promise.all([
          fetch("http://localhost:8000/inventory/all", { headers }),
          fetch("http://localhost:8000/inventory/pie", { headers }),
          fetch("http://localhost:8000/inventory/line", { headers }),
        ]);

        const invData = await invRes.json();
        const pie = await pieRes.json();
        const line = await lineRes.json();

        // ✅ Fallback pie colors if missing
        if (
          pie &&
          pie.datasets &&
          pie.datasets[0] &&
          (!pie.datasets[0].backgroundColor ||
            pie.datasets[0].backgroundColor.length === 0)
        ) {
          const fallbackColors = [
            "#60a5fa", "#facc15", "#f87171", "#34d399", "#f472b6",
            "#818cf8", "#fb923c", "#22d3ee", "#a78bfa", "#ef4444",
            "#10b981", "#6366f1"
          ];
          pie.datasets[0].backgroundColor = pie.labels.map(
            (_, i) => fallbackColors[i % fallbackColors.length]
          );
        }

        // ✅ Fallback line colors
        if (
          line &&
          line.datasets &&
          line.datasets[0] &&
          !line.datasets[0].borderColor
        ) {
          line.datasets[0].borderColor = "#10b981";
          line.datasets[0].backgroundColor = "#a7f3d0";
          line.datasets[0].tension = 0.3;
        }

        setInventoryData(invData || []);
        setPieData(pie);
        setLineData(line);
      } catch (err) {
        console.error("❌ Failed to load inventory chart data:", err);
      }
    };

    fetchData();
  }, []);

  // ✅ Bar Chart Setup
  const riceTypeQuantities = inventoryData.reduce((acc, item) => {
    acc[item.riceType] = (acc[item.riceType] || 0) + item.quantity;
    return acc;
  }, {});

  const sortedEntries = Object.entries(riceTypeQuantities).sort(
    (a, b) => b[1] - a[1]
  );

  const barLabels = sortedEntries.map(([label]) =>
    label.length > 20 ? label.slice(0, 18) + "..." : label
  );
  const fullLabels = sortedEntries.map(([label]) => label);
  const barValues = sortedEntries.map(([, value]) => value);

  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: "Quantity (KG)",
        data: barValues,
        backgroundColor: "#60a5fa",
        borderRadius: 4,
        barThickness: 30,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `🧺 ${fullLabels[ctx.dataIndex]}: ${ctx.parsed.y} KG`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: { size: 10 },
          autoSkip: false,
          maxRotation: 45,
          minRotation: 25,
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 10 },
          callback: (value) => `${value} KG`,
        },
      },
    },
  };

  // ✅ Pie Options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 10 },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { size: 10 },
          usePointStyle: true,
        },
      },
      datalabels: {
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce(
            (a, b) => a + b,
            0
          );
          const percent = ((value / total) * 100).toFixed(1);
          const label = context.chart.data.labels[context.dataIndex];
          return `${label.split(" ")[0]}:\n${percent}%`;
        },
        color: "#fff",
        font: { weight: "bold", size: 9 },
        display: "auto",
        padding: 4,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.label || "";
            const value = ctx.parsed;
            return `${label}: ${value.toLocaleString()} KG`;
          },
        },
      },
    },
  };

  // ✅ Line Options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: { size: 10 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `📦 ${ctx.parsed.y} KG on ${ctx.label}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: { size: 10 },
          autoSkip: false,
          maxRotation: 45,
          minRotation: 25,
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 10 },
          callback: (value) => `${value} KG`,
        },
      },
    },
    elements: {
      line: { tension: 0.3 },
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: "#10b981",
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 📊 Bar Chart */}
      <div
        className="bg-white p-4 rounded shadow overflow-x-auto"
        style={{ minHeight: "280px" }}
      >
        <h3 className="text-sm font-semibold mb-2 text-gray-700">
          📊 Quantity per Rice Type
        </h3>
        {barData?.labels?.length > 0 ? (
          <div
            style={{
              width: `${barData.labels.length * 60}px`,
              height: "220px",
            }}
          >
            <Bar data={barData} options={barOptions} />
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            📭 No data to display in bar chart.
          </div>
        )}
      </div>

      {/* 🧭 Pie Chart */}
      <div className="bg-white p-4 rounded shadow" style={{ height: "300px" }}>
        <h3 className="text-sm font-semibold mb-2 text-gray-700">
          🧭 Inventory Distribution by Rice Type
        </h3>
        <div className="h-full flex justify-center items-center">
          {pieData?.labels?.length > 0 ? (
            <Pie
              data={pieData}
              options={pieOptions}
              plugins={[ChartDataLabels]}
            />
          ) : (
            <span className="text-gray-500 text-sm">
              📭 No data to display in pie chart.
            </span>
          )}
        </div>
      </div>

      {/* 📅 Line Chart */}
      <div
        className="bg-white p-4 rounded shadow md:col-span-2"
        style={{ height: "300px" }}
      >
        <h3 className="text-sm font-semibold mb-2 text-gray-700">
          📅 Stock Additions Over Time
        </h3>
        <div className="h-full">
          {lineData?.labels?.length > 0 ? (
            <Line data={lineData} options={lineOptions} />
          ) : (
            <div className="text-gray-500 text-sm mt-4">
              📭 No data to display in line chart.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryCharts;
