import axios from "axios";

// Base API configuration
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // Note: multipart/form-data is set automatically by browser when sending FormData
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 120000,
});

// Interceptors (optional)
apiClient.interceptors.request.use(
  (config) => {
    console.log("🍪 Vehicle API Request:", config.url);
    return config;
  },
  (error) => Promise.reject(error)
);
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "❌ Vehicle API Error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

const vehicleService = {
  // Create a new vehicle (with Cloudinary upload)
  createVehicle: async (vehicleDTO, imageFiles) => {
    try {
      // Build FormData for multipart/form-data request
      const formData = new FormData();
      formData.append(
        "info",
        new Blob([JSON.stringify(vehicleDTO)], { type: "application/json" })
      );
      // Append images (max 5)
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await apiClient.post("/owner/vehicles", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return {
        success: true,
        data: response.data,
        message: "Vehicle added successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to add vehicle",
      };
    }
  },

  // Get all vehicles by owner
  getMyVehicles: async (userId) => {
    try {
      const response = await apiClient.get(
        `/owner/vehicles/my?userId=${userId}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to fetch vehicles",
      };
    }
  },

  // Get vehicle detail
  getVehicleDetail: async (vehicleId) => {
    try {
      const response = await apiClient.get(`/owner/vehicles/${vehicleId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to fetch vehicle detail",
      };
    }
  },

  // Update vehicle
  updateVehicle: async (vehicleId, vehicleDTO, imageFiles) => {
    try {
      const formData = new FormData();
      formData.append(
        "info",
        new Blob([JSON.stringify(vehicleDTO)], { type: "application/json" })
      );
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await apiClient.put(
        `/owner/vehicles/${vehicleId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Vehicle updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to update vehicle",
      };
    }
  },

  // Delete vehicle
  deleteVehicle: async (vehicleId) => {
    try {
      await apiClient.delete(`/owner/vehicles/${vehicleId}`);
      return { success: true, message: "Vehicle deleted successfully" };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to delete vehicle",
      };
    }
  },

  // Optional: Upload images only (if needed)
  uploadImages: async (imageFiles) => {
    try {
      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append("files", file);
      });
      const response = await apiClient.post(
        "/owner/vehicles/upload-images",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return {
        success: true,
        urls: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to upload images",
      };
    }
  },
};

export default vehicleService;
