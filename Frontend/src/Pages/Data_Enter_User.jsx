import { useState, useEffect } from "react";
import Upload_data from "../Components/UserComponents/Upload_Data/Upload_data";
import InventoryEntryForm from "../Components/UserComponents/Inventory/InventoryEntryForm";
import Layout from "../Components/Layout";
import PageLoader from "../Components/Common/PageLoader"; // ✅

const Data_Enter_User = () => {
  const [activeTab, setActiveTab] = useState("sales"); // "sales" | "inventory"
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setFadeIn(true), 100);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      {loading ? (
        <PageLoader pageType="data-entry" />
      ) : (
        <div
          className={`min-h-screen flex bg-gray-100 relative transition-all duration-700 ${
            fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          {/* 📦 Main Content */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-auto space-y-6">
            {/* 🏷️ Title */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <span className="text-xl">📊</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Data Entry Panel
              </h2>
            </div>

            {/* 🔀 Tab Switcher */}
            <div className="flex bg-white p-2 rounded-lg shadow w-max gap-2">
              <button
                onClick={() => setActiveTab("sales")}
                aria-label="Upload Sales Data"
                aria-selected={activeTab === "sales"}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  activeTab === "sales"
                    ? "bg-blue-600 text-white shadow"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                📁 Upload Sales Data
              </button>

              <button
                onClick={() => setActiveTab("inventory")}
                aria-label="Add Inventory Entry"
                aria-selected={activeTab === "inventory"}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  activeTab === "inventory"
                    ? "bg-green-600 text-white shadow"
                    : "text-green-600 hover:bg-green-50"
                }`}
              >
                📦 Add Inventory Entry
              </button>
            </div>

            {/* 🔘 Active Form */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              {activeTab === "sales" ? <Upload_data /> : <InventoryEntryForm />}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Data_Enter_User;
