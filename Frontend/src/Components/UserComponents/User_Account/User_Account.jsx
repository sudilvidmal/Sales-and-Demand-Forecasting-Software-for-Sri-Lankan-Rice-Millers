import PropTypes from "prop-types";
import { useState } from "react";
import { toast } from "react-toastify";

const User_Account = ({ user, onClose, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState(user ? { ...user } : {});
  const [profilePicFile, setProfilePicFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic") {
      setProfilePicFile(files[0]);
    } else {
      setUpdatedUser({ ...updatedUser, [name]: value });
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("fullName", updatedUser.fullName);
    formData.append("email", updatedUser.email);
    formData.append("username", updatedUser.username);
    formData.append("role", updatedUser.role);
    formData.append("phone", updatedUser.phone || "");
    formData.append("bio", updatedUser.bio || "");
    formData.append("password", "");

    if (profilePicFile) {
      formData.append("profilePic", profilePicFile);
    }

    const token = localStorage.getItem("user_token");

    try {
      const res = await fetch(
        `http://localhost:8000/update-user/${updatedUser.id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const result = await res.json();

      if (res.ok) {
        toast.success("✅ Profile updated!");
        setIsEditing(false);
        setProfilePicFile(null);
        onProfileUpdate?.();
      } else {
        toast.error(`❌ ${result.detail}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Error updating user");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/LoginPage";
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
                  : updatedUser.profilePic?.startsWith("http")
                  ? updatedUser.profilePic
                  : `http://localhost:8000${updatedUser.profilePic}`
              }
              alt="User"
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
            {updatedUser.fullName}
          </h2>
          <p className="text-sm text-gray-500">{updatedUser.role}</p>
        </div>

        {/* 📝 Bio Section */}
        <div className="bg-gray-100 p-3 rounded-lg mb-6 text-center">
          {isEditing ? (
            <textarea
              name="bio"
              value={updatedUser.bio}
              onChange={handleInputChange}
              rows={3}
              placeholder="Write something about yourself..."
              className="w-full text-sm px-3 py-2 rounded-md border focus:ring focus:ring-blue-300 resize-none"
            />
          ) : (
            <p className="text-sm text-gray-600">
              {updatedUser.bio || "No bio provided."}
            </p>
          )}
        </div>

        {/* 📇 Personal Info */}
        <div className="text-left space-y-4 mb-6">
          <div>
            <p className="text-xs text-gray-500">Email</p>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={updatedUser.email}
                onChange={handleInputChange}
                className="w-full border px-2 py-1 rounded text-sm mt-1"
              />
            ) : (
              <p className="text-sm text-gray-700">{updatedUser.email}</p>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-500">Phone</p>
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={updatedUser.phone}
                onChange={handleInputChange}
                className="w-full border px-2 py-1 rounded text-sm mt-1"
              />
            ) : (
              <p className="text-sm text-gray-700">{updatedUser.phone}</p>
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

User_Account.propTypes = {
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onProfileUpdate: PropTypes.func,
};

export default User_Account;
