import { useState, useEffect } from "react";
import Admin_Sidebar from "../Components/AdminComponents/Admin_Sidebar/Admin_sidebar";
import Admin_Navbar from "../Components/AdminComponents/Admin_Navbar/Admin_Navbar";
import SalesKPISection from "../Components/AdminComponents/Admin_Sales_components/SalesKPISection";
import SalesDataTable from "../Components/AdminComponents/Admin_Sales_components/SalesDataTable";
import PageLoader from "../Components/Common/PageLoader"; // ✅ Import PageLoader

const Admin_Sales_Management = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ loading state
  const [fadeIn, setFadeIn] = useState(false); // ✅ fade-in

  const handleToggleSidebar = () => setShowSidebar(!showSidebar);
  const handleCloseSidebar = () => setShowSidebar(false);

  useEffect(() => {
    const simulateFetch = async () => {
      try {
        // Simulate API call or heavy loading
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } finally {
        setLoading(false);
        setTimeout(() => setFadeIn(true), 100); // ✅ Smooth fade-in after loading
      }
    };
    simulateFetch();
  }, []);

  return (
    <div className="relative min-h-screen flex bg-gray-100 overflow-hidden">
      {/* 🔒 Mobile Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-20 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* 📚 Sidebar */}
      <Admin_Sidebar
        showSidebar={showSidebar}
        onCloseSidebar={handleCloseSidebar}
      />

      {/* 🧭 Navbar */}
      <Admin_Navbar onToggleSidebar={handleToggleSidebar} />

      {/* 📊 Main Content */}
      {loading ? (
        <div className="flex-1 flex flex-col md:ml-64 mt-[64px] p-4 sm:p-6 overflow-auto">
          <PageLoader pageType="sales" />
        </div>
      ) : (
        <div
          className={`flex-1 flex flex-col md:ml-64 z-10 p-4 sm:p-6 mt-[64px] space-y-6 overflow-auto transition-all duration-700 ${
            fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          {/* 📊 KPI Cards Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              📈 Sales Performance Summary
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              A high-level view of today’s performance, including total sales,
              revenue, and top-performing rice types.
            </p>
            <SalesKPISection />
          </section>

          {/* 📋 Sales Table Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              📋 Sales Records
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              Review detailed sales records by rice type, price, date, and
              status.
            </p>
            <SalesDataTable />
          </section>

          {/* ⚠️ Future Alerts Support (Optional) */}
          {/* 
          <section>
            <SalesAlerts />
          </section> 
          */}
        </div>
      )}
    </div>
  );
};

export default Admin_Sales_Management;
