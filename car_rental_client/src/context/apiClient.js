import axios from "axios";
import { authUtils } from "../services/authService";
import { toast } from "react-toastify";
let sessionExpiredToastShown = false;

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!sessionExpiredToastShown) {
        toast.warning("Your session has expired. Please log in again.");
        sessionExpiredToastShown = true;
      }
      authUtils.clearAuthData();
      const path = window.location.pathname;
      if (!path.includes("/login") && !path.includes("/register")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
