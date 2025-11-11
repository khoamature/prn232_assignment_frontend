import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { House, FolderTree, FileText, History } from "lucide-react";
import authService from "../service/authService";
import FPTLogo from "../assets/LOGO.png";
import { UserDropdown } from "../components/UserDropdown";
import { CategoryManagement } from "../components/CategoryManagement";
import { NewsManagement } from "../components/NewsManagement";
import { MyNewsManagement } from "../components/MyNewsManagement";

type ActiveSection = "categories" | "news" | "myNews";

export function StaffDashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(authService.getUserInfo());
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("categories");

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
          Staff Dashboard
        </h1>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveSection("categories")}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeSection === "categories"
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FolderTree className="h-5 w-5" />
                <span>Category Management</span>
              </button>

              <button
                onClick={() => setActiveSection("news")}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeSection === "news"
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FileText className="h-5 w-5" />
                <span>News Articles</span>
              </button>

              <button
                onClick={() => setActiveSection("myNews")}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeSection === "myNews"
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <History className="h-5 w-5" />
                <span>My news</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Sections */}
        {activeSection === "categories" && <CategoryManagement />}

        {activeSection === "news" && <NewsManagement />}

        {activeSection === "myNews" && <MyNewsManagement />}
      </div>
    </div>
  );
}
