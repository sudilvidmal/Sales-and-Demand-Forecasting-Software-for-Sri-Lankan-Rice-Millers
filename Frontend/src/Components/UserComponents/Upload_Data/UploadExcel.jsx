import { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const UploadExcel = ({ onUpload }) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isValid = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    if (!isValid) {
      toast.error("❌ Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    setFileName(file.name);

    // Local preview using XLSX
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawJson = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      if (!rawJson.length) {
        toast.error("❌ Excel file is empty or unreadable.");
        return;
      }

      onUpload(rawJson); // Preview data

      // Prepare file for upload
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("user_token");

      try {
        const response = await fetch("http://localhost:8000/upload-excel", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          toast.success(`✅ ${result.msg}`);
        } else {
          toast.error(`❌ ${result.detail}`);
        }
      } catch (error) {
        toast.error("❌ Failed to upload to server.");
        console.error("Upload error:", error);
      }
    };

    reader.readAsArrayBuffer(file); // Needed for local preview
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <label className="block mb-2 text-gray-700 font-medium">
        Choose Excel File:
      </label>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="mb-4"
      />
      {fileName && (
        <p className="text-sm text-gray-600">
          📄 Selected File: <strong>{fileName}</strong>
        </p>
      )}
    </div>
  );
};

UploadExcel.propTypes = {
  onUpload: PropTypes.func.isRequired,
};

export default UploadExcel;
