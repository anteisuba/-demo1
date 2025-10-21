import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081/api";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

export const authApi = {
  register(payload) {
    return apiClient.post("/auth/register", payload);
  },
  login(payload) {
    return apiClient.post("/auth/login", payload);
  },
  requestOtp(payload) {
    return apiClient.post("/auth/forgot-password/request-otp", payload);
  },
  verifyOtp(payload) {
    return apiClient.post("/auth/forgot-password/verify-otp", payload);
  },
  validateResetToken(token) {
    return apiClient.get("/auth/reset-password/validate", { params: { token } });
  },
  resetPassword(payload) {
    return apiClient.post("/auth/reset-password", payload);
  }
};

export const userApi = {
  fetchByIdentifier(identifier) {
    return apiClient.get(`/users/${encodeURIComponent(identifier)}`);
  }
};
