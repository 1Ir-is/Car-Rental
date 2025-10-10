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
  timeout: 60000, // 10 seconds timeout
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log("🍪 Application API request with cookies to:", config.url);
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
    console.error(
      "❌ Application API Error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// Application API operations
export const applicationAPI = {
  // Submit driver application
  submitDriverApplication: async (applicationData) => {
    try {
      const response = await apiClient.post(
        "/user/approval-application",
        applicationData
      );
      return {
        success: true,
        data: response.data,
        message: "Application submitted successfully",
      };
    } catch (error) {
      console.error("❌ Submit driver application error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to submit application",
      };
    }
  },

  // Get user's current application status
  getDriverApplicationStatus: async () => {
    try {
      const response = await apiClient.get("/user/approval-application");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("❌ Get driver application status error:", error);

      // If 404, it means no application exists
      if (error.response?.status === 404) {
        return {
          success: true,
          data: null, // No application found
        };
      }

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to get application status",
      };
    }
  },

  // Get all user applications (same as getDriverApplicationStatus for this API)
  getUserApplications: async () => {
    try {
      const response = await apiClient.get("/user/approval-application");
      return {
        success: true,
        data: response.data ? [response.data] : [], // Wrap single application in array
      };
    } catch (error) {
      console.error("❌ Get user applications error:", error);

      // If 404, return empty array
      if (error.response?.status === 404) {
        return {
          success: true,
          data: [],
        };
      }

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to get user applications",
      };
    }
  },

  // Note: Update and Cancel operations not supported by current backend API
  // If needed in the future, backend needs to implement PUT and DELETE endpoints

  // // Update driver application (NOT IMPLEMENTED in backend)
  // updateDriverApplication: async (applicationId, applicationData) => {
  //   try {
  //     const response = await apiClient.put(
  //       `/user/approval-application/${applicationId}`,
  //       applicationData
  //     );
  //     return {
  //       success: true,
  //       data: response.data,
  //       message: "Application updated successfully",
  //     };
  //   } catch (error) {
  //     console.error("❌ Update driver application error:", error);
  //     return {
  //       success: false,
  //       message:
  //         error.response?.data?.message ||
  //         error.response?.data ||
  //         "Failed to update application",
  //     };
  //   }
  // },

  // // Cancel driver application (NOT IMPLEMENTED in backend)
  // cancelDriverApplication: async (applicationId) => {
  //   try {
  //     const response = await apiClient.delete(
  //       `/user/approval-application/${applicationId}`
  //     );
  //     return {
  //       success: true,
  //       data: response.data,
  //       message: "Application cancelled successfully",
  //     };
  //   } catch (error) {
  //     console.error("❌ Cancel driver application error:", error);
  //     return {
  //       success: false,
  //       message:
  //         error.response?.data?.message ||
  //         error.response?.data ||
  //         "Failed to cancel application",
  //     };
  //   }
  // },
};

// Application utilities
export const applicationUtils = {
  // Format application status for display
  formatStatus: (status) => {
    const statusMap = {
      NOT_SUBMITTED: {
        label: "Not Submitted",
        color: "secondary",
        icon: "ri-draft-line",
      },
      PENDING: {
        label: "Pending Review",
        color: "warning",
        icon: "ri-time-line",
      },
      APPROVED: { label: "Approved", color: "success", icon: "ri-check-line" },
      REJECTED: { label: "Rejected", color: "danger", icon: "ri-close-line" },
    };
    return (
      statusMap[status] || {
        label: "Unknown",
        color: "secondary",
        icon: "ri-question-line",
      }
    );
  },

  // Format application type for display
  formatType: (type) => {
    const typeMap = {
      PERSONAL: {
        label: "Personal Driver",
        icon: "ri-user-line",
        description: "Individual driver with personal vehicle",
      },
      BUSINESS: {
        label: "Business Driver",
        icon: "ri-building-line",
        description: "Business entity with multiple vehicles",
      },
    };
    return (
      typeMap[type] || {
        label: "Unknown",
        icon: "ri-question-line",
        description: "Unknown application type",
      }
    );
  },

  // Check if user can submit new application
  canSubmitNewApplication: (existingApplication) => {
    if (!existingApplication) return true;

    // User can submit new application if current one is rejected or not submitted
    return (
      existingApplication.status === "REJECTED" ||
      existingApplication.status === "NOT_SUBMITTED"
    );
  },

  // Check if application can be edited
  canEditApplication: (application) => {
    if (!application) return false;

    // Can only edit if status is NOT_SUBMITTED or REJECTED
    return (
      application.status === "NOT_SUBMITTED" ||
      application.status === "REJECTED"
    );
  },

  // Check if application can be cancelled
  canCancelApplication: (application) => {
    if (!application) return false;

    // Can only cancel if status is PENDING
    return application.status === "PENDING";
  },

  // Validate application data
  validateApplicationData: (data) => {
    const errors = [];

    if (!data.name || data.name.trim() === "") {
      errors.push("Name is required");
    }

    if (!data.email || data.email.trim() === "") {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Invalid email format");
    }

    if (!data.phone || data.phone.trim() === "") {
      errors.push("Phone number is required");
    } else if (!/^[0-9]{10,11}$/.test(data.phone.replace(/\s/g, ""))) {
      errors.push("Invalid phone number format");
    }

    if (!data.address || data.address.trim() === "") {
      errors.push("Address is required");
    }

    if (!data.identity || data.identity.trim() === "") {
      errors.push("Identity number is required");
    }

    if (!data.title || data.title.trim() === "") {
      errors.push("Application title is required");
    }

    if (!data.type || !["PERSONAL", "BUSINESS"].includes(data.type)) {
      errors.push("Valid application type is required");
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  },
};

// Export applicationAPI as applicationService for consistency
export const applicationService = applicationAPI;
export default apiClient;
