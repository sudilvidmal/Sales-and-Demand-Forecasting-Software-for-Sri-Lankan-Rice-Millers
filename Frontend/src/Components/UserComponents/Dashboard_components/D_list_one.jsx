import { FaBox } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";

const D_list_one = () => {
  const [stockLevels, setStockLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch current stock levels with JWT
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const token = localStorage.getItem("user_token");
        if (!token) throw new Error("No user token found");

        const res = await axios.get(
          "http://localhost:8000/user/dashboard/current-stock-levels",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStockLevels(res.data.stock_levels || []);
      } catch (err) {
        console.error("❌ Failed to fetch stock levels:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-96">
      <h3 className="text-gray-700 font-semibold mb-4">Current Stock Levels</h3>
      {loading ? (
        <p className="text-sm text-gray-500">⏳ Loading stock data...</p>
      ) : (
        <ul className="overflow-y-auto h-[calc(100%-2rem)] pr-2">
          {stockLevels.map((item, index) => {
            const percentage = Math.round((item.current / item.capacity) * 100);
            return (
              <li
                key={index}
                className="flex items-center justify-between border-b py-3"
              >
                <div className="flex items-center">
                  <FaBox className="text-green-600 mr-3" />
                  <div>
                    <p className="font-semibold text-sm">{item.type}</p>
                    <p className="text-sm text-gray-500">
                      {item.current} kg of {item.capacity} kg
                    </p>
                  </div>
                </div>
                <div className="ml-4 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor:
                        percentage >= 75
                          ? "green"
                          : percentage >= 40
                          ? "orange"
                          : "red",
                    }}
                  ></div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default D_list_one;
