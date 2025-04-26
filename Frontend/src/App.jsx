import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 📄 Import your pages
import Login from "./Pages/LoginPage";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./Pages/ForgotPassword/ResetPassword";
import AdminForgotPassword from "./Pages/ForgotPassword/Admin_ForgotPassword";
import AdminResetPassword from "./Pages/ForgotPassword/AdminResetPassword";
import Dashboard from "./Pages/Dashboard";
import Forecast from "./Pages/Forecast";
import Data_Enter_User from "./Pages/Data_Enter_User";
import Search_data from "./Pages/search_data";
import Report from "./Pages/Report";
import Admin_LoginPage from "./AdminPages/Admin_Login";
import Admin_Dashboard from "./AdminPages/Admin_Dashboard";
import Admin_Section_User_Page from "./AdminPages/Admin_Section_User_Page";
import Admin_Section_Admin_Page from "./AdminPages/Admin_Section_Admin_Page";
import Admin_Login from "./AdminPages/Admin_Login";
import Forecast_Model from "./AdminPages/Forecast_Model";
import Inventory from "./Pages/Inventory";
import Admin_Inventory from "./AdminPages/Admin_Inventory";
import Admin_Sales_Management from "./AdminPages/Admin_Sales_Management";
import Sales from "./Pages/Sales";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* ✅ User Side Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/LoginPage" element={<Login />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/ResetPassword/:token" element={<ResetPassword />} />

          {/* ✅ Admin Side Routes */}
          <Route path="/Admin-Login" element={<Admin_LoginPage />} />
          <Route
            path="/AdminForgotPassword"
            element={<AdminForgotPassword />}
          />
          <Route
            path="/AdminResetPassword/:token"
            element={<AdminResetPassword />}
          />

          {/* ✅ User Dashboard */}
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Forecast" element={<Forecast />} />
          <Route path="/DataEntryUser" element={<Data_Enter_User />} />
          <Route path="/SearchData" element={<Search_data />} />
          <Route path="/Report" element={<Report />} />
          <Route path="/Inventory" element={<Inventory />} />
          <Route path="/Sales" element={<Sales />} />

          {/* ✅ Admin Dashboard */}
          <Route path="/Admin_Dashboard" element={<Admin_Dashboard />} />
          <Route
            path="/Admin_Section_User_Page"
            element={<Admin_Section_User_Page />}
          />
          <Route
            path="/Admin_Section_Admin_Page"
            element={<Admin_Section_Admin_Page />}
          />
          <Route path="/Admin_Login" element={<Admin_Login />} />
          <Route path="/Forecast_Model" element={<Forecast_Model />} />
          <Route path="/Admin_Inventory" element={<Admin_Inventory />} />
          <Route
            path="/Admin_Sales_Management"
            element={<Admin_Sales_Management />}
          />
        </Routes>
      </Router>

      {/* ✅ Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
