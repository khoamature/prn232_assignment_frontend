import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BarChart3,
  Calendar,
  TrendingUp,
  FileText,
  House,
} from "lucide-react";
import authService from "../service/authService";
import FPTLogo from "../assets/LOGO.png";
import { UserDropdown } from "../components/UserDropdown";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(authService.getUserInfo());

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
              <span className="text-white text-2xl font-bold">FPT News</span>
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <Users className="h-12 w-12 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Articles</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">
                User Management
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Manage user accounts information (CRUD operations)
            </p>
            <button className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition">
              Manage Users
            </button>
          </div>

          {/* Reports & Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Reports & Statistics
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              View dashboard reports by date range (news created date)
            </p>

            {/* Date Range Selector */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
