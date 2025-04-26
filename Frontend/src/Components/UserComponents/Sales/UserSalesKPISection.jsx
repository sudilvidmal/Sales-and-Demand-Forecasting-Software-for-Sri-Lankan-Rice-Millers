import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarDay,
  FaCalendarAlt,
  FaChartLine,
  FaMoneyBillWave,
  FaBalanceScale,
  FaStar,
  FaThumbsDown,
} from "react-icons/fa";

const UserSalesKPISection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchKPIData = async () => {
    const token = localStorage.getItem("user_token");

    try {
      const res = await axios.get("http://localhost:8000/user/sales/kpi", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch KPI data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIData();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">⏳ Loading sales summary...</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-500">❌ Failed to load KPI data.</p>;
  }

  const {
    totalToday,
    totalMonth,
    totalAll,
    revenue,
    avgDaily,
    bestRice,
    worstRice,
  } = data;

  const cards = [
    {
      label: "Total Sales (Today)",
      value: totalToday,
      icon: <FaCalendarDay className="text-blue-500 text-xl" />,
    },
    {
      label: "Total Sales (This Month)",
      value: totalMonth,
      icon: <FaCalendarAlt className="text-purple-500 text-xl" />,
    },
    {
      label: "Total Sales (All Time)",
      value: totalAll,
      icon: <FaChartLine className="text-green-600 text-xl" />,
    },
    {
      label: "Total Revenue (LKR)",
      value: `Rs. ${revenue}`,
      icon: <FaMoneyBillWave className="text-yellow-500 text-xl" />,
    },
    {
      label: "Average Daily Sales",
      value: `${avgDaily} KG`,
      icon: <FaBalanceScale className="text-indigo-500 text-xl" />,
    },
    {
      label: "Best Selling Rice Type",
      value: bestRice,
      icon: <FaStar className="text-green-500 text-xl" />,
    },
    {
      label: "Least Selling Rice Type",
      value: worstRice,
      icon: <FaThumbsDown className="text-red-500 text-xl" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white shadow-md rounded-lg p-4 flex items-start space-x-4 hover:shadow-lg transition duration-300 ease-in-out"
        >
          <div className="mt-1">{card.icon}</div>
          <div>
            <p className="text-xs text-gray-500">{card.label}</p>
            <h2 className="text-lg font-semibold text-gray-800">
              {card.value}
            </h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserSalesKPISection;
