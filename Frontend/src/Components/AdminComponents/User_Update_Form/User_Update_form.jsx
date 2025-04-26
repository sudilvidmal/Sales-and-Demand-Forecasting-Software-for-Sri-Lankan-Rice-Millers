import { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const User_Update_form = ({ user, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({ ...user });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic") {
      setFormData({ ...formData, profilePic: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("❌ Passwords do not match.");
      return;
    }

    const form = new FormData();
    form.append("id", formData.id);
    form.append("fullName", formData.fullName || "");
    form.append("email", formData.email || "");
    form.append("username", formData.username || "");
    form.append("password", formData.password || "");
    form.append("confirmPassword", formData.confirmPassword || "");
    form.append("role", formData.role || "");
    form.append("phone", formData.phone || "");
    form.append("bio", formData.bio || "");

    if (formData.profilePic && typeof formData.profilePic === "object") {
      form.append("profilePic", formData.profilePic);
    }

    await onUpdate(form);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-opacity-10 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Update User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            name="profilePic"
            accept="image/*"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />

          <input
            name="fullName"
            placeholder="Full name"
            value={formData.fullName || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            name="username"
            placeholder="Username"
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
            <option value="">Select Role</option>
            <option value="Staff">Staff</option>
            <option value="Intern">Intern</option>
          </select>

          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
          <textarea
            name="bio"
            placeholder="Bio"
            value={formData.bio || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded resize-none"
            rows={4}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

User_Update_form.propTypes = {
  user: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default User_Update_form;
