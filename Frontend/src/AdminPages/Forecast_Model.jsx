import { useEffect, useState } from "react";
import Admin_Sidebar from "../Components/AdminComponents/Admin_Sidebar/Admin_sidebar";
import Admin_Navbar from "../Components/AdminComponents/Admin_Navbar/Admin_Navbar";
import TrainingDetails from "../Components/AdminComponents/Forecast_Model/TrainingDetails";
import AccuracyMetricsTable from "../Components/AdminComponents/Forecast_Model/ForecastAccuracyTable";
import ForecastVsActualChart from "../Components/AdminComponents/Forecast_Model/ForecastVsActualChart";
import InsightCards from "../Components/AdminComponents/Forecast_Model/InsightCards";
import ForecastRunHistory from "../Components/AdminComponents/Forecast_Model/ForecastRunHistory";
import MAETrendChart from "../Components/AdminComponents/Forecast_Model/MAETrendChart";
import PageLoader from "../Components/Common/PageLoader"; // ✅ Import PageLoader

const Forecast_Model = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [trainingInfo, setTrainingInfo] = useState(null);
  const [accuracyData, setAccuracyData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedRiceType, setSelectedRiceType] = useState("");
  const [runHistory, setRunHistory] = useState([]);
  const [maeTrendData, setMaeTrendData] = useState([]);
  const [loading, setLoading] = useState(true); // 🌟 Full page loading
  const [fadeIn, setFadeIn] = useState(false);

  const token = localStorage.getItem("admin_token");

  const handleToggleSidebar = () => setShowSidebar(!showSidebar);
  const handleCloseSidebar = () => setShowSidebar(false);

  useEffect(() => {
    fetchTrainingInfo();
    fetchAccuracyData();
    fetchRunHistory();
  }, []);

  const fetchTrainingInfo = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/admin-forecast/training-details",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setTrainingInfo(data);
    } catch (err) {
      console.error("❌ Error fetching training info:", err);
    }
  };

  const fetchAccuracyData = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/admin-forecast/accuracy-metrics",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setAccuracyData(data);
      if (data.length > 0) {
        const first = data[0].rice_type;
        setSelectedRiceType(first);
        fetchChartData(first);
        fetchMAETrend(first);
      }
    } catch (err) {
      console.error("❌ Error fetching accuracy data:", err);
    }
  };

  const fetchChartData = async (riceType) => {
    try {
      const res = await fetch(
        `http://localhost:8000/admin-forecast/forecast-vs-actual?rice_type=${encodeURIComponent(
          riceType
        )}&data_type=test`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setChartData(data);
    } catch (err) {
      console.error("❌ Error fetching chart data:", err);
    }
  };

  const fetchMAETrend = async (riceType) => {
    try {
      const res = await fetch(
        `http://localhost:8000/admin-forecast/mae-r2-trend?rice_type=${encodeURIComponent(
          riceType
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setMaeTrendData(data);
    } catch (err) {
      console.error("❌ Error fetching MAE/R2 trend:", err);
    } finally {
      // 🚀 After last important load
      setLoading(false);
      setTimeout(() => setFadeIn(true), 100);
    }
  };

  const fetchRunHistory = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/admin-forecast/run-history",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setRunHistory(data);
    } catch (err) {
      console.error("❌ Error fetching run history:", err);
    }
  };

  const handleRiceTypeChange = (e) => {
    const type = e.target.value;
    setSelectedRiceType(type);
    fetchChartData(type);
    fetchMAETrend(type);
  };

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      {/* 🔒 Mobile Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-20 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* 📚 Sidebar */}
      <Admin_Sidebar
        showSidebar={showSidebar}
        onCloseSidebar={handleCloseSidebar}
      />

      {/* 🧭 Navbar */}
      <Admin_Navbar onToggleSidebar={handleToggleSidebar} />

      {loading ? (
        <div className="flex-1 flex flex-col md:ml-64 mt-[64px] p-4 sm:p-6 overflow-auto">
          <PageLoader pageType="forecast-model" />
        </div>
      ) : (
        <div
          className={`flex-1 flex flex-col md:ml-64 z-10 p-4 sm:p-6 overflow-auto mt-[64px] space-y-8 transition-all duration-700 ${
            fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          {/* 🧠 Model Overview */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              🧠 Forecasting Model Overview
            </h2>
            {trainingInfo && (
              <TrainingDetails
                model={trainingInfo.model_name}
                trainingDate={trainingInfo.training_date}
                horizon={trainingInfo.forecast_horizon_days}
                riceTypes={trainingInfo.total_rice_types_modeled}
                totalRecords={trainingInfo.total_records_used}
                dateRange={trainingInfo.date_range}
              />
            )}
          </section>

          {/* 📊 Insight Cards */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              📊 Key Performance Insights
            </h2>
            <InsightCards data={accuracyData} />
          </section>

          {/* 📋 Accuracy Table */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              📋 Forecast Accuracy by Rice Type
            </h2>
            <AccuracyMetricsTable data={accuracyData} />
          </section>

          {/* 🔽 Chart Selector */}
          {accuracyData.length > 0 && (
            <section>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📌 Select Rice Type for Charts
              </label>
              <select
                value={selectedRiceType}
                onChange={handleRiceTypeChange}
                className="block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                {accuracyData.map((item, index) => (
                  <option key={index} value={item.rice_type}>
                    {item.rice_type}
                  </option>
                ))}
              </select>
            </section>
          )}

          {/* 📈 Forecast vs Actual */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              📈 Forecast vs Actual
            </h2>
            {selectedRiceType && chartData.length > 0 ? (
              <ForecastVsActualChart
                data={chartData}
                riceType={selectedRiceType}
              />
            ) : (
              <p className="text-sm text-gray-500">
                📉 No chart data available for selected rice type.
              </p>
            )}
          </section>

          {/* 📉 MAE Trend */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              📉 MAE / R² Trend Over Time
            </h2>
            {selectedRiceType && maeTrendData.length > 0 ? (
              <MAETrendChart data={maeTrendData} riceType={selectedRiceType} />
            ) : (
              <p className="text-sm text-gray-500">
                📉 No trend data available for selected rice type.
              </p>
            )}
          </section>

          {/* 🗓 Run History */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              🗓 Forecast Run History
            </h2>
            {runHistory.length > 0 ? (
              <ForecastRunHistory trainingData={runHistory} />
            ) : (
              <p className="text-sm text-gray-500">
                No training history available.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Forecast_Model;
