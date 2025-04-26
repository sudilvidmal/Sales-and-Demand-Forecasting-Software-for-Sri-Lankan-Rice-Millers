import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DemandDistributionChart = () => {
  const [dayFilter, setDayFilter] = useState(30);
  const [distributionData, setDistributionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDistributionData = async (days) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("user_token");
      const res = await fetch(
        `http://localhost:8000/user/demand/distribution?days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setDistributionData(data.data || []);
      } else {
        setError(data.detail || "Failed to fetch demand distribution.");
      }
    } catch (err) {
      console.error("❌ Error fetching distribution:", err);
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributionData(dayFilter);
  }, [dayFilter]);

  if (loading) {
    return (
      <p className="text-gray-500 text-sm">⏳ Loading demand distribution...</p>
    );
  }

  if (error) {
    return <p className="text-red-500 text-sm">❌ {error}</p>;
  }

  const labels = distributionData.map((item) => item.rice_type);
  const values = distributionData.map((item) => item.total_qty);

  const generateColors = (count) => {
    return Array.from(
      { length: count },
      () => `hsl(${Math.floor(Math.random() * 360)}, 65%, 60%)`
    );
  };

  const colors = generateColors(labels.length);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          🥧 Demand Distribution (Pie)
        </h2>
        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(parseInt(e.target.value))}
          className="border p-2 rounded text-sm"
        >
          <option value={30}>Next 30 Days</option>
          <option value={60}>Next 60 Days</option>
          <option value={90}>Next 90 Days</option>
        </select>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center">
        <div className="w-[400px] h-[400px] mb-6 lg:mb-0">
          {" "}
          {/* 🎯 Bigger Chart */}
          <Pie
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "right",
                  labels: {
                    font: {
                      size: 12,
                    },
                    boxWidth: 15,
                    padding: 15,
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const label = context.label || "";
                      const value = context.parsed || 0;
                      const total = context.dataset.data.reduce(
                        (a, b) => a + b,
                        0
                      );
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ${percentage}% (${value.toFixed(
                        2
                      )} KG)`;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DemandDistributionChart;
