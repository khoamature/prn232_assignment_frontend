import axiosInstance from "./axiosInstance";

export interface AccountProfile {
  accountId: number;
  accountName: string;
  accountEmail: string;
  accountRole: number;
}

export interface Account {
  accountId: number;
  accountName: string;
  accountEmail: string;
  accountRole: number; // 0: Admin, 1: Staff, 2: Lecturer
}

export interface AccountParams {
  AccountName?: string;
  AccountEmail?: string;
  AccountRole?: number;
  PageNumber?: number;
  PageSize?: number;
  SortBy?: string;
  SortOrder?: string;
  IsDescending?: boolean;
}

export interface AccountListResponse {
  message: string;
  statusCode: string;
  data: {
    items: Account[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface AccountProfileResponse {
  message: string;
  statusCode: string;
  data: AccountProfile;
}

export interface UpdateProfileRequest {
  accountName: string;
  accountEmail: string;
}

export interface ChangePasswordRequest {
  password: string;
}

export interface UpdateAccountRequest {
  accountName?: string;
  accountEmail?: string;
  password?: string;
}

export interface AccountDetailResponse {
  message: string;
  statusCode: string;
  data: Account;
}

export interface UpdateAccountAdminRequest {
  accountName: string;
  accountEmail: string;
  accountRole: string; // "Admin" | "Staff" | "Lecturer"
}

export interface CreateAccountRequest {
  accountName: string;
  accountEmail: string;
  password: string;
  accountRole: string; // "Admin" | "Staff" | "Lecturer"
}

class AccountService {
  async getAccounts(params?: AccountParams): Promise<AccountListResponse> {
    const response = await axiosInstance.get<AccountListResponse>("/Accounts", {
      params,
    });
    return response.data;
  }

  async getAccountById(id: number): Promise<AccountDetailResponse> {
    const response = await axiosInstance.get<AccountDetailResponse>(
      `/Accounts/${id}`
    );
    return response.data;
  }

  async updateAccount(
    id: number,
    data: UpdateAccountAdminRequest
  ): Promise<any> {
    const response = await axiosInstance.put(`/Accounts/${id}`, data);
    return response.data;
  }

  async deleteAccount(id: number): Promise<any> {
    const response = await axiosInstance.delete(`/Accounts/${id}`);
    return response.data;
  }

  async createAccount(data: CreateAccountRequest): Promise<any> {
    const response = await axiosInstance.post("/Accounts", data);
    return response.data;
  }

  async getProfile(): Promise<AccountProfileResponse> {
    const response = await axiosInstance.get<AccountProfileResponse>(
      "/Accounts/profile"
    );
    return response.data;
  }

  async updateProfile(
    data: UpdateProfileRequest
  ): Promise<AccountProfileResponse> {
    const response = await axiosInstance.put<AccountProfileResponse>(
      "/Accounts/profile",
      data
    );
    return response.data;
  }

  async changePassword(password: string): Promise<AccountProfileResponse> {
    const response = await axiosInstance.put<AccountProfileResponse>(
      "/Accounts/profile",
      { password }
    );
    return response.data;
  }
}

export default new AccountService();
