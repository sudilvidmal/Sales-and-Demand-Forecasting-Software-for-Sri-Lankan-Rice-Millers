import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InventoryRecordsTable = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [riceTypeFilter, setRiceTypeFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [uniqueWarehouses, setUniqueWarehouses] = useState([]);
  const [uniqueRiceTypes, setUniqueRiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const token = localStorage.getItem("admin_token");

  const fetchInventory = async () => {
    try {
      const res = await axios.get("http://localhost:8000/admin/inventory/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = res.data.data || [];
      setInventoryData(data);
      setFilteredData(data);
      setUniqueWarehouses([...new Set(data.map((item) => item.warehouse))]);
      setUniqueRiceTypes([...new Set(data.map((item) => item.riceType))]);
    } catch (err) {
      console.error("❌ Failed to fetch inventory data", err);
      setError("Failed to load inventory records.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:8000/admin/inventory/update/${editingItem.id}`,
        editingItem,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("✅ Inventory updated successfully!");
      setEditingItem(null);
      fetchInventory();
    } catch (err) {
      console.error("❌ Failed to update record", err);
      toast.error("❌ Update failed. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inventory item?"))
      return;
    try {
      await axios.delete(`http://localhost:8000/admin/inventory/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("🗑️ Inventory record deleted!");
      fetchInventory();
    } catch (err) {
      console.error("❌ Failed to delete record", err);
      toast.error("❌ Delete failed. Please try again.");
    }
  };

  const handleSearchAndFilter = useCallback(() => {
    let filtered = inventoryData.filter(
      (item) =>
        item.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (warehouseFilter === "" || item.warehouse === warehouseFilter) &&
        (riceTypeFilter === "" || item.riceType === riceTypeFilter)
    );

    if (sortOrder === "asc") {
      filtered.sort((a, b) => a.quantity - b.quantity);
    } else {
      filtered.sort((a, b) => b.quantity - a.quantity);
    }

    setFilteredData(filtered);
  }, [inventoryData, searchTerm, warehouseFilter, riceTypeFilter, sortOrder]);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    handleSearchAndFilter();
  }, [handleSearchAndFilter]);

  return (
    <div className="bg-white shadow-md rounded-lg">
      <div className="flex flex-wrap justify-between items-center gap-2 p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          📋 Inventory Records
        </h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="🔍 Search batch..."
            className="border p-2 rounded text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border p-2 rounded text-sm"
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
          >
            <option value="">All Warehouses</option>
            {uniqueWarehouses.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <select
            className="border p-2 rounded text-sm"
            value={riceTypeFilter}
            onChange={(e) => setRiceTypeFilter(e.target.value)}
          >
            <option value="">All Rice Types</option>
            {uniqueRiceTypes.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            className="border p-2 rounded text-sm"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Sort Qty ↑</option>
            <option value="desc">Sort Qty ↓</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 p-4">⏳ Loading inventory records...</div>
      ) : error ? (
        <div className="text-red-600 p-4">{error}</div>
      ) : filteredData.length === 0 ? (
        <div className="text-gray-500 p-4">📭 No inventory records found.</div>
      ) : (
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left">Rice Type</th>
                <th className="p-3 text-left">Quantity</th>
                <th className="p-3 text-left">Warehouse</th>
                <th className="p-3 text-left">Batch No</th>
                <th className="p-3 text-left">Date Received</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, i) => (
                <tr
                  key={item.id || i}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-3">{item.riceType}</td>
                  <td className="p-3">{item.quantity} KG</td>
                  <td className="p-3">{item.warehouse}</td>
                  <td className="p-3">{item.batchNo}</td>
                  <td className="p-3">{item.dateReceived}</td>
                  <td className="p-3 flex space-x-2">
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => setEditingItem({ ...item })}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔧 Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Edit Inventory Record
            </h3>

            <input
              className="w-full border p-2 rounded"
              value={editingItem.riceType}
              onChange={(e) =>
                setEditingItem({ ...editingItem, riceType: e.target.value })
              }
              placeholder="Rice Type"
            />
            <input
              className="w-full border p-2 rounded"
              value={editingItem.quantity}
              type="number"
              onChange={(e) =>
                setEditingItem({ ...editingItem, quantity: +e.target.value })
              }
              placeholder="Quantity"
            />
            <input
              className="w-full border p-2 rounded"
              value={editingItem.warehouse}
              onChange={(e) =>
                setEditingItem({ ...editingItem, warehouse: e.target.value })
              }
              placeholder="Warehouse"
            />
            <input
              className="w-full border p-2 rounded"
              value={editingItem.batchNo}
              onChange={(e) =>
                setEditingItem({ ...editingItem, batchNo: e.target.value })
              }
              placeholder="Batch No"
            />
            <input
              className="w-full border p-2 rounded"
              value={editingItem.dateReceived}
              type="date"
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  dateReceived: e.target.value,
                })
              }
              placeholder="Date Received"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-300 text-sm px-4 py-1 rounded"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white text-sm px-4 py-1 rounded"
                onClick={handleEditSubmit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryRecordsTable;
