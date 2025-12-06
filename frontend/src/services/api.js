// src/services/api.js

import axios from "axios";
import { toast } from "react-toastify";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: parseInt(import.meta.env.REACT_APP_API_TIMEOUT) || 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log("🚀 Request:", config.method.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log("✅ Response:", response.config.url, response.data);
    }

    return response.data;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      const { status, data } = error.response;
      const requestUrl = error.config?.url || "";
      const isAuthLoginRequest = requestUrl.includes("/auth/login");

      switch (status) {
        case 400:
          // Skip toast for login validation errors - let UI handle it
          if (!isAuthLoginRequest) {
            toast.error(data.message || "Dữ liệu không hợp lệ");
          }
          break;

        case 401:
          // Skip global handling for direct login attempts so UI can show inline errors
          if (isAuthLoginRequest) {
            break;
          }

          // Unauthorized - only redirect if not on login page
          if (!window.location.pathname.includes("/login")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          }
          break;

        case 403:
          toast.error("Bạn không có quyền thực hiện thao tác này.");
          break;

        case 404:
          toast.error("Không tìm thấy dữ liệu.");
          break;

        case 409:
          toast.error(data.message || "Dữ liệu đã tồn tại.");
          break;

        case 422:
          // Validation errors
          if (data.errors) {
            Object.values(data.errors).forEach((err) => {
              toast.error(err);
            });
          } else {
            toast.error(data.message || "Dữ liệu không hợp lệ.");
          }
          break;

        case 500:
          toast.error("Lỗi server. Vui lòng thử lại sau.");
          break;

        default:
          toast.error(data.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } else if (error.request) {
      toast.error(
        "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
      );
    } else {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }

    console.error("❌ Response Error:", error);
    return Promise.reject(error);
  }
);

export default api;
