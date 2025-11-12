import axios from "axios";

// Tạo instance axios
const axiosInstance = axios.create({
  baseURL: "https://localhost:7106/api",
  timeout: 10000, // Timeout sau 10 giây
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Thêm token vào mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý response và lỗi
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server trả về lỗi
      switch (error.response.status) {
        case 401:
          // Unauthorized
          const currentPath = window.location.pathname;
          const publicPaths = ["/", "/login"];

          // Chỉ redirect nếu KHÔNG phải trang public (homepage hoặc login)
          const isPublicPage = publicPaths.includes(currentPath);

          if (!isPublicPage) {
            // Chỉ xóa token và redirect khi ở trang protected
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_info");
            window.location.href = "/login";
          }
          // Nếu là trang public, để component tự xử lý lỗi
          break;
        case 403:
          console.error("Forbidden - Bạn không có quyền truy cập");
          break;
        case 404:
          console.error("Not Found - Không tìm thấy tài nguyên");
          break;
        case 500:
          console.error("Server Error - Lỗi máy chủ");
          break;
        default:
          console.error(
            "Error:",
            error.response.data.message || "Đã xảy ra lỗi"
          );
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error("Network Error - Không thể kết nối đến server");
    } else {
      // Lỗi khác
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
