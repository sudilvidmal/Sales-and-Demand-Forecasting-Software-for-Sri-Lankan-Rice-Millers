import PropTypes from "prop-types";
import { useState } from "react";
import { toast } from "react-toastify";

const Admin_Account = ({ admin, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedAdmin, setUpdatedAdmin] = useState(admin ? { ...admin } : {});
  const [profilePicFile, setProfilePicFile] = useState(null);

  if (!admin) return null;

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic") {
      setProfilePicFile(files[0]);
    } else {
      setUpdatedAdmin({ ...updatedAdmin, [name]: value });
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("fullName", updatedAdmin.fullName);
    formData.append("email", updatedAdmin.email);
    formData.append("username", updatedAdmin.username);
    formData.append("role", updatedAdmin.role);
    formData.append("phone", updatedAdmin.phone || "");
    formData.append("bio", updatedAdmin.bio || "");
    formData.append("password", "");
    formData.append("confirmPassword", "");

    if (profilePicFile) {
      formData.append("profilePic", profilePicFile);
    }

    const token = localStorage.getItem("admin_token");

    try {
      const response = await fetch(
        `http://localhost:8000/update-admin/${updatedAdmin.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("✅ Profile updated successfully!");
        setIsEditing(false);
        setProfilePicFile(null);
      } else {
        toast.error(`❌ Update failed: ${result.detail}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Server error. Please try again later.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/admin-login";
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative border">
        {/* ❌ Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
        >
          ✕
        </button>

        {/* 👤 Avatar & Name */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 shadow">
            <img
              src={
                profilePicFile
                  ? URL.createObjectURL(profilePicFile)
                  : updatedAdmin.profilePic?.startsWith("http")
                  ? updatedAdmin.profilePic
                  : `http://localhost:8000${updatedAdmin.profilePic}`
              }
              alt="Admin"
              className="object-cover w-full h-full"
            />
          </div>

          {isEditing && (
            <label className="mt-2 text-xs text-blue-600 cursor-pointer hover:underline">
              Change Picture
              <input
                type="file"
                name="profilePic"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          )}

          <h2 className="mt-4 text-xl font-semibold text-gray-800">
            {updatedAdmin.fullName}
          </h2>
          <p className="text-sm text-gray-500">@{updatedAdmin.username}</p>
          <span className="text-xs mt-2 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            {updatedAdmin.role}
          </span>
        </div>

        {/* 📝 Bio Section */}
        <div className="bg-gray-100 p-3 rounded-lg mb-6 text-center">
          {isEditing ? (
            <textarea
              name="bio"
              value={updatedAdmin.bio}
              onChange={handleInputChange}
              rows={3}
              placeholder="Write something about yourself..."
              className="w-full text-sm px-3 py-2 rounded-md border focus:ring focus:ring-blue-300 resize-none"
            />
          ) : (
            <p className="text-sm text-gray-600">
              {updatedAdmin.bio || "No bio provided."}
            </p>
          )}
        </div>

        {/* 📇 Contact Info */}
        <div className="text-left space-y-4 mb-6">
          <div>
            <p className="text-xs text-gray-500">Email</p>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={updatedAdmin.email}
                onChange={handleInputChange}
                className="w-full border px-2 py-1 rounded text-sm mt-1"
              />
            ) : (
              <p className="text-sm text-gray-700">{updatedAdmin.email}</p>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-500">Phone</p>
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={updatedAdmin.phone}
                onChange={handleInputChange}
                className="w-full border px-2 py-1 rounded text-sm mt-1"
              />
            ) : (
              <p className="text-sm text-gray-700">{updatedAdmin.phone}</p>
            )}
          </div>
        </div>

        {/* 🔘 Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleLogout}
            className="text-red-500 text-sm hover:underline"
          >
            Logout
          </button>

          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-sm px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-sm px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Admin_Account.propTypes = {
  admin: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Admin_Account;
