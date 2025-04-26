// ...imports remain unchanged
import { useEffect, useState, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "jspdf-autotable";

import SummaryOverview from "./SummaryOverview";
import ForecastAccuracy from "./ForecastAccuracy";
import ForecastData from "./ForecastData";
import InventoryImpact from "./InventoryImpact";
import RiceTypeBreakdown from "./RiceTypeBreakdown";
import InventoryDistribution from "./InventoryDistribution";

const ReportSection = () => {
  const [forecastData, setForecastData] = useState([]);
  const [summary, setSummary] = useState({
    total_sales: 0,
    total_revenue: 0,
    most_sold: "N/A",
    least_sold: "N/A",
    avg_qty_per_day: 0,
    date_range: { from: "N/A", to: "N/A" },
  });
  const [modelInfo, setModelInfo] = useState(null);
  const [filteredForecastAccuracy, setFilteredForecastAccuracy] = useState([]);
  const [inventoryImpactData, setInventoryImpactData] = useState([]);
  const [filteredInventoryImpact, setFilteredInventoryImpact] = useState([]);
  const [inventoryBatches, setInventoryBatches] = useState([]);
  const [filteredForecast, setFilteredForecast] = useState([]);
  const [filteredDistribution, setFilteredDistribution] = useState([]);
  const [filteredRiceBreakdown, setFilteredRiceBreakdown] = useState([]);

  const [sections, setSections] = useState({
    summary: false,
    accuracy: false,
    forecastTable: false,
    inventoryImpact: false,
    riceBreakdown: false,
    inventoryDistribution: false,
  });

  const toggleSection = (key) =>
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const fetchWithAuth = async (url) => {
    const token = localStorage.getItem("user_token");
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  };

  const fetchSummaryData = useCallback(async () => {
    try {
      const result = await fetchWithAuth(
        "http://localhost:8000/report-summary"
      );
      setSummary({
        total_sales: result.total_sales_kg,
        total_revenue: result.total_revenue,
        most_sold: result.most_sold,
        least_sold: result.least_sold,
        avg_qty_per_day: result.avg_per_day,
        date_range: result.date_range || { from: "N/A", to: "N/A" },
      });
    } catch (err) {
      console.error("Summary fetch error:", err.message);
    }
  }, []);

  const fetchModelInfo = useCallback(async () => {
    try {
      const result = await fetchWithAuth("http://localhost:8000/model-info");
      setModelInfo(result);
    } catch (err) {
      console.error("Model info fetch error:", err.message);
    }
  }, []);

  const fetchForecastData = useCallback(async () => {
    try {
      const data = await fetchWithAuth("http://localhost:8000/forecast-data");
      setForecastData(data);
      setFilteredForecast(data);
    } catch (err) {
      console.error("Forecast data fetch error:", err.message);
    }
  }, []);

  const fetchInventoryImpact = useCallback(async () => {
    try {
      const result = await fetchWithAuth(
        "http://localhost:8000/inventory-impact"
      );
      setInventoryImpactData(Array.isArray(result) ? result : []);
      setFilteredInventoryImpact(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Inventory impact fetch error:", err.message);
    }
  }, []);

  const fetchInventoryDistribution = useCallback(async () => {
    try {
      const result = await fetchWithAuth(
        "http://localhost:8000/inventory-distribution"
      );
      setInventoryBatches(result);
      setFilteredDistribution(result);
    } catch (err) {
      console.error("Inventory distribution fetch error:", err.message);
    }
  }, []);


  const sectionDescriptions = {
    summary:
      "Provides a high-level overview of total sales, revenue, most and least sold items, and average daily performance.",
    accuracy:
      "Displays the accuracy of the forecasting model using MAE and R² score metrics for each rice type.",
    forecastTable:
      "Shows a 30-day forecast of rice sales including date-wise predicted quantities.",
    inventoryImpact:
      "Highlights how current inventory levels are affected by forecasted sales and indicates potential shortages.",
    riceBreakdown:
      "Breaks down total sales and revenue by rice type along with average selling prices.",
    inventoryDistribution:
      "Details the distribution of inventory across warehouses including batch numbers and quantities.",
  };


const exportPDF = () => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const drawPageBorder = () => {
    doc.setLineWidth(0.3);
    doc.setDrawColor(0); // black border
    doc.rect(10, 10, 190, 277); // consistent A4 margin
  };

  // 🔁 Draw border on the first page
  drawPageBorder();

  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Sales and Forecasting Report", 14, y);
  y += 10;

  const addSectionTitle = (title) => {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.setFillColor(230, 230, 230);
    doc.rect(14, y, 182, 8, "F");
    doc.text(title, 16, y + 6);
    y += 12;
  };

  const addDescription = (desc) => {
    y += 3;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(desc, 180);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 6;
  };

  const tableOptions = {
    startY: y,
    theme: "striped",
    headStyles: { fillColor: [22, 160, 133] },
    margin: { left: 14, right: 14 },
    didDrawPage: () => {
      drawPageBorder(); // ✅ Draw border on each new page
    },
  };

  if (sections.summary) {
    addSectionTitle("Summary Overview");
    addDescription(sectionDescriptions.summary);
    doc.setFontSize(10);
    doc.text(`Total Sales (KG): ${summary.total_sales}`, 14, y);
    y += 5;
    doc.text(
      `Total Revenue: Rs. ${summary.total_revenue.toLocaleString()}`,
      14,
      y
    );
    y += 5;
    doc.text(`Most Sold: ${summary.most_sold}`, 14, y);
    y += 5;
    doc.text(`Least Sold: ${summary.least_sold}`, 14, y);
    y += 5;
    doc.text(`Avg Daily Sales: ${summary.avg_qty_per_day}`, 14, y);
    y += 5;
    doc.text(
      `Date Range: ${summary.date_range.from} to ${summary.date_range.to}`,
      14,
      y
    );
    y += 10;
  }

  if (sections.accuracy && filteredForecastAccuracy.length > 0) {
    addSectionTitle("Forecast Accuracy Summary");
    addDescription(sectionDescriptions.accuracy);
    autoTable(doc, {
      ...tableOptions,
      startY: y,
      head: [["Rice Type", "MAE (KG)", "R² Score"]],
      body: filteredForecastAccuracy.map((r) => [
        r.rice_type,
        typeof r.mae === "number" ? r.mae.toFixed(2) : "N/A",
        typeof r.r2_score === "number" ? r.r2_score.toFixed(2) : "N/A",
      ]),
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (sections.forecastTable && filteredForecast.length > 0) {
    addSectionTitle("Forecast (Next 30 Days)");
    addDescription(sectionDescriptions.forecastTable);
    autoTable(doc, {
      ...tableOptions,
      startY: y,
      head: [["Date", "Rice Type", "Forecast (KG)"]],
      body: filteredForecast.map((row) => [
        row.date,
        row.rice_type,
        row.forecast,
      ]),
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (sections.inventoryImpact && filteredInventoryImpact.length > 0) {
    addSectionTitle("Inventory Impact");
    addDescription(sectionDescriptions.inventoryImpact);
    autoTable(doc, {
      ...tableOptions,
      startY: y,
      head: [
        [
          "Rice Type",
          "Current Stock",
          "Forecast Qty",
          "Post Forecast",
          "Status",
        ],
      ],
      body: filteredInventoryImpact.map((row) => [
        row.riceType,
        `${row.current_stock_kg} KG`,
        `${row.forecast_30_days_qty} KG`,
        `${row.post_forecast_stock_kg} KG`,
        row.status,
      ]),
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (sections.riceBreakdown && filteredRiceBreakdown.length > 0) {
    addSectionTitle("Rice Type Breakdown");
    addDescription(sectionDescriptions.riceBreakdown);
    autoTable(doc, {
      ...tableOptions,
      startY: y,
      head: [
        ["Rice Type", "Total Sold (KG)", "Revenue (Rs.)", "Avg Price (Rs.)"],
      ],
      body: filteredRiceBreakdown.map((row) => [
        row.rice_type,
        row.total_quantity,
        `Rs. ${row.total_revenue.toLocaleString()}`,
        `Rs. ${row.avg_price_per_kg.toFixed(2)}`,
      ]),
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (sections.inventoryDistribution && filteredDistribution.length > 0) {
    addSectionTitle("Inventory Distribution");
    addDescription(sectionDescriptions.inventoryDistribution);
    autoTable(doc, {
      ...tableOptions,
      startY: y,
      head: [
        ["Rice Type", "Batch No", "Warehouse", "Quantity", "Received Date"],
      ],
      body: filteredDistribution.map((b) => [
        b.riceType,
        b.batchNo,
        b.warehouse,
        b.quantity,
        b.dateReceived,
      ]),
    });
  }

  doc.save("sales_forecast_report.pdf");
};


  useEffect(() => {
    fetchSummaryData();
    fetchModelInfo();
    fetchForecastData();
    fetchInventoryImpact();
    fetchInventoryDistribution();
  }, [
    fetchSummaryData,
    fetchModelInfo,
    fetchForecastData,
    fetchInventoryImpact,
    fetchInventoryDistribution,
  ]);

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="mt-2 border-t pt-4">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              Select Report Sections to Include:
            </div>
            {Object.values(sections).some(Boolean) && (
              <button
                onClick={exportPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow"
              >
                Export PDF
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm mt-4">
            {Object.entries({
              summary: "Summary Overview",
              accuracy: "Forecast Accuracy",
              forecastTable: "Forecast (Next 90 Days)",
              inventoryImpact: "Inventory Impact",
              riceBreakdown: "Rice Type Breakdown",
              inventoryDistribution: "Inventory Distribution",
            }).map(([key, label]) => (
              <label key={key} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={sections[key]}
                  onChange={() => toggleSection(key)}
                  className="accent-blue-600"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.summary && (
          <SummaryOverview
            data={{
              totalSalesKG: summary.total_sales,
              totalRevenue: summary.total_revenue,
              mostSold: summary.most_sold,
              leastSold: summary.least_sold,
              averagePerDay: summary.avg_qty_per_day,
              dateRange: `${summary.date_range.from} to ${summary.date_range.to}`,
            }}
          />
        )}

        {sections.accuracy && modelInfo && (
          <ForecastAccuracy
            model={modelInfo}
            onFilteredDataChange={(f) => setFilteredForecastAccuracy(f)}
          />
        )}

        {sections.forecastTable && (
          <ForecastData
            data={forecastData}
            onFilteredDataChange={(f) => setFilteredForecast(f)}
          />
        )}

        {sections.inventoryImpact && (
          <InventoryImpact
            inventory={inventoryImpactData}
            onFilteredChange={(f) => setFilteredInventoryImpact(f)}
          />
        )}

        {sections.riceBreakdown && (
          <RiceTypeBreakdown
            onFilteredChange={(f) => setFilteredRiceBreakdown(f)}
          />
        )}

        {sections.inventoryDistribution && (
          <InventoryDistribution
            batches={inventoryBatches}
            onFilteredChange={(f) => setFilteredDistribution(f)}
          />
        )}
      </div>
    </>
  );
};

export default ReportSection;
