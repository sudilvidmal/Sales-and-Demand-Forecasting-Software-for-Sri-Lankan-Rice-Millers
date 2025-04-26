import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const doughnutOptions = {
  cutout: "70%",
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.raw}`,
      },
    },
  },
};

const ModelPerformanceSummary = () => {
  const [metrics, setMetrics] = useState({ mape: 0, r2_percentage: 0 });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(
          "http://localhost:8000/admin-dashboard/model-summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.error("❌ Unauthorized or failed request", res.status);
          return;
        }

        const data = await res.json();
        setMetrics(data);
      } catch (error) {
        console.error("❌ Failed to fetch model summary:", error);
      }
    };

    fetchSummary();
  }, []);

  const safeMape = isNaN(metrics.mape) ? 0 : metrics.mape;
  const safeR2 = isNaN(metrics.r2_percentage) ? 0 : metrics.r2_percentage;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 space-y-8">
      <h2 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
        📊 XGBoost & LightGBM Model Performance Summary
      </h2>

      {/* 🔵 MAPE Block */}
      <div className="flex flex-col sm:flex-row items-center gap-6 bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
        <div className="w-32 h-32 relative">
          <Doughnut
            data={{
              labels: ["MAPE", "Remaining"],
              datasets: [
                {
                  data: [safeMape, 100 - safeMape],
                  backgroundColor: ["#3b82f6", "#e5e7eb"],
                  borderWidth: 0,
                },
              ],
            }}
            options={doughnutOptions}
          />
          <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-gray-800">
            {safeMape.toFixed(1)}%
          </div>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-medium text-blue-800">
            Mean Absolute Percentage Error (MAPE)
          </h3>
          <p className="text-sm text-gray-600 mt-1 max-w-md">
            This value shows how accurate your predictions are on average. Lower
            values indicate better performance.
          </p>
        </div>
      </div>

      {/* 🟡 R² Block */}
      <div className="flex flex-col sm:flex-row items-center gap-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm">
        <div className="w-32 h-32 relative">
          <Doughnut
            data={{
              labels: ["R² Score", "Remaining"],
              datasets: [
                {
                  data: [safeR2, 100 - safeR2],
                  backgroundColor: ["#f59e0b", "#e5e7eb"],
                  borderWidth: 0,
                },
              ],
            }}
            options={doughnutOptions}
          />
          <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-gray-800">
            {safeR2.toFixed(1)}%
          </div>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-medium text-yellow-700">
            R² Score (Coefficient of Determination)
          </h3>
          <p className="text-sm text-gray-600 mt-1 max-w-md">
            Indicates how well your model explains the variance in the data.
            Higher is better.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformanceSummary;
