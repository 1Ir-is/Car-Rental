import apiClient from "../context/apiClient";

// Vehicle API operations (public: khách/người thuê)
export const vehicleAPI = {
  // Lấy toàn bộ xe trên hệ thống
  getAllVehicles: async () => {
    try {
      const response = await apiClient.get("/vehicles");
      return {
        success: true,
        data: response.data,
        message: "Vehicles retrieved successfully",
      };
    } catch (error) {
      console.error("❌ Get all vehicles error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to get vehicles",
      };
    }
  },

  // Xem chi tiết xe bởi UUID
  getVehicleDetail: async (vehicleId) => {
    try {
      const response = await apiClient.get(`/vehicles/${vehicleId}`);
      return {
        success: true,
        data: response.data,
        message: "Vehicle detail retrieved successfully",
      };
    } catch (error) {
      console.error("❌ Get vehicle detail error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to get vehicle detail",
      };
    }
  },
};

// Export chuẩn để import: import { vehicleAPI } from "../services/vehicleService";
export const vehicleService = vehicleAPI;
