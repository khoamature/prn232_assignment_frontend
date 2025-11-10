import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Calendar,
  Eye,
  Tag,
  LogIn,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import newsService, {
  NewsArticleItem,
  NewsArticleDetail,
  CategoryDropdownItem,
} from "../service/newsService";
import FPTLogo from "../assets/LOGO.png";
import { ImageCarousel } from "../components/ImageCarousel";
import { UserDropdown } from "../components/UserDropdown";
import authService from "../service/authService";

// Import carousel images
import fpt1 from "../assets/fpt1.avif";
import fpt2 from "../assets/fpt2.jpg";
import fptcantho from "../assets/fptcantho.jpg";
import fptdanang from "../assets/fptdanang.jpg";
import fpthanoi from "../assets/fpthanoi.jpg";
import fpthcm from "../assets/fpthcm.jpg";
import fptquynhon from "../assets/fptquynhon.jpg";

// Use the API's CategoryDropdownItem directly
type CategoryTree = CategoryDropdownItem;

// Carousel images array (excluding logos)
const carouselImages = [
  fpt1,
  fptcantho,
  fptdanang,
  fpthanoi,
  fpthcm,
  fptquynhon,
  fpt2,
];

export function HomePage() {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsArticleItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsArticleDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status
    setIsAuthenticated(authService.isAuthenticated());
    setUserRole(authService.getUserRole());

    // Check for logout toast
    const showLogoutToast = localStorage.getItem("show_logout_toast");
    if (showLogoutToast === "true") {
      toast.success("You have been logged out successfully", {
        duration: 2500,
        position: "top-center",
        icon: null,
        style: {
          background: "oklch(57.7% 0.245 27.325)",
          color: "#fff",
          fontWeight: "600",
        },
      });
      localStorage.removeItem("show_logout_toast");
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadNews();
  }, [selectedCategory, pageNumber]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    if (openDropdown !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdown]);

  const loadCategories = async () => {
    try {
      const response = await newsService.getCategoriesDropdown(false, false);
      if (response.data) {
        setCategoryTree(response.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategoryTree([]);
    }
  };

  const loadNews = async () => {
    try {
      setLoading(true);

      const params: any = {
        PageNumber: pageNumber,
        PageSize: 6,
      };

      if (selectedCategory) {
        params.CategoryId = selectedCategory;
      }

      const response = await newsService.getNewsArticles(params);

      if (response.data) {
        setNews(response.data.items);
        setTotalPages(response.data.totalPages);
        setHasNextPage(response.data.hasNextPage);
        setHasPreviousPage(response.data.hasPreviousPage);
      }
    } catch (error) {
      console.error("Error loading news:", error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsClick = async (newsItem: NewsArticleItem) => {
    try {
      setLoadingDetail(true);
      const response = await newsService.getNewsArticleById(
        newsItem.newsArticleId
      );
      if (response.data) {
        setSelectedNews(response.data);
      }
    } catch (error) {
      console.error("Error loading news detail:", error);
      // Fallback to basic info if API fails
      setSelectedNews({
        ...newsItem,
        newsContent: newsItem.headline,
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setPageNumber((prev) => prev - 1);
    }
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setPageNumber(1); // Reset về trang 1 khi đổi category
    setOpenDropdown(null); // Đóng dropdown
  };

  const toggleDropdown = (categoryId: number) => {
    event?.stopPropagation(); // Prevent closing immediately
    setOpenDropdown(openDropdown === categoryId ? null : categoryId);
  };

  const getSelectedCategoryName = () => {
    if (!selectedCategory) return null;

    // Search in tree recursively
    const findCategory = (items: CategoryTree[]): string | null => {
      for (const item of items) {
        if (item.id === selectedCategory) return item.name;
        if (item.children.length > 0) {
          const found = findCategory(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findCategory(categoryTree);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (selectedNews) {
    return (
      <>
        {/* Navbar */}
        <nav className="bg-orange-600 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded p-1">
                  <img src={FPTLogo} alt="FPT Logo" className="h-8 w-auto" />
                </div>
                <span className="text-white text-2xl font-bold">FPT News</span>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition flex items-center space-x-2"
              >
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSelectedNews(null)}
              className="mb-6 text-orange-600 hover:text-orange-700 font-medium flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to all news</span>
            </button>

            {loadingDetail ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            ) : (
              <article className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-8">
                  {/* Category and Date */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                      {selectedNews.category?.categoryName ||
                        selectedNews.categoryName}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(selectedNews.createdDate)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {selectedNews.newsTitle}
                  </h1>

                  {/* Headline */}
                  <p className="text-xl text-gray-600 mb-6 font-medium">
                    {selectedNews.headline}
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                    <div>
                      <p className="text-gray-700">
                        By{" "}
                        <span className="font-semibold text-gray-900">
                          {selectedNews.author?.fullName ||
                            selectedNews.createdByAccountName}
                        </span>
                      </p>
                      {selectedNews.newsSource && (
                        <p className="text-sm text-gray-500 text-style: italic">
                          Source: {selectedNews.newsSource}
                        </p>
                      )}
                    </div>
                    {selectedNews.modifiedDate && (
                      <p className="text-sm text-gray-500">
                        Last updated: {formatDate(selectedNews.modifiedDate)}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {selectedNews.tags && selectedNews.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mb-6">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {selectedNews.tags.map((tag) => (
                          <span
                            key={tag.tagId}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition"
                          >
                            #{tag.tagName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="prose max-w-none">
                    <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                      {selectedNews.newsContent || selectedNews.headline}
                    </div>
                  </div>
                </div>
              </article>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Navbar */}
      <nav className="bg-orange-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded p-1">
                <img src={FPTLogo} alt="FPT Logo" className="h-8 w-auto" />
              </div>
              <span className="text-white text-2xl font-bold">FPT News</span>
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      if (userRole?.toLowerCase() === "admin") {
                        navigate("/admin");
                      } else if (userRole?.toLowerCase() === "staff") {
                        navigate("/staff");
                      }
                    }}
                    className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition flex items-center space-x-2"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </button>
                  <UserDropdown
                    userEmail={authService.getUserInfo()?.email || ""}
                    userRole={userRole || ""}
                    onLogout={() => authService.logout()}
                  />
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition flex items-center space-x-2"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Image Carousel */}
      <div className="bg-gray-50 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ImageCarousel images={carouselImages} autoPlayInterval={4000} />
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 pt-6 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Latest News
            </h1>
            <p className="text-gray-600">
              Stay updated with the latest news and announcements
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                selectedCategory === null
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Categories
            </button>

            {categoryTree.map((tree) => {
              const hasChildren = tree.children.length > 0;
              const isParentSelected = selectedCategory === tree.id;
              const isChildSelected = tree.children.some(
                (child) => child.id === selectedCategory
              );

              return (
                <div key={tree.id} className="relative">
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        toggleDropdown(tree.id);
                      } else {
                        handleCategoryChange(tree.id);
                      }
                    }}
                    className={`px-4 py-2 rounded-full font-medium transition flex items-center space-x-1 ${
                      isParentSelected || isChildSelected
                        ? "bg-orange-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{tree.name}</span>
                    {hasChildren && <ChevronDown className="h-4 w-4" />}
                  </button>

                  {/* Dropdown for subcategories */}
                  {hasChildren && openDropdown === tree.id && (
                    <div className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px] z-10">
                      {tree.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleCategoryChange(child.id)}
                          className={`w-full text-left px-4 py-2 hover:bg-orange-50 transition ${
                            selectedCategory === child.id
                              ? "bg-orange-100 text-orange-700 font-semibold"
                              : "text-gray-700"
                          }`}
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Show selected category name if subcategory is selected */}
          {selectedCategory && getSelectedCategoryName() && (
            <div className="mb-4 text-sm text-gray-600">
              Viewing:{" "}
              <span className="font-semibold text-orange-600">
                {getSelectedCategoryName()}
              </span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No published news articles yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                  <div
                    key={item.newsArticleId}
                    onClick={() => handleNewsClick(item)}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer flex flex-col h-full"
                  >
                    <div className="p-6 flex flex-col flex-1">
                      {/* Category Badge */}
                      <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide bg-orange-50 px-2 py-1 rounded-full inline-block w-fit">
                        {item.categoryName}
                      </span>

                      {/* Title - Fixed 2 lines */}
                      <h2 className="mt-3 text-xl font-bold text-gray-900 line-clamp-2 min-h-[3.5rem]">
                        {item.newsTitle}
                      </h2>

                      {/* Headline/Description - Fixed 3 lines with ellipsis */}
                      <p className="mt-3 text-gray-600 line-clamp-3 min-h-[4.5rem] flex-1">
                        {item.headline}
                      </p>

                      {/* Footer - Always at bottom */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(item.createdDate)}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          By {item.createdByAccountName}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center space-x-4">
                  <button
                    onClick={handlePreviousPage}
                    disabled={!hasPreviousPage}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                      hasPreviousPage
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span>Previous</span>
                  </button>

                  <span className="text-gray-700 font-medium">
                    Page {pageNumber} of {totalPages}
                  </span>

                  <button
                    onClick={handleNextPage}
                    disabled={!hasNextPage}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                      hasNextPage
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
