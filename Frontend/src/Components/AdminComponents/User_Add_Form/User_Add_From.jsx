import { useState } from "react";
import PropTypes from "prop-types";

const User_Add_From = ({ onCancel }) => {
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "Staff",
    phone: "",
    bio: "",
    profilePic: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic") {
      setUserData({ ...userData, profilePic: files[0] });
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (key !== "confirmPassword" && value !== null) {
        formData.append(key, value);
      }
    });

    const token = localStorage.getItem("admin_token");

    try {
      const response = await fetch("http://localhost:8000/add-user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ User added successfully!");
        setUserData({
          fullName: "",
          email: "",
          username: "",
          password: "",
          confirmPassword: "",
          role: "Staff",
          phone: "",
          bio: "",
          profilePic: null,
        });
      } else {
        alert("❌ Error: " + result.detail);
      }
    } catch (error) {
      console.error("❌ Request failed:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-opacity-30 backdrop-blur">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl space-y-4 overflow-y-auto max-h-[95vh]">
        {/* Profile Preview & Upload */}
        <div className="flex items-center gap-4">
          <img
            src={
              userData.profilePic
                ? URL.createObjectURL(userData.profilePic)
                : "https://via.placeholder.com/64"
            }
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <label className="cursor-pointer bg-blue-100 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-200 text-sm font-medium">
              Upload image
              <input
                type="file"
                name="profilePic"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG under 10MB</p>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="fullName"
            placeholder="Full Name"
            value={userData.fullName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-blue-500"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={userData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded"
          />

          <input
            name="username"
            placeholder="Username"
            value={userData.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={userData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={userData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-500"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded"
          >
            <option value="Staff">Staff</option>
            <option value="Intern">Intern</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
          </select>

          <input
            name="phone"
            placeholder="Phone Number"
            value={userData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded"
          />

          <textarea
            name="bio"
            placeholder="Bio (max 100 characters)"
            value={userData.bio}
            onChange={handleChange}
            maxLength={100}
            rows={3}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded resize-none"
          ></textarea>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

User_Add_From.propTypes = {
  onCancel: PropTypes.func.isRequired,
};

export default User_Add_From;
