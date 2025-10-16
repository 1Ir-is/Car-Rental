import apiClient from "../context/apiClient";

// Vehicle API operations (public: khách/người thuê)
export const vehicleAPI = {
  // Lấy toàn bộ xe trên hệ thống
  getAllVehicles: async (status = null) => {
    try {
      let url = "/vehicles";
      if (status) {
        url += `?status=${status}`;
      }
      const response = await apiClient.get(url);
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

  // Lấy chỉ xe available cho khách hàng
  getAvailableVehicles: async () => {
    try {
      const response = await apiClient.get("/vehicles?status=available");
      return {
        success: true,
        data: response.data,
        message: "Available vehicles retrieved successfully",
      };
    } catch (error) {
      console.error("❌ Get available vehicles error:", error);
      // Fallback: nếu backend chưa hỗ trợ filter, thì filter ở frontend
      const allVehicles = await vehicleAPI.getAllVehicles();
      if (allVehicles.success) {
        const availableVehicles = allVehicles.data.filter(
          (vehicle) =>
            vehicle.status && vehicle.status.toLowerCase() === "available"
        );
        return {
          success: true,
          data: availableVehicles,
          message: "Available vehicles retrieved successfully (filtered)",
        };
      }
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to get available vehicles",
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
