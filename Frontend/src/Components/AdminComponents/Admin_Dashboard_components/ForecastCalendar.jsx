import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { toast } from "react-toastify";

const ForecastCalendar = () => {
  const [nextUpdate, setNextUpdate] = useState("2025-04-10");
  const [maintenanceStart, setMaintenanceStart] = useState("2025-04-15");
  const [maintenanceEnd, setMaintenanceEnd] = useState("2025-04-16");
  const [maintenanceDuration, setMaintenanceDuration] = useState("24 hours");
  const [maintenanceReason, setMaintenanceReason] = useState("");
  const [reminderDay, setReminderDay] = useState("25");

  const sendNotification = async ({ type, title, message }) => {
    try {
      const token = localStorage.getItem("admin_token");

      const res = await fetch(
        "http://localhost:8000/notifications/send-notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Send JWT
          },
          body: JSON.stringify({
            type,
            title,
            message,
            for_user: "user",
          }),
        }
      );

      if (res.ok) {
        toast.success(`✅ ${title} sent successfully`);
      } else {
        const error = await res.json();
        toast.error(`❌ Failed to send ${title}: ${error.detail}`);
      }
    } catch (err) {
      toast.error(`❌ Error sending ${title}`);
      console.error("❌ Notification error:", err);
    }
  };

  const handleSendNextUpdate = () => {
    const message = `🔮 Forecast is scheduled for ${nextUpdate}`;
    sendNotification({
      type: "forecast",
      title: "🔮 Next Forecast Update",
      message,
    });
  };

  const handleSendMaintenance = () => {
    const message = `🛠️ Maintenance scheduled from ${maintenanceStart} to ${maintenanceEnd} (${maintenanceDuration}). Reason: ${maintenanceReason}`;
    sendNotification({
      type: "maintenance",
      title: "🛠️ Maintenance Window",
      message,
    });
  };

  const handleSendReminder = () => {
    const message = `📄 Monthly PDF report reminder set for day ${reminderDay} of each month.`;
    sendNotification({
      type: "reminder",
      title: "📄 PDF Report Reminder",
      message,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 space-y-8">
      <h2 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
        📅 Forecast Calendar & Reminders
      </h2>

      {/* 🔮 Forecast Update */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-2/3">
            <label className="text-gray-700 font-medium block mb-1">
              🔮 Next Forecast Update
            </label>
            <input
              type="date"
              value={nextUpdate}
              onChange={(e) => setNextUpdate(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
          <button
            onClick={handleSendNextUpdate}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <FiSend /> Send
          </button>
        </div>
      </div>

      {/* 🛠️ Maintenance Window */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-4">
        <label className="text-gray-700 font-medium flex items-center gap-2 text-base">
          🛠️ Maintenance Window
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-gray-600 block mb-1">Start Date</label>
            <input
              type="date"
              value={maintenanceStart}
              onChange={(e) => setMaintenanceStart(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring focus:ring-green-200"
            />
          </div>
          <div>
            <label className="text-gray-600 block mb-1">End Date</label>
            <input
              type="date"
              value={maintenanceEnd}
              onChange={(e) => setMaintenanceEnd(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring focus:ring-green-200"
            />
          </div>
          <div>
            <label className="text-gray-600 block mb-1">Duration</label>
            <input
              type="text"
              value={maintenanceDuration}
              onChange={(e) => setMaintenanceDuration(e.target.value)}
              placeholder="e.g. 6 hours"
              className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring focus:ring-green-200"
            />
          </div>
        </div>

        <div>
          <label className="text-gray-600 block mb-1">Reason</label>
          <textarea
            value={maintenanceReason}
            onChange={(e) => setMaintenanceReason(e.target.value)}
            placeholder="e.g. System upgrade, server patching..."
            rows={3}
            className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm resize-none focus:ring focus:ring-green-200"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSendMaintenance}
            className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <FiSend /> Send
          </button>
        </div>
      </div>

      {/* 📄 Reminder Section */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-2/3">
            <label className="text-gray-700 font-medium block mb-1">
              📄 Reminder (PDF Report)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={reminderDay}
                onChange={(e) => setReminderDay(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-md shadow-sm w-24 focus:outline-none focus:ring focus:ring-yellow-200"
                min="1"
                max="31"
              />
              <span className="text-gray-600">of each month</span>
            </div>
          </div>
          <button
            onClick={handleSendReminder}
            className="bg-yellow-500 text-white px-5 py-2 rounded-md hover:bg-yellow-600 flex items-center gap-2"
          >
            <FiSend /> Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForecastCalendar;
