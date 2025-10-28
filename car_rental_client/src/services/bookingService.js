import apiClient from "../context/apiClient";

const bookingService = {
  async createBooking(bookingDTO) {
    try {
      const res = await apiClient.post("/bookings/create", bookingDTO);
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Đặt xe thất bại",
      };
    }
  },
};

export default bookingService;
