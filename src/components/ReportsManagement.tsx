import { useState } from "react";
import {
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Folder,
  BarChart3,
  PieChart,
  Download,
} from "lucide-react";
import reportService, { ReportData } from "../service/reportService";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ReportsManagementProps {
  onClose?: () => void;
}

const BASE_COLORS = [
  "#f97316", // orange-500
  "#3b82f6", // blue-500
  "#10b981", // green-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#f43f5e", // rose-500
  "#6366f1", // indigo-500
  "#14b8a6", // teal-500
  "#f59e0b", // amber-500
  "#a855f7", // purple-500
  "#ef4444", // red-500
  "#22c55e", // green-600
  "#0ea5e9", // sky-500
  "#d946ef", // fuchsia-500
  "#eab308", // yellow-500
  "#8b5cf6", // violet-600
  "#ec4899", // pink-600
];

// Function to generate unique colors for any number of items
const generateColor = (index: number): string => {
  // First use base colors
  if (index < BASE_COLORS.length) {
    return BASE_COLORS[index];
  }

  // Then generate HSL colors with good distribution
  const hue = (index * 137.508) % 360; // Golden angle for good distribution
  const saturation = 65 + (index % 3) * 10; // Vary saturation: 65%, 75%, 85%
  const lightness = 50 + (index % 2) * 10; // Vary lightness: 50%, 60%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export function ReportsManagement({ onClose }: ReportsManagementProps) {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    try {
      setLoading(true);

      // Set start date to beginning of day, end date to end of day
      const startDateTime = `${startDate}T00:00:00`;
      const endDateTime = `${endDate}T23:59:59`;

      const response = await reportService.getReport({
        startDate: startDateTime,
        endDate: endDateTime,
      });

      if (response.data) {
        setReportData(response.data);
        toast.success("Report generated successfully!");
      }
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast.error(error.response?.data?.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Prepare data for charts
  const categoryChartData = reportData?.categoryBreakdown
    .filter((item) => item.totalArticles > 0)
    .slice(0, 10); // Top 10

  const dailyChartData = reportData?.dailyBreakdown
    .map((item) => ({
      date: formatDate(item.date),
      total: item.totalArticles,
      active: item.activeArticles,
      inactive: item.inactiveArticles,
    }))
    .reverse(); // Oldest to newest

  const authorChartData = reportData?.authorBreakdown.filter(
    (item) => item.totalArticles > 0
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Reports & Statistics
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Generate and view news article statistics
            </p>
          </div>
          <FileText className="h-8 w-8 text-orange-600" />
        </div>

        {/* Date Range Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="h-5 w-5" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportData ? (
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Total Articles
                  </p>
                  <p className="text-3xl font-bold text-orange-900 mt-2">
                    {reportData.totalArticlesCreated}
                  </p>
                </div>
                <FileText className="h-12 w-12 text-orange-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Active Articles
                  </p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">
                    {reportData.totalArticlesCreated -
                      reportData.inactiveArticlesCount}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Total Categories
                  </p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    {reportData.totalCategories}
                  </p>
                </div>
                <Folder className="h-12 w-12 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Total Authors
                  </p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">
                    {reportData.authorBreakdown.length}
                  </p>
                </div>
                <Users className="h-12 w-12 text-purple-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Breakdown Line Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span>Daily Articles Trend</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#f97316"
                    name="Total"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#10b981"
                    name="Active"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown Pie Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-orange-600" />
                <span>Articles by Category</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categoryChartData as any}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) =>
                      `${entry.itemName}: ${entry.percentage.toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalArticles"
                    nameKey="itemName"
                  >
                    {categoryChartData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={generateColor(index)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown Bar Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <span>Top Categories</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="itemName"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalArticles" fill="#f97316" name="Articles" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Author Breakdown Bar Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-600" />
                <span>Articles by Author</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={authorChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="itemName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalArticles" fill="#3b82f6" name="Articles" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">
                  Category Breakdown
                </h3>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Articles
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.categoryBreakdown.map((item) => (
                      <tr key={item.itemId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.itemName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                          {item.totalArticles}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Author Breakdown Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">
                  Author Breakdown
                </h3>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Author
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Articles
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.authorBreakdown.map((item) => (
                      <tr key={item.itemId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.itemName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                          {item.totalArticles}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            Select a date range and click "Generate Report"
          </p>
          <p className="text-gray-400 text-sm mt-2">
            View comprehensive statistics and insights about news articles
          </p>
        </div>
      )}
    </div>
  );
}
