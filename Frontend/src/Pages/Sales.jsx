import { useState, useEffect } from "react";
import axios from "axios";
import UserSalesKPI from "../Components/UserComponents/Sales/UserSalesKPISection";
import UserSalesCharts from "../Components/UserComponents/Sales/UserSalesCharts";
import UserSalesTable from "../Components/UserComponents/Sales/UserSalesTable";
import UserSalesAlerts from "../Components/UserComponents/Sales/UserSalesAlerts";
import Layout from "../Components/Layout";
import PageLoader from "../Components/Common/PageLoader"; // ✅ Import

const Sales = () => {
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      const token = localStorage.getItem("user_token");
      try {
        const res = await axios.get("http://localhost:8000/user/sales/alerts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAlerts(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch alerts:", error);
      } finally {
        setLoadingAlerts(false);
      }
    };

    fetchAlerts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
      setTimeout(() => setFadeIn(true), 100);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      {pageLoading ? (
        <PageLoader pageType="sales" />
      ) : (
        <div
          className={`min-h-screen flex bg-gray-100 relative transition-all duration-700 ${
            fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-auto space-y-6">
            {/* 📊 Sales KPI Cards */}
            <section>
              <UserSalesKPI />
            </section>

            {/* 📈 Sales Chart Section */}
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                📈 Sales Trends & Distribution
              </h2>
              <p className="text-sm text-gray-500 mb-3">
                Visualize trends across dates and rice types. Understand sales
                spikes and demand distribution using interactive charts.
              </p>
              <UserSalesCharts />
            </section>

            {/* 📋 Sales Table */}
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                📋 Sales Data Table
              </h2>
              <p className="text-sm text-gray-500 mb-3">
                View all individual sales records with sorting and filtering
                options like date, rice type, price, and closed status.
              </p>
              <UserSalesTable />
            </section>

            {/* ⚠️ Sales Alerts */}
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                ⚠️ Sales Alerts
              </h2>
              <p className="text-sm text-gray-500 mb-3">
                Highlights unusual sales activity like sudden drops or spikes in
                specific rice types.
              </p>
              {loadingAlerts ? (
                <p className="text-sm text-gray-500">Loading alerts...</p>
              ) : (
                <UserSalesAlerts alerts={alerts} />
              )}
            </section>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Sales;
