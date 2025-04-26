import { useState } from "react";
import PropTypes from "prop-types";

const Admin_Update_form = ({ user, onUpdate, onclose }) => {
  const [formData, setFormData] = useState({ ...user });
  const [profilePic, setProfilePic] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic") {
      setProfilePic(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

 const handleSubmit = async (e) => {
   e.preventDefault();

   const data = new FormData();
   data.append("fullName", formData.fullName);
   data.append("email", formData.email);
   data.append("username", formData.username);
   data.append("password", formData.password || "");
   data.append("confirmPassword", formData.confirmPassword || "");
   data.append("role", formData.role);
   data.append("phone", formData.phone || "");
   data.append("bio", formData.bio || "");
   if (profilePic) {
     data.append("profilePic", profilePic);
   }

   const token = localStorage.getItem("admin_token");

   try {
     const response = await fetch(
       `http://localhost:8000/update-admin/${formData.id}`,
       {
         method: "PUT",
         headers: {
           Authorization: `Bearer ${token}`,
         },
         body: data,
       }
     );

     const result = await response.json();
     if (response.ok) {
       alert("✅ Admin updated successfully");
       onUpdate(); // Refresh or close
     } else {
       alert("❌ Update failed: " + result.detail);
     }
   } catch (error) {
     console.error("❌ Error:", error);
     alert("❌ Failed to send update request");
   }
 };


  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold mb-2">Update Admin</h2>

        {/* Profile picture preview */}
        <div className="flex items-center gap-4">
          <img
            src={
              profilePic
                ? URL.createObjectURL(profilePic)
                : formData.profilePic
                ? `http://localhost:8000${formData.profilePic}`
                : "https://via.placeholder.com/64"
            }
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover"
          />
          <label className="cursor-pointer bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300">
            Upload
            <input
              type="file"
              name="profilePic"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="fullName"
            placeholder="Admin full name"
            value={formData.fullName || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            name="email"
            type="email"
            placeholder="Admin email"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            name="username"
            placeholder="Admin username"
            value={formData.username || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
            />
            <span
              className="absolute right-3 top-2 cursor-pointer text-sm text-blue-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
            />
            <span
              className="absolute right-3 top-2 cursor-pointer text-sm text-blue-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </span>
          </div>

          <select
            name="role"
            value={formData.role || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select Admin Role</option>
            <option value="Admin">Admin</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Moderator">Moderator</option>
          </select>

          <input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
          <textarea
            name="bio"
            placeholder="Admin Bio"
            value={formData.bio || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded resize-none"
            rows={4}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onclose}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

Admin_Update_form.propTypes = {
  user: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onclose: PropTypes.func.isRequired,
};

export default Admin_Update_form;
