import axios from "axios";

// Base API configuration
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Quan trọng: gửi cookies trong requests
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor (không cần thêm token vào header nữa vì dùng cookies)
apiClient.interceptors.request.use(
  (config) => {
    // Cookies sẽ được browser tự động gửi kèm với withCredentials: true
    console.log("🍪 Request with cookies to:", config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log("🚨 401 error - clearing auth data");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      // Only redirect if not already on login/register page
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API services
export const authAPI = {
  // User registration
  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return {
        success: true,
        data: response.data,
        message: response.data.message || "Registration successful",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // User login
  login: async (credentials) => {
    try {
      console.log("🚀 Sending login request to backend...");
      const response = await apiClient.post("/auth/login", credentials);
      console.log("📨 Backend response:", response.data);
      console.log("📨 Status:", response.status);

      // Handle HttpOnly cookie-based authentication
      if (response.data.success === true && response.status === 200) {
        console.log("✅ Login successful with HttpOnly cookies!");

        // Backend đã set HttpOnly cookie, không cần lưu token
        // Chỉ cần lưu user data để hiển thị UI
        const user = response.data.user || {
          id: Date.now(),
          name: credentials.email.split("@")[0],
          email: credentials.email,
          avatar: null,
        };

        // Chỉ lưu user data, không lưu token (vì đã có HttpOnly cookie)
        localStorage.setItem("user", JSON.stringify(user));
        console.log("💾 Stored user data (token in HttpOnly cookie):", user);

        return {
          success: true,
          data: response.data,
          user: user,
          message: "Login successful",
        };
      }

      // Try to extract real token and user data for proper JWT backends
      const token =
        response.data.token ||
        response.data.accessToken ||
        response.data.jwt ||
        response.data.access_token;
      const user = response.data.user || response.data.data;

      if (token && user) {
        // Store real auth data (backup cho trường hợp không dùng HttpOnly cookies)
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        console.log("💾 Stored real auth data");

        return {
          success: true,
          data: response.data,
          token,
          user,
          message: response.data.message || "Login successful",
        };
      }

      // If we get here, backend response is unexpected
      return {
        success: false,
        message: "Unexpected response format from server",
      };
    } catch (error) {
      console.error("❌ Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // User logout
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      return {
        success: true,
        message: "Logout successful",
      };
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      return {
        success: true,
        message: "Logout completed",
      };
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      return {
        success: true,
        data: response.data,
        message: response.data.message || "Password reset email sent",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send reset email",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        token,
        password: newPassword,
      });
      return {
        success: true,
        data: response.data,
        message: response.data.message || "Password reset successful",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Password reset failed",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get("/auth/profile");
      return {
        success: true,
        data: response.data,
        user: response.data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch profile",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await apiClient.post("/auth/verify-email", { token });
      return {
        success: true,
        data: response.data,
        message: response.data.message || "Email verified successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Email verification failed",
        errors: error.response?.data?.errors || [],
      };
    }
  },
};

// Utility functions for HttpOnly cookie authentication
export const authUtils = {
  // Check if user is authenticated (chỉ cần kiểm tra user data)
  isAuthenticated: () => {
    const user = localStorage.getItem("user");
    return !!user; // HttpOnly cookie sẽ được browser tự động gửi
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    try {
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  // Get auth token (không cần thiết với HttpOnly cookies)
  getToken: () => {
    // Với HttpOnly cookie, token không accessible từ JavaScript
    // Return null để AuthContext biết là dùng cookie-based auth
    return null;
  },

  // Save user data to localStorage (for caching)
  saveUser: (userData) => {
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("💾 User data saved to localStorage:", userData);
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  },

  // Clear auth data
  clearAuthData: () => {
    // Chỉ clear user data, HttpOnly cookie sẽ được clear bởi backend
    localStorage.removeItem("user");
    console.log("🗑️ Auth data cleared from localStorage");
    // localStorage.removeItem("authToken"); // không cần với HttpOnly cookies
  },
};

export default apiClient;
