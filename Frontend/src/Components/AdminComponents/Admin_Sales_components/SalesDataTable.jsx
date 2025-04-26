import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";

const SalesDataTable = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editIndex, setEditIndex] = useState(null);
  const [editForm, setEditForm] = useState({
    quantity_kg: "",
    gross_amount: "",
    price_per_kg: "",
  });

  const [riceType, setRiceType] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [price, setPrice] = useState("");
  const [closed, setClosed] = useState("All");

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const res = await axios.get("http://localhost:8000/admin/sales/table", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          rice_type: riceType !== "All" ? riceType : undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
          price: price || undefined,
          closed: closed !== "All" ? closed : undefined,
        },
      });

      setSalesData(res.data.data);
    } catch (err) {
      console.error("❌ Failed to fetch sales table data:", err);
      setError("Failed to load sales data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [riceType, fromDate, toDate, price, closed]);

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditForm({
      _id: salesData[index]._id,
      quantity_kg: salesData[index].quantity_kg || "",
      gross_amount: salesData[index].gross_amount || "",
      price_per_kg: salesData[index].price_per_kg || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      await axios.put(
        `http://localhost:8000/admin/sales/update/${editForm._id}`,
        {
          quantity_kg: Number(editForm.quantity_kg),
          gross_amount: Number(editForm.gross_amount),
          price_per_kg: Number(editForm.price_per_kg),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("✅ Record updated successfully.");
      setEditIndex(null);
      fetchSalesData();
    } catch (error) {
      console.error("❌ Failed to update:", error);
      alert("Failed to update the record.");
    }
  };

  const handleEditCancel = () => {
    setEditIndex(null);
    setEditForm({
      _id: "",
      quantity_kg: "",
      gross_amount: "",
      price_per_kg: "",
    });
  };

  const riceTypeOptions = [
    "All",
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

  return (
    <div className="mt-6 bg-white shadow rounded p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        📋 Detailed Sales Table
      </h2>

      {/* 🔍 Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4 text-sm">
        <div>
          <label className="block text-gray-600 mb-1">
            Filter by Rice Type
          </label>
          <select
            value={riceType}
            onChange={(e) => setRiceType(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          >
            {riceTypeOptions.map((type, i) => (
              <option key={i} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-600 mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">
            Search Price Per KG
          </label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 150"
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Filter by Closed</label>
          <select
            value={closed}
            onChange={(e) => setClosed(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="All">All</option>
            <option value="Closed">Closed ✅</option>
            <option value="Open">Open ❌</option>
          </select>
        </div>
      </div>

      {/* 🔢 Record Count */}
      {!loading && !error && (
        <div className="text-sm text-gray-600 mb-2">
          Showing <strong>{salesData.length}</strong>{" "}
          {salesData.length === 1 ? "record" : "records"}
        </div>
      )}

      {/* 📊 Table */}
      {loading ? (
        <p className="text-sm text-gray-500">⏳ Loading sales records...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto border rounded">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-blue-100 sticky top-0 z-10">
              <tr>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Rice Type</th>
                <th className="p-3 border">Qty (KG)</th>
                <th className="p-3 border">Gross Amount</th>
                <th className="p-3 border">Price/KG</th>
                <th className="p-3 border">Closed</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {salesData.length > 0 ? (
                salesData.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3 border">{item.date}</td>
                    <td className="p-3 border">{item.rice_type}</td>
                    <td className="p-3 border">{item.quantity_kg}</td>
                    <td className="p-3 border">Rs. {item.gross_amount}</td>
                    <td className="p-3 border">Rs. {item.price_per_kg}</td>
                    <td className="p-3 border">{item.closed ? "✅" : "❌"}</td>
                    <td className="p-3 border space-x-3">
                      <button
                        onClick={() => handleEdit(i)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center p-4 text-gray-500 italic"
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ✏️ Edit Modal */}
      {editIndex !== null && (
        <div className="fixed inset-0 bg-opacity-40 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              ✏️ Edit Sales Record
            </h3>
            <input
              type="number"
              name="quantity_kg"
              placeholder="Quantity (KG)"
              value={editForm.quantity_kg || ""}
              onChange={handleEditChange}
              className="w-full border px-2 py-1 rounded"
            />
            <input
              type="number"
              name="gross_amount"
              placeholder="Gross Amount"
              value={editForm.gross_amount || ""}
              onChange={handleEditChange}
              className="w-full border px-2 py-1 rounded"
            />
            <input
              type="number"
              name="price_per_kg"
              placeholder="Price Per KG"
              value={editForm.price_per_kg || ""}
              onChange={handleEditChange}
              className="w-full border px-2 py-1 rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleEditCancel}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDataTable;
