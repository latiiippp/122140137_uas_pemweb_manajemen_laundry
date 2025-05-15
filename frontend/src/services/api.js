import axios from "axios";

const API_URL = "http://localhost:6543/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth interceptor - ubah localStorage menjadi sessionStorage
api.interceptors.request.use((config) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Basic ${user.token}`;
  }
  return config;
});

export default api;
