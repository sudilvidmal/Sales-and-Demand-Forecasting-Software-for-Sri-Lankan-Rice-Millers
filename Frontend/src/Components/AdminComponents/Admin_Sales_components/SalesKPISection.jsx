import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaShoppingCart,
  FaMoneyBillWave,
  FaChartLine,
  FaCrown,
  FaArrowDown,
} from "react-icons/fa";

const SalesKPISection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchKPI = async () => {
      try {
        const token = localStorage.getItem("admin_token");

        const res = await axios.get("http://localhost:8000/admin/sales/kpi", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setData(res.data);
      } catch (err) {
        console.error("Failed to load KPI data:", err);
        setError("❌ Failed to load KPI data.");
      } finally {
        setLoading(false);
      }
    };

    fetchKPI();
  }, []);

  const formatNum = (num) =>
    num?.toLocaleString("en-US", { maximumFractionDigits: 2 }) ?? "-";

  const metrics = data && [
    {
      label: "Total Sales (Today)",
      value: `${formatNum(data.totalSalesToday)} KG`,
      icon: <FaShoppingCart />,
      color: "bg-green-100 text-green-700 border-green-300",
    },
    {
      label: "Total Revenue (LKR)",
      value: `Rs. ${formatNum(data.totalRevenueToday)}`,
      icon: <FaMoneyBillWave />,
      color: "bg-blue-100 text-blue-700 border-blue-300",
    },
    {
      label: "Average Daily Sales",
      value: `${formatNum(data.averageDailySales)} KG`,
      icon: <FaChartLine />,
      color: "bg-purple-100 text-purple-700 border-purple-300",
    },
    {
      label: "Best Selling Rice Type",
      value: data.bestSellingRice,
      icon: <FaCrown />,
      color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    {
      label: "Least Selling Rice Type",
      value: data.leastSellingRice,
      icon: <FaArrowDown />,
      color: "bg-red-100 text-red-700 border-red-300",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="h-[96px] bg-gray-100 rounded-lg animate-pulse shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded">
        {error}
      </p>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {metrics.map((item, index) => (
        <div
          key={index}
          className={`transition-transform shadow-md p-4 hover:scale-[1.02] hover:shadow-md duration-200 flex flex-col justify-center h-[96px] gap-2 rounded-lg p-4 border ${item.color}`}
        >
          <div className="flex items-center gap-2">
            <div className="text-lg">{item.icon}</div>
            <p className="text-sm font-medium text-gray-700">{item.label}</p>
          </div>
          <p className="text-base font-semibold text-gray-800 pl-7">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SalesKPISection;
