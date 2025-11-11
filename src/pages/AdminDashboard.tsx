import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BarChart3, Calendar, House } from "lucide-react";
import authService from "../service/authService";
import FPTLogo from "../assets/LOGO.png";
import { UserDropdown } from "../components/UserDropdown";
import { UserManagement } from "../components/UserManagement";

type ActiveSection = "users" | "reports";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(authService.getUserInfo());
  const [activeSection, setActiveSection] = useState<ActiveSection>("users");

  useEffect(() => {
    // Check authentication and role
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      navigate("/login");
      return;
    }
    setUserInfo(authService.getUserInfo());
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (!userInfo) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded p-1">
                <img src={FPTLogo} alt="FPT Logo" className="h-8 w-auto" />
              </div>
              <span className="text-white text-2xl font-bold">FU News</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleGoHome}
                className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition flex items-center space-x-2"
              >
                <House className="h-5 w-5" />
                <span>HomePage</span>
              </button>
              <UserDropdown
                userEmail={userInfo.email}
                userRole={userInfo.role}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Dashboard
        </h1>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveSection("users")}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeSection === "users"
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Users className="h-5 w-5" />
                <span>User Management</span>
              </button>

              <button
                onClick={() => setActiveSection("reports")}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeSection === "reports"
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Reports & Statistics</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Sections */}
        {activeSection === "users" && <UserManagement />}

        {activeSection === "reports" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Reports & Statistics
            </h2>
            <p className="text-gray-600 mb-6">
              View dashboard reports by date range (news created date)
            </p>

            {/* Date Range Selector */}
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <button className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Generate Report</span>
              </button>
            </div>

            {/* Report content will go here */}
          </div>
        )}
      </div>
    </div>
  );
}
