import { useEffect, useState } from "react";
import { Pencil, Eye, Trash2 } from "lucide-react";
import Admin_Add_Form from "../Admin_Add_Form/Admin_Add_Form";
import Admin_view_Form from "../Admin_View_Form/Admin_View_Form.jsx";
import Admin_Update_form from "../Admin_Update_Form/Admin_Update_Form.jsx";

const Admin_table = () => {
  const [adminData, setAdminData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const rowsPerPage = 5;

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const token = localStorage.getItem("admin_token");

    try {
      const res = await fetch("http://localhost:8000/admins", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setAdminData(data);
      } else {
        console.error("❌ Failed to fetch admins:", data.detail);
      }
    } catch (err) {
      console.error("❌ Error fetching admins:", err);
    }
  };

  const handleNext = () => {
    if (currentPage < Math.ceil(adminData.length / rowsPerPage)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleAddUser = (newUser) => {
    setAdminData((prevData) => [newUser, ...prevData]);
    setShowAddForm(false);
  };

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this admin?"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("admin_token");

    try {
      const response = await fetch(`http://localhost:8000/delete-admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Admin deleted successfully");
        setAdminData((prevData) => prevData.filter((admin) => admin.id !== id));
      } else {
        alert("❌ Delete failed: " + result.detail);
      }
    } catch (err) {
      console.error("❌ Delete request failed", err);
      alert("❌ Failed to delete admin");
    }
  };

  const handleUpdateUser = async (updatedAdmin) => {
    const adminId = updatedAdmin.id;
    const token = localStorage.getItem("admin_token");

    try {
      const response = await fetch(
        `http://localhost:8000/update-admin/${adminId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedAdmin),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("✅ Admin updated successfully");
        fetchAdmins();
      } else {
        alert("❌ Update failed: " + result.detail);
      }
    } catch (err) {
      console.error("❌ Update request failed", err);
      alert("❌ Failed to send update request");
    }

    setEditUser(null);
  };

  const currentRows = adminData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="relative p-6 h-full flex flex-col">
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-blue-400 flex items-center gap-2">
            👥 Admin Management
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-400 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            + Add Admin
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto border rounded-md">
          <table className="min-w-full bg-white border border-gray-100 rounded-md text-sm">
            <thead className="bg-blue-100 text-blue-700 font-medium">
              <tr>
                <th className="py-3 px-4 text-left">Admin ID</th>
                <th className="py-3 px-4 text-left">Full Name</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((admin) => (
                <tr
                  key={admin.id}
                  className="border-t hover:bg-gray-50 transition duration-200"
                >
                  <td className="py-2 px-4">{admin.id}</td>
                  <td className="py-2 px-4">{admin.fullName}</td>
                  <td className="py-2 px-4">{admin.role}</td>
                  <td className="py-2 px-4">{admin.email}</td>
                  <td className="py-2 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditUser(admin)}
                        className="p-2 bg-green-100 hover:bg-green-200 rounded-md"
                      >
                        <Pencil size={16} className="text-green-700" />
                      </button>
                      <button
                        onClick={() => setSelectedUser(admin)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-md"
                      >
                        <Eye size={16} className="text-blue-700" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(admin.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-md"
                      >
                        <Trash2 size={16} className="text-red-700" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-4">
          {currentRows.map((admin) => (
            <div
              key={admin.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200"
            >
              <p>
                <strong>ID:</strong> {admin.id}
              </p>
              <p>
                <strong>Name:</strong> {admin.fullName}
              </p>
              <p>
                <strong>Role:</strong> {admin.role}
              </p>
              <p>
                <strong>Email:</strong> {admin.email}
              </p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => setEditUser(admin)}
                  className="p-2 bg-green-100 hover:bg-green-200 rounded-md"
                >
                  <Pencil size={16} className="text-green-700" />
                </button>
                <button
                  onClick={() => setSelectedUser(admin)}
                  className="p-2 bg-blue-100 hover:bg-blue-200 rounded-md"
                >
                  <Eye size={16} className="text-blue-700" />
                </button>
                <button
                  onClick={() => handleDeleteUser(admin.id)}
                  className="p-2 bg-red-100 hover:bg-red-200 rounded-md"
                >
                  <Trash2 size={16} className="text-red-700" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 text-sm">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md border ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-blue-50 text-blue-600"
            }`}
          >
            ⬅ Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {Math.ceil(adminData.length / rowsPerPage)}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === Math.ceil(adminData.length / rowsPerPage)}
            className={`px-4 py-2 rounded-md border ${
              currentPage === Math.ceil(adminData.length / rowsPerPage)
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-blue-50 text-blue-600"
            }`}
          >
            Next ➡
          </button>
        </div>
      </div>

      {/* Forms */}
      {showAddForm && (
        <Admin_Add_Form
          onSubmit={handleAddUser}
          onCancel={() => setShowAddForm(false)}
        />
      )}
      {selectedUser && (
        <Admin_view_Form
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
      {editUser && (
        <Admin_Update_form
          user={editUser}
          onUpdate={handleUpdateUser}
          onclose={() => setEditUser(null)}
        />
      )}
    </div>
  );
};

export default Admin_table;
