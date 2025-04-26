import { saveAs } from "file-saver";
import PropTypes from "prop-types";

const ExportOptions = ({ riceType, forecastData }) => {
  const handleExportCSV = () => {
    if (!forecastData || forecastData.length === 0) {
      alert("⚠️ No forecast data available to export.");
      return;
    }

    const headers = ["Date", "Predicted Quantity (KG)"]; 
    const rows = forecastData.map((item) => [
      item.date,
      item.quantity.toFixed(2),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const filename = `${riceType.replace(/\s+/g, "_")}_forecast.csv`;
    saveAs(blob, filename);
  };

  return (
    <div className="flex justify-end mt-4">
      <button
        onClick={handleExportCSV}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
      >
        ⬇️ Export Forecast as CSV
      </button>
    </div>
  );
};

ExportOptions.propTypes = {
  riceType: PropTypes.string.isRequired,
  forecastData: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ExportOptions;
