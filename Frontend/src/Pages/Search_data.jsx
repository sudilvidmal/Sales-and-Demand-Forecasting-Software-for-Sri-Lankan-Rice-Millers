import { useState, useEffect } from "react";
import Layout from "../Components/Layout";
import SearchDataSection from "../Components/UserComponents/SearchDataSection/SearchDataSection";
import PageLoader from "../Components/Common/PageLoader"; // 🔵 Your spinner component

const SearchData = () => {
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // ✅ Stop loading after 800ms
      setTimeout(() => setFadeIn(true), 100); // ✅ Small smooth entry effect
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      {loading ? (
        <PageLoader pageType="search-data" />
      ) : (
        <div
          className={`min-h-screen flex bg-gray-100 relative transition-opacity duration-700 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* 🔍 Main Content */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-auto space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              🔍 Search Data
            </h2>
            <SearchDataSection />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SearchData;
