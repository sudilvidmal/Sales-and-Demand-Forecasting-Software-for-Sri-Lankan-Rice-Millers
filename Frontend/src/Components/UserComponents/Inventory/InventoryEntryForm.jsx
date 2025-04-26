import { useState } from "react";
import { toast } from "react-toastify";

const riceTypes = [
  "SIERRA RED RAW RICE -5KG",
  "SIERRA RED RAW RICE -10KG",
  "SIERRA RED RAW RICE -25KG",
  "SIERRA WHITE BASMATHI RICE -5KG",
  "SIERRA WHITE BASMATHI RICE -25KG",
  "SIERRA WHITE RAW RICE -5KG",
  "SIERRA WHITE RAW RICE -10KG",
  "SIERRA WHITE RAW RICE -25KG",
  "SAUMYA WHITE NADU RICE 5KG",
  "SAUMYA WHITE NADU RICE 10KG",
  "SAUMYA WHITE NADU RICE 25KG",
];

const InventoryEntryForm = () => {
  const [formData, setFormData] = useState({
    riceType: "",
    quantity: "",
    batchNo: "",
    warehouse: "",
    dateReceived: "",
  });

  const [previewRows, setPreviewRows] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdateRow = (e) => {
    e.preventDefault();

    if (!formData.riceType || !formData.quantity || !formData.dateReceived) {
      toast.error("Please fill required fields.");
      return;
    }

    if (editIndex !== null) {
      const updatedRows = [...previewRows];
      updatedRows[editIndex] = formData;
      setPreviewRows(updatedRows);
      toast.success("🔄 Row updated successfully!");
      setEditIndex(null);
    } else {
      setPreviewRows((prev) => [...prev, formData]);
      toast.success("✅ Row added to preview!");
    }

    setFormData({
      riceType: "",
      quantity: "",
      batchNo: "",
      warehouse: "",
      dateReceived: "",
    });
  };

  const handleRemoveRow = (index) => {
    const updated = [...previewRows];
    updated.splice(index, 1);
    setPreviewRows(updated);
    toast.info("🗑 Row removed.");
  };

  const handleEditRow = (index) => {
    setFormData(previewRows[index]);
    setEditIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalSubmit = async () => {
    if (previewRows.length === 0) {
      toast.warning("🚫 No entries to submit.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("user_token");

      const res = await fetch("http://localhost:8000/inventory/bulk-add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ JWT added
        },
        body: JSON.stringify(previewRows),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`✅ ${result.count} inventory items successfully added!`);
        setPreviewRows([]);
      } else {
        const err = await res.json();
        toast.error(`❌ Submission failed: ${err.detail}`);
      }
    } catch (err) {
      toast.error("⚠️ Network error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddOrUpdateRow} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rice Type
            </label>
            <select
              name="riceType"
              value={formData.riceType}
              onChange={handleChange}
              required
              className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">-- Select Rice Type --</option>
              {riceTypes.map((type, i) => (
                <option key={i} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity (KG)
            </label>
            <input
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Batch No.
            </label>
            <input
              name="batchNo"
              value={formData.batchNo}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Warehouse
            </label>
            <select
              name="warehouse"
              value={formData.warehouse}
              onChange={handleChange}
              required
              className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">-- Select Warehouse --</option>
              <option value="Pannipitiya">Pannipitiya</option>
              <option value="Kurunagala">Kurunagala</option>
              <option value="Matara">Matara</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date Received
            </label>
            <input
              name="dateReceived"
              type="date"
              value={formData.dateReceived}
              onChange={handleChange}
              required
              className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className={`${
            editIndex !== null
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white px-4 py-2 rounded shadow transition`}
        >
          {editIndex !== null ? "✅ Update Row" : "➕ Add Row"}
        </button>
      </form>

      {previewRows.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            🧾 Preview Inventory Entries
          </h3>
          <div className="max-h-64 overflow-y-auto border rounded">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-2 border">Rice Type</th>
                  <th className="p-2 border">Quantity</th>
                  <th className="p-2 border">Batch No.</th>
                  <th className="p-2 border">Warehouse</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border">{row.riceType}</td>
                    <td className="p-2 border">{row.quantity}</td>
                    <td className="p-2 border">{row.batchNo}</td>
                    <td className="p-2 border">{row.warehouse}</td>
                    <td className="p-2 border">{row.dateReceived}</td>
                    <td className="p-2 border text-center space-x-2">
                      <button
                        onClick={() => handleEditRow(i)}
                        className="text-blue-600 hover:underline"
                      >
                        🖊 Edit
                      </button>
                      <button
                        onClick={() => handleRemoveRow(i)}
                        className="text-red-600 hover:underline"
                      >
                        🗑 Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleFinalSubmit}
            disabled={loading}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "⏳ Submitting..." : "🚀 Add to Inventory"}
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryEntryForm;
