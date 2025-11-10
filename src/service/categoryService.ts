import axiosInstance from "./axiosInstance";

export interface ParentCategory {
  parentCategoryId: number;
  parentCategoryName: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  categoryDescription: string;
  parent: ParentCategory | null;
  isActive: boolean;
}

export interface CategoryListResponse {
  message: string;
  statusCode: string;
  data: {
    items: Category[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface CategoryParams {
  CategoryName?: string;
  ParentCategoryId?: number;
  IsActive?: boolean;
  PageNumber?: number;
  PageSize?: number;
  SortBy?: string;
  SortOrder?: string;
  IsDescending?: boolean;
}

export interface CategoryDropdownItem {
  id: number;
  name: string;
  children: CategoryDropdownItem[];
}

export interface CategoryDropdownResponse {
  message: string;
  statusCode: string;
  data: CategoryDropdownItem[];
}

export interface CreateCategoryRequest {
  categoryName: string;
  categoryDescription: string;
  parentCategoryId?: number;
  isActive: boolean;
}

class CategoryService {
  async getCategories(params?: CategoryParams): Promise<CategoryListResponse> {
    const response = await axiosInstance.get<CategoryListResponse>(
      "/Categories",
      {
        params,
      }
    );
    return response.data;
  }

  async getCategoriesDropdown(
    includeInactive: boolean = false,
    includeParentCategoriesOnly: boolean = false
  ): Promise<CategoryDropdownResponse> {
    const response = await axiosInstance.get<CategoryDropdownResponse>(
      "/Categories/dropdown",
      {
        params: {
          IncludeInactive: includeInactive,
          IncludeParentCategoriesOnly: includeParentCategoriesOnly,
        },
      }
    );
    return response.data;
  }

  async getCategoryById(id: number): Promise<any> {
    const response = await axiosInstance.get(`/Categories/${id}`);
    return response.data;
  }

  async createCategory(data: CreateCategoryRequest): Promise<any> {
    const response = await axiosInstance.post("/Categories", data);
    return response.data;
  }

  async updateCategory(id: number, data: any): Promise<any> {
    const response = await axiosInstance.put(`/Categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: number): Promise<any> {
    const response = await axiosInstance.delete(`/Categories/${id}`);
    return response.data;
  }
}

export default new CategoryService();
