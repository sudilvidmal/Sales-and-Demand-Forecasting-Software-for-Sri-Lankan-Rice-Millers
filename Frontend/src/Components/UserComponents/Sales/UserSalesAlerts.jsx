import { useState, useEffect } from "react";
import axios from "axios";

const UserSalesAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      const token = localStorage.getItem("user_token");

      try {
        const res = await axios.get("http://localhost:8000/user/sales/alerts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAlerts(res.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const displayedAlerts = showAll ? alerts : alerts.slice(0, 5);

  return (
    <div className="mt-6 bg-white p-4 rounded shadow-md border border-yellow-200">
      <h2 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
        ⚠️ Sales Alerts
      </h2>

      {loading ? (
        <div className="text-sm text-gray-500 italic">⏳ Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-sm text-gray-500 italic">
          ✅ No unusual activity detected in sales.
        </div>
      ) : (
        <>
          <div className="max-h-64 overflow-y-auto pr-2">
            <ul className="space-y-3 text-sm">
              {displayedAlerts.map((alert, i) => (
                <li
                  key={i}
                  className="p-3 bg-yellow-50 rounded-md border-l-4 border-yellow-500 shadow-sm"
                >
                  <div className="font-medium text-yellow-900 mb-0.5">
                    📅 {alert.date} — 🧺 {alert.riceType}
                  </div>
                  <p className="text-gray-700">{alert.message}</p>
                </li>
              ))}
            </ul>
          </div>

          {alerts.length > 5 && (
            <div className="mt-3 text-right">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-yellow-700 text-sm hover:underline"
              >
                {showAll ? "Show Less" : `View All (${alerts.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserSalesAlerts;
