import axiosInstance from "./axiosInstance";
import toast from "react-hot-toast";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  statusCode: string;
  data: string; // JWT token
}

export interface DecodedToken {
  sub: string;
  id: string;
  email: string;
  role: string;
  jti: string;
  nbf: number;
  exp: number;
  iss: string;
  aud: string;
}

class AuthService {
  private readonly TOKEN_KEY = "auth_token";
  private readonly USER_KEY = "user_info";

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(
      "/Accounts/login",
      {
        email,
        password,
      }
    );
    return response.data;
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  decodeToken(token: string): DecodedToken | null {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  getUserInfo(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    const cached = localStorage.getItem(this.USER_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    const decoded = this.decodeToken(token);
    if (decoded) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(decoded));
    }
    return decoded;
  }

  getUserRole(): string | null {
    const userInfo = this.getUserInfo();
    return userInfo?.role || null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = this.decodeToken(token);
    if (!decoded) return false;

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  }

  isAdmin(): boolean {
    return this.getUserRole()?.toLowerCase() === "admin";
  }

  isStaff(): boolean {
    return this.getUserRole()?.toLowerCase() === "staff";
  }

  logout(): void {
    this.removeToken();
    
    // Set flag for logout toast
    localStorage.setItem("show_logout_toast", "true");

    // Redirect to home page immediately
    window.location.href = "/";
  }
}

export default new AuthService();
