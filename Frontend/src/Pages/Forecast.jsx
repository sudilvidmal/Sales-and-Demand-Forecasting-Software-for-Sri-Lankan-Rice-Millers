import { useState, useEffect, useCallback } from "react";
import ForecastHeader from "../Components/UserComponents/Forecast/ForecastHeader";
import RiceTypeSelector from "../Components/UserComponents/Forecast/RiceTypeSelector";
import ForecastChart from "../Components/UserComponents/Forecast/ForecastChart";
import ForecastTable from "../Components/UserComponents/Forecast/ForecastTable";
import ExportOptions from "../Components/UserComponents/Forecast/ExportOptions";
import DemandSummary from "../Components/UserComponents/Demand/DemandSummary"; // ✅ Updated
import DemandTable from "../Components/UserComponents/Demand/DemandTable";
import DemandDistributionChart from "../Components/UserComponents/Demand/DemandDistributionChart";
import Layout from "../Components/Layout";
import PageLoader from "../Components/Common/PageLoader";

const Forecast = () => {
  const [selectedRice, setSelectedRice] = useState("SIERRA RED RAW RICE -5KG");
  const [selectedDays, setSelectedDays] = useState(30);
  const [forecastData, setForecastData] = useState([]);
  const [filteredForecastData, setFilteredForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [error, setError] = useState("");
  const [fadeIn, setFadeIn] = useState(false);

  const [activeSection, setActiveSection] = useState("forecast"); // ✅ Track which section

  const fetchForecast = useCallback(async () => {
    try {
      setError("");
      const token = localStorage.getItem("user_token");
      const response = await fetch(
        `http://localhost:8000/forecast?riceType=${encodeURIComponent(
          selectedRice
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        setForecastData(data.forecasts || []);
      } else {
        setForecastData([]);
        setError(data.detail || "Failed to fetch forecast data.");
        console.error("Error fetching forecast:", data.detail);
      }
    } catch (error) {
      console.error("Failed to fetch forecast data:", error);
      setForecastData([]);
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setFadeIn(true), 100);
    }
  }, [selectedRice]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  useEffect(() => {
    const slicedData = forecastData.slice(0, selectedDays);
    setFilteredForecastData(slicedData);
  }, [forecastData, selectedDays]);

  const handleGenerateForecast = async () => {
    try {
      setGenerateLoading(true);
      setError("");
      const token = localStorage.getItem("user_token");
      const response = await fetch(
        "http://localhost:8000/forecast/run-forecast",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();

      if (response.ok) {
        console.log("✅ Forecast generated:", result.message);
        await fetchForecast();
      } else {
        console.error("❌ Generation failed:", result.detail);
        setError(result.detail || "Failed to generate forecast.");
      }
    } catch (error) {
      console.error("❌ Forecast generation error:", error);
      setError("Failed to generate forecast. Please try again.");
    } finally {
      setGenerateLoading(false);
    }
  };

  return (
    <Layout>
      {loading ? (
        <PageLoader pageType="forecast" />
      ) : (
        <div
          className={`min-h-screen flex bg-gray-100 relative transition-all duration-700 ${
            fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
          aria-busy="false"
        >
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-auto space-y-6">
            {/* 🔥 Improved Section Switcher */}
            <div className="flex gap-2 bg-white p-2 rounded-lg shadow w-max">
              <button
                className={`px-5 py-2 rounded-md font-medium text-sm transition-all duration-300 ${
                  activeSection === "forecast"
                    ? "bg-blue-600 text-white shadow"
                    : "text-blue-600 hover:bg-blue-100"
                }`}
                onClick={() => setActiveSection("forecast")}
              >
                Forecast
              </button>
              <button
                className={`px-5 py-2 rounded-md font-medium text-sm transition-all duration-300 ${
                  activeSection === "demand"
                    ? "bg-green-600 text-white shadow"
                    : "text-green-600 hover:bg-green-100"
                }`}
                onClick={() => setActiveSection("demand")}
              >
                Demand
              </button>
            </div>

            {/* 📛 Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded">
                ⚠️ {error}
                <button
                  onClick={fetchForecast}
                  className="ml-4 text-blue-600 underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* 🎯 Section Content */}
            {activeSection === "forecast" ? (
              <>
                <ForecastHeader
                  onGenerate={handleGenerateForecast}
                  loading={generateLoading}
                />
                <RiceTypeSelector
                  selectedRice={selectedRice}
                  onRiceChange={setSelectedRice}
                  selectedDays={selectedDays}
                  onDaysChange={setSelectedDays}
                />
                <ForecastChart
                  riceType={selectedRice}
                  forecastData={filteredForecastData}
                />
                <ForecastTable
                  riceType={selectedRice}
                  forecastData={filteredForecastData}
                />
                <ExportOptions
                  riceType={selectedRice}
                  forecastData={filteredForecastData}
                />
              </>
            ) : (
              <>
                {/* 🛒 Demand Section */}
                <DemandSummary /> {/* ✅ NO props needed now */}
                <DemandTable forecastData={filteredForecastData} />
                <DemandDistributionChart forecastData={filteredForecastData} />
              </>
            )} 
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Forecast;
