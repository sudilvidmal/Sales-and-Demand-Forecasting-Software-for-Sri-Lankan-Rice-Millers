import { useState } from "react";
import UploadExcel from "./UploadExcel";
import ManualEntryForm from "./ManualEntryForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Upload_data = () => {
  const [mode, setMode] = useState("upload");
  const [parsedData, setParsedData] = useState([]);

  const handleSubmit = () => {
    toast.success("✅ Data successfully submitted to backend!");
    console.log("Submitted data:", parsedData);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        📊 Daily Sales Data Entry
      </h1>

      {/* Mode Switch */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-md text-sm ${
            mode === "upload"
              ? "bg-blue-500 text-white"
              : "bg-white border text-gray-700"
          }`}
          onClick={() => {
            setMode("upload");
            setParsedData([]); // Clear preview when switching
          }}
        >
          Upload Excel File
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm ${
            mode === "manual"
              ? "bg-blue-500 text-white"
              : "bg-white border text-gray-700"
          }`}
          onClick={() => {
            setMode("manual");
            setParsedData([]); // Clear preview when switching
          }}
        >
          Manually Enter Data
        </button>
      </div>

      {/* Mode Views */}
      {mode === "upload" && (
        <UploadExcel onUpload={(data) => setParsedData(data)} />
      )}
      {mode === "manual" && (
        <ManualEntryForm
          onAdd={(newRow) => setParsedData((prev) => [...prev, newRow])}
        />
      )}

      {/* 📄 Show preview table only for upload mode */}
      {mode === "upload" && parsedData.length > 0 && (
        <div className="bg-white p-4 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">
            🧾 Data Preview
          </h2>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto border border-gray-200 rounded">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-blue-100 sticky top-0 z-10">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Rice Type</th>
                  <th className="p-2 border">Quantity (KG)</th>
                  <th className="p-2 border">Amount per 1KG (Rs)</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2 border">{row["Date"]}</td>
                    <td className="p-2 border">{row["Rice Type"]}</td>
                    <td className="p-2 border">{row["Quantity (KG)"]}</td>
                    <td className="p-2 border">{row["Amount per 1KG (Rs)"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow"
            >
              ✅ Submit Data to Backend
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload_data;
