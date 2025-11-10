import axiosInstance from "./axiosInstance";

export interface AccountProfile {
  accountId: number;
  accountName: string;
  accountEmail: string;
  accountRole: number;
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

class AccountService {
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
