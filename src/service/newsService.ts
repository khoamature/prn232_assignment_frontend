import axiosInstance from "./axiosInstance";

// API Response types
export interface NewsArticleItem {
  newsArticleId: number;
  newsTitle: string;
  headline: string;
  createdDate: string;
  categoryName: string;
  newsStatus: number;
  createdByAccountName: string;
}

export interface NewsArticleDetail extends NewsArticleItem {
  newsContent?: string;
  newsSource?: string;
  category?: {
    categoryId: number;
    categoryName: string;
  };
  author?: {
    systemAccountId: number;
    fullName: string;
    email: string;
  };
  lastModifiedBy?: {
    systemAccountId: number;
    fullName: string;
    email: string;
  } | null;
  modifiedDate?: string | null;
  tags?: {
    tagId: number;
    tagName: string;
  }[];
}

export interface PaginationData<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  message: string;
  statusCode: string;
  data: T;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  parent?: {
    parentCategoryId: number;
    parentCategoryName: string;
  } | null;
  isActive: boolean;
}

export interface CategoryDropdownItem {
  id: number;
  name: string;
  children: CategoryDropdownItem[];
}

export interface CategoryResponse {
  items: Category[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface NewsParams {
  CategoryId?: number;
  NewsStatus?: string;
  PageNumber?: number;
  PageSize?: number;
  SortBy?: string;
  SearchTerm?: string;
}

// News Service - Tất cả các API calls liên quan đến News
class NewsService {
  // Lấy danh sách news articles với pagination
  async getNewsArticles(params: NewsParams = {}) {
    const defaultParams: NewsParams = {
      NewsStatus: "Active",
      PageNumber: 1,
      PageSize: 6,
      SortBy: "CreatedDate",
      ...params,
    };

    const response = await axiosInstance.get<
      ApiResponse<PaginationData<NewsArticleItem>>
    >("/NewsArticles", { params: defaultParams });
    return response.data;
  }

  // Lấy chi tiết một news article
  async getNewsArticleById(id: number) {
    const response = await axiosInstance.get<ApiResponse<NewsArticleDetail>>(
      `/NewsArticles/${id}`
    );
    return response.data;
  }

  // Lấy danh sách categories
  async getCategories(isActive: boolean = true) {
    const response = await axiosInstance.get<ApiResponse<CategoryResponse>>(
      "/Categories",
      { params: { IsActive: isActive } }
    );
    return response.data;
  }

  // Lấy danh sách categories dạng dropdown (đã tổ chức sẵn cây)
  async getCategoriesDropdown(
    includeInactive: boolean = false,
    includeParentOnly: boolean = false
  ) {
    const response = await axiosInstance.get<
      ApiResponse<CategoryDropdownItem[]>
    >("/Categories/dropdown", {
      params: {
        IncludeInactive: includeInactive,
        IncludeParentCategoriesOnly: includeParentOnly,
      },
    });
    return response.data;
  }

  // Tìm kiếm news articles
  async searchNews(searchTerm: string, params: NewsParams = {}) {
    return this.getNewsArticles({
      ...params,
      SearchTerm: searchTerm,
    });
  }

  // Lấy tin tức mới nhất
  async getLatestNews(limit: number = 10) {
    return this.getNewsArticles({
      PageSize: limit,
      SortBy: "CreatedDate",
    });
  }

  // Lấy tin tức theo category
  async getNewsByCategory(
    categoryId: number,
    pageNumber: number = 1,
    pageSize: number = 6
  ) {
    return this.getNewsArticles({
      CategoryId: categoryId,
      PageNumber: pageNumber,
      PageSize: pageSize,
    });
  }
}

// Export singleton instance
export const newsService = new NewsService();
export default newsService;
