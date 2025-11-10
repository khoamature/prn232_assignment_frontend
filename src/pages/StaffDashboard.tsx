import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderTree, FileText, User, History, Plus, House } from "lucide-react";
import authService from "../service/authService";
import FPTLogo from "../assets/LOGO.png";
import { UserDropdown } from "../components/UserDropdown";

export function StaffDashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(authService.getUserInfo());

  useEffect(() => {
    // Check authentication and role
    if (!authService.isAuthenticated() || !authService.isStaff()) {
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
          Staff Dashboard
        </h1>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition text-left group">
            <div className="flex items-center justify-between mb-3">
              <FolderTree className="h-8 w-8 text-orange-600 group-hover:scale-110 transition" />
              <Plus className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900">Categories</h3>
            <p className="text-sm text-gray-500 mt-1">Manage categories</p>
          </button>

          <button className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition text-left group">
            <div className="flex items-center justify-between mb-3">
              <FileText className="h-8 w-8 text-blue-600 group-hover:scale-110 transition" />
              <Plus className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900">News Articles</h3>
            <p className="text-sm text-gray-500 mt-1">Create & manage news</p>
          </button>

          <button className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition text-left group">
            <div className="flex items-center justify-between mb-3">
              <User className="h-8 w-8 text-green-600 group-hover:scale-110 transition" />
            </div>
            <h3 className="font-semibold text-gray-900">My Profile</h3>
            <p className="text-sm text-gray-500 mt-1">Update your info</p>
          </button>

          <button className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition text-left group">
            <div className="flex items-center justify-between mb-3">
              <History className="h-8 w-8 text-purple-600 group-hover:scale-110 transition" />
            </div>
            <h3 className="font-semibold text-gray-900">My Articles</h3>
            <p className="text-sm text-gray-500 mt-1">View your history</p>
          </button>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FolderTree className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Category Management
                </h2>
              </div>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New</span>
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Create, edit, and organize news categories
            </p>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-500 text-sm text-center py-4">
                No categories yet. Create your first category!
              </p>
            </div>
          </div>

          {/* News Article Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  News Articles
                </h2>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Article</span>
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Manage your news articles and tags
            </p>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-500 text-sm text-center py-4">
                No articles yet. Create your first article!
              </p>
            </div>
          </div>

          {/* Profile */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-gray-900">{userInfo.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <p className="mt-1 text-gray-900">{userInfo.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <p className="mt-1 text-gray-900">{userInfo.role}</p>
              </div>
              <button className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition mt-4">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Article History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <History className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">
                My Article History
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              View all news articles created by you
            </p>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-500 text-sm text-center py-4">
                No article history yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
