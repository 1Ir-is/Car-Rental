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
  withCredentials: true, // Important: send cookies with requests
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log("🍪 User API request with cookies to:", config.url);
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
    console.error("❌ User API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// User API operations
export const userAPI = {
  // Get current user profile
  getCurrentProfile: async () => {
    try {
      const response = await apiClient.get("/user/me");
      return {
        success: true,
        data: response.data,
        message: "Profile retrieved successfully",
      };
    } catch (error) {
      console.error("❌ Get current user profile error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to get profile",
      };
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await apiClient.put("/user/me", userData);
      return {
        success: true,
        data: response.data,
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("❌ Update profile error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to update profile",
      };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.put(
        "/user/change-password",
        passwordData
      );
      return {
        success: true,
        data: response.data,
        message: "Password changed successfully",
      };
    } catch (error) {
      console.error("❌ Change password error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to change password",
      };
    }
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    try {
      const response = await apiClient.post("/user/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return {
        success: true,
        data: response.data,
        message: "Avatar uploaded successfully",
      };
    } catch (error) {
      console.error("❌ Upload avatar error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to upload avatar",
      };
    }
  },

  // Delete user account
  deleteAccount: async () => {
    try {
      const response = await apiClient.delete("/user/account");
      return {
        success: true,
        data: response.data,
        message: "Account deleted successfully",
      };
    } catch (error) {
      console.error("❌ Delete account error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to delete account",
      };
    }
  },
};

// User utilities
export const userUtils = {
  // Save user data to localStorage
  saveUser: (user) => {
    try {
      localStorage.setItem("user", JSON.stringify(user));
      console.log("💾 User data saved to localStorage");
    } catch (error) {
      console.error("❌ Error saving user to localStorage:", error);
    }
  },

  // Get user data from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("❌ Error getting user from localStorage:", error);
      return null;
    }
  },

  // Clear user data from localStorage
  clearUser: () => {
    try {
      localStorage.removeItem("user");
      console.log("🗑️ User data cleared from localStorage");
    } catch (error) {
      console.error("❌ Error clearing user from localStorage:", error);
    }
  },

  // Get user initials for avatar placeholder
  getUserInitials: (user) => {
    if (!user || !user.name) return "U";
    const nameParts = user.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(
        0
      )}`.toUpperCase();
    }
    return user.name.charAt(0).toUpperCase();
  },

  // Format user display name
  formatDisplayName: (user) => {
    if (!user) return "Unknown User";
    return user.name || user.email || "User";
  },

  // Check if user has complete profile
  isProfileComplete: (user) => {
    if (!user) return false;
    const requiredFields = ["name", "email", "phone"];
    return requiredFields.every(
      (field) => user[field] && user[field].trim() !== ""
    );
  },

  // Get trust point level info
  getTrustPointLevel: (trustPoint = 0) => {
    if (trustPoint >= 90) {
      return {
        level: "Diamond",
        color: "purple",
        icon: "ri-diamond-line",
      };
    } else if (trustPoint >= 70) {
      return {
        level: "Gold",
        color: "warning",
        icon: "ri-award-line",
      };
    } else if (trustPoint >= 50) {
      return {
        level: "Silver",
        color: "secondary",
        icon: "ri-medal-line",
      };
    } else if (trustPoint >= 30) {
      return {
        level: "Bronze",
        color: "info",
        icon: "ri-copper-coin-line",
      };
    } else {
      return {
        level: "New",
        color: "light",
        icon: "ri-user-line",
      };
    }
  },
};

// Export userAPI as userService for consistency
export const userService = userAPI;
export default apiClient;
