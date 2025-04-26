import { useState, useEffect } from "react";
import Layout from "../Components/Layout";
import ReportSection from "../Components/UserComponents/ReportSection/ReportSection";
import PageLoader from "../Components/Common/PageLoader"; // ✅ Import

const Report = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
      setTimeout(() => setFadeIn(true), 100);
    }, 1000); // ⏳ Loading duration (adjust if needed)

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      {pageLoading ? (
        <PageLoader pageType="report" /> 
      ) : (
        <div
          className={`min-h-screen flex bg-gray-100 relative transition-all duration-700 ${
            fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          {/* 📄 Main Content */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-auto space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">📄 Reports</h2>
            <ReportSection />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Report;

