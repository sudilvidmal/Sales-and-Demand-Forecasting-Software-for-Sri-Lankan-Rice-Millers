import PropTypes from "prop-types";

const Admin_view_Form = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-6">
        {/* 🔝 Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-2xl font-semibold text-gray-800">
            👤 Admin Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* 🖼️ Profile Picture */}
        <div className="flex justify-center">
          <img
            src={
              user.profilePic
                ? `http://localhost:8000${user.profilePic}`
                : "https://via.placeholder.com/100"
            }
            alt="Admin Profile"
            className="w-28 h-28 rounded-full object-cover border"
          />
        </div>

        {/* 📋 Admin Info */}
        <div className="space-y-3 text-gray-700 text-sm sm:text-base">
          <div>
            <span className="font-semibold">🆔 ID:</span> {user.id}
          </div>
          <div>
            <span className="font-semibold">👨‍💼 Full Name:</span> {user.fullName}
          </div>
          <div>
            <span className="font-semibold">🧑 Username:</span> {user.username}
          </div>
          <div>
            <span className="font-semibold">📧 Email:</span> {user.email}
          </div>
          <div>
            <span className="font-semibold">🔐 Role:</span> {user.role}
          </div>
          <div>
            <span className="font-semibold">📞 Phone:</span>{" "}
            {user.phone || "N/A"}
          </div>
          <div>
            <span className="font-semibold">📝 Bio:</span> {user.bio || "N/A"}
          </div>
        </div>

        {/* 🔘 Footer */}
        <div className="pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

Admin_view_Form.propTypes = {
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default Admin_view_Form;
