import { useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

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

const ManualEntryForm = () => {
  const [form, setForm] = useState({
    date: "",
    riceType: "",
    quantity: "",
    amount: "",
    closed: false,
  });
  const [rows, setRows] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { date, riceType, quantity, amount, closed } = form;

    if (!date) {
      toast.error("Date is required.");
      return;
    }

    const token = localStorage.getItem("user_token");

    if (closed) {
      try {
        const res = await fetch("http://localhost:8000/shop-closed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ date }),
        });

        const result = await res.json();
        if (res.ok) {
          toast.success(result.msg || "✅ Shop closed records submitted.");
          setForm({
            date: "",
            riceType: "",
            quantity: "",
            amount: "",
            closed: false,
          });
        } else {
          toast.error(result.detail || "❌ Failed to submit shop closed data.");
        }
      } catch (err) {
        toast.error("❌ Server error while submitting shop closed data.");
        console.error(err);
      }

      return;
    }

    if (!riceType || !quantity || !amount) {
      toast.error("Please fill in all fields.");
      return;
    }

    const newRow = {
      Date: date,
      "Rice Type": riceType,
      "Quantity (KG)": quantity,
      "Amount per 1KG (Rs)": amount,
      Closed: closed,
    };

    if (editingIndex !== null) {
      const updatedRows = [...rows];
      updatedRows[editingIndex] = newRow;
      setRows(updatedRows);
      setEditingIndex(null);
      toast.success("✏️ Record updated successfully!");
    } else {
      setRows((prev) => [...prev, newRow]);
      toast.success("✅ Data added manually!");
    }

    setForm({
      date: "",
      riceType: "",
      quantity: "",
      amount: "",
      closed: false,
    });
  };

  const handleEdit = (index) => {
    const row = rows[index];
    setForm({
      date: row["Date"],
      riceType: row["Rice Type"],
      quantity: row["Quantity (KG)"],
      amount: row["Amount per 1KG (Rs)"],
      closed: row["Closed"] || false,
    });
    setEditingIndex(index);
  };

  const handleRemove = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
    toast.info("🗑️ Record removed.");
  };

  const handleFinalSubmit = async () => {
    if (!rows.length) {
      toast.error("🚫 No records to submit.");
      return;
    }

    const token = localStorage.getItem("user_token");

    try {
      const payload = rows.map((r) => ({
        date: r["Date"],
        rice_type: r["Rice Type"],
        quantity_kg: parseFloat(r["Quantity (KG)"]) || 0,
        price_per_kg: parseFloat(r["Amount per 1KG (Rs)"]) || 0,
        closed: r["Closed"] || false,
      }));

      const res = await fetch("http://localhost:8000/manual-entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.msg || "✅ Manual records uploaded.");
        setRows([]);
      } else {
        toast.error(result.detail || "❌ Upload failed.");
      }
    } catch (err) {
      toast.error("❌ Server error while uploading manual records.");
      console.error(err);
    }
  };

  return (
    <div className="w-full">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          {!form.closed && (
            <>
              <div>
                <label className="text-sm text-gray-700">Rice Type</label>
                <select
                  value={form.riceType}
                  onChange={(e) =>
                    setForm({ ...form, riceType: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md"
                >
                  <option value="">-- Select --</option>
                  {riceTypes.map((type, idx) => (
                    <option key={idx} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700">Quantity (KG)</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Amount per 1KG</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md"
                />
              </div>
            </>
          )}

          <div className="col-span-2 flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={form.closed}
              onChange={(e) => setForm({ ...form, closed: e.target.checked })}
            />
            <label className="text-sm text-gray-700">Shop Closed?</label>
          </div>
        </div>

        <button
          type="submit"
          className={`mt-4 px-4 py-2 rounded-md text-white ${
            form.closed
              ? "bg-purple-600 hover:bg-purple-700"
              : editingIndex !== null
              ? "bg-yellow-500"
              : "bg-blue-500"
          }`}
        >
          {form.closed
            ? "➕ Submit Shop Closed Record"
            : editingIndex !== null
            ? "✏️ Update Record"
            : "➕ Add Record"}
        </button>
      </form>

      {/* Preview Table */}
      {rows.length > 0 && (
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
                  <th className="p-2 border">Closed</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2 border">{row["Date"]}</td>
                    <td className="p-2 border">{row["Rice Type"]}</td>
                    <td className="p-2 border">{row["Quantity (KG)"]}</td>
                    <td className="p-2 border">{row["Amount per 1KG (Rs)"]}</td>
                    <td className="p-2 border">
                      {row["Closed"] ? "✅" : "❌"}
                    </td>
                    <td className="p-2 border space-x-2">
                      <button
                        onClick={() => handleEdit(idx)}
                        className="text-yellow-600 hover:underline text-xs"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleRemove(idx)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        🗑️ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleFinalSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow transition"
            >
              ✅ Submit Data to Backend
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ManualEntryForm.propTypes = {
  onAdd: PropTypes.func,
};

export default ManualEntryForm;
