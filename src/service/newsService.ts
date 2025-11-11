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
  CreatedBy?: number;
  UpdatedBy?: number;
  NewsTitle?: string;
  Headline?: string;
  NewsSource?: string;
  CategoryId?: number;
  NewsStatus?: string;
  CreatedDateFrom?: string;
  CreatedDateTo?: string;
  TagIds?: number[];
  PageNumber?: number;
  PageSize?: number;
  SortBy?: string;
  SortOrder?: string;
  IsDescending?: boolean;
}

export interface CreateNewsArticleRequest {
  newsTitle: string;
  headline: string;
  newsContent: string;
  newsSource: string;
  categoryId: number;
  tagIds: number[];
}

export interface UpdateNewsArticleRequest {
  newsTitle: string;
  headline: string;
  newsContent: string;
  newsSource: string;
  categoryId: number;
  newsStatus: string; // "Inactive" or "Active"
  tagIds: number[];
}

// News Service - Tất cả các API calls liên quan đến News
class NewsService {
  // Lấy danh sách news articles với pagination
  async getNewsArticles(params: NewsParams = {}) {
    const response = await axiosInstance.get<
      ApiResponse<PaginationData<NewsArticleItem>>
    >("/NewsArticles", { params });
    return response.data;
  }

  // Lấy danh sách my news articles với pagination
  async getMyNewsArticles(params: NewsParams = {}) {
    const response = await axiosInstance.get<
      ApiResponse<PaginationData<NewsArticleItem>>
    >("/NewsArticles/my-news", { params });
    return response.data;
  }

  // Lấy chi tiết một news article
  async getNewsArticleById(id: number) {
    const response = await axiosInstance.get<ApiResponse<NewsArticleDetail>>(
      `/NewsArticles/${id}`
    );
    return response.data;
  }

  // Tạo news article mới
  async createNewsArticle(data: CreateNewsArticleRequest) {
    const response = await axiosInstance.post<ApiResponse<any>>(
      "/NewsArticles",
      data
    );
    return response.data;
  }

  // Cập nhật news article
  async updateNewsArticle(id: number, data: UpdateNewsArticleRequest) {
    const response = await axiosInstance.put<ApiResponse<any>>(
      `/NewsArticles/${id}`,
      data
    );
    return response.data;
  }

  // Xóa news article
  async deleteNewsArticle(id: number) {
    const response = await axiosInstance.delete<ApiResponse<any>>(
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
      NewsTitle: searchTerm,
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
