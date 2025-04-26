import { useState } from "react";
import Admin_Sidebar from "../Components/AdminComponents/Admin_Sidebar/Admin_sidebar";
import Admin_Navbar from "../Components/AdminComponents/Admin_Navbar/Admin_Navbar";
import Admin_table from "../Components/AdminComponents/Admin_table/Admin_table";

const Admin_Section_Admin_Page = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  const handleToggleSidebar = () => setShowSidebar(!showSidebar);
  const handleCloseSidebar = () => setShowSidebar(false);

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      {/* 🔒 Mobile Backdrop */}
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

      {/* 👤 Admin Table Content */}
      <div className="flex-1 flex flex-col md:ml-64 z-10 p-4 sm:p-6 overflow-auto mt-[64px]">
        <Admin_table />
      </div>
    </div>
  );
};

export default Admin_Section_Admin_Page;
