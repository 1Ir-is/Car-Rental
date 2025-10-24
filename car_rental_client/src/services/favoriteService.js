import apiClient from "../context/apiClient";

// Service for follow/unfollow/check and get all followed vehicles for a user
export const favoriteService = {
  // Kiểm tra user có follow xe này không
  async isVehicleFollowed(vehicleId, userId) {
    const res = await apiClient.get(
      `/vehicles/follow/${vehicleId}/is-following?userId=${userId}`
    );
    return res.data; // true/false
  },

  // Follow một xe
  async followVehicle(vehicleId, userId) {
    return apiClient.post(`/vehicles/follow/${vehicleId}?userId=${userId}`);
  },

  // Unfollow một xe
  async unfollowVehicle(vehicleId, userId) {
    return apiClient.delete(`/vehicles/follow/${vehicleId}?userId=${userId}`);
  },

  // Lấy tất cả xe đã follow của user hiện tại (KHÔNG truyền userId lên param, BE lấy từ Principal)
  async getFollowedVehicles() {
    // Không cần truyền userId lên query param nữa!
    return apiClient.get("/vehicles/follow/my-followed");
  },
};
