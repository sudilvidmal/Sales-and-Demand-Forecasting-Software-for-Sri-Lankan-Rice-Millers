import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Pencil, Eye, Trash2 } from "lucide-react";

import User_Add_From from "../User_Add_Form/User_Add_From";
import User_view_Form from "../User_view_Form/User_view_Form.jsx";
import User_Update_form from "../User_Update_Form/User_Update_form.jsx";

const User_table = () => {
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);

  const fetchUsers = async () => {
    const token = localStorage.getItem("admin_token");

    try {
      const res = await fetch("http://localhost:8000/users", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Unauthorized or failed to fetch users");

      const data = await res.json();
      setUserData(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("❌ Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleNext = () => {
    if (currentPage < Math.ceil(userData.length / rowsPerPage))
      setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleAddUser = () => {
    toast.success("✅ User added successfully!");
    setShowAddForm(false);
    fetchUsers();
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const token = localStorage.getItem("admin_token");

    try {
      const response = await fetch(`http://localhost:8000/delete-user/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setUserData((prevData) => prevData.filter((user) => user.id !== id));
        toast.success("✅ User deleted successfully!");
      } else {
        const error = await response.json();
        toast.error(`❌ Failed to delete user: ${error.detail}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("❌ An error occurred while deleting.");
    }
  };

  const handleUpdateUser = async (formData) => {
    const userId = formData.get("id");
    const token = localStorage.getItem("admin_token");

    try {
      const response = await fetch(
        `http://localhost:8000/update-user/${userId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("✅ User updated successfully!");
        fetchUsers();
      } else {
        toast.error("❌ Update failed: " + result.detail);
      }
    } catch (error) {
      toast.error("❌ Update request failed");
      console.error(error);
    }

    setEditUser(null);
  };

  const currentRows = Array.isArray(userData)
    ? userData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : [];

  return (
    <div className="relative p-6 h-full flex flex-col">
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-blue-400">
            👥 User Management
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-400 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow"
          >
            ➕ Add User
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-blue-100 text-blue-800 font-medium">
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentRows.map((user) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-4">{user.id}</td>
                  <td className="py-2 px-4">{user.fullName}</td>
                  <td className="py-2 px-4">{user.role}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditUser(user)}
                        className="p-2 bg-green-100 hover:bg-green-200 rounded"
                        title="Edit"
                      >
                        <Pencil size={16} className="text-green-700" />
                      </button>
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded"
                        title="View"
                      >
                        <Eye size={16} className="text-blue-700" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded"
                        title="Delete"
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

        {/* Mobile View */}
        <div className="sm:hidden space-y-4">
          {currentRows.map((user) => (
            <div
              key={user.id}
              className="bg-white border rounded-lg p-4 shadow"
            >
              <p>
                <strong>ID:</strong> {user.id}
              </p>
              <p>
                <strong>Name:</strong> {user.fullName}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => setEditUser(user)}
                  className="p-2 bg-green-100 hover:bg-green-200 rounded"
                  title="Edit"
                >
                  <Pencil size={16} className="text-green-700" />
                </button>
                <button
                  onClick={() => setSelectedUser(user)}
                  className="p-2 bg-blue-100 hover:bg-blue-200 rounded"
                  title="View"
                >
                  <Eye size={16} className="text-blue-700" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="p-2 bg-red-100 hover:bg-red-200 rounded"
                  title="Delete"
                >
                  <Trash2 size={16} className="text-red-700" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            ⬅️ Previous
          </button>
          <span>
            Page {currentPage} of {Math.ceil(userData.length / rowsPerPage)}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === Math.ceil(userData.length / rowsPerPage)}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Next ➡️
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAddForm && (
        <User_Add_From
          onSubmit={handleAddUser}
          onCancel={() => setShowAddForm(false)}
        />
      )}
      {selectedUser && (
        <User_view_Form
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
      {editUser && (
        <User_Update_form
          user={editUser}
          onUpdate={handleUpdateUser}
          onClose={() => setEditUser(null)}
        />
      )}
    </div>
  );
};

export default User_table;
